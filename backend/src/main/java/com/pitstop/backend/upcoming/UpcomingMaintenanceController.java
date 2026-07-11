package com.pitstop.backend.upcoming;

import com.pitstop.backend.maintenance.ServiceEntry;
import com.pitstop.backend.maintenance.ServiceEntryRepository;
import com.pitstop.backend.user.UserRepository;
import com.pitstop.backend.vehicle.Vehicle;
import com.pitstop.backend.vehicle.VehicleRepository;
import com.pitstop.backend.vehicle.VehicleShareRepository;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Comparator;
import java.util.List;

@RestController
@RequestMapping("/api/vehicles/{vehicleId}/upcoming-maintenance")
public class UpcomingMaintenanceController {

    private final UpcomingMaintenanceRepository repo;
    private final VehicleRepository vehicleRepository;
    private final VehicleShareRepository shareRepository;
    private final UserRepository userRepository;
    private final ServiceEntryRepository serviceEntryRepository;

    public UpcomingMaintenanceController(UpcomingMaintenanceRepository repo, VehicleRepository vehicleRepository, 
                                       VehicleShareRepository shareRepository, UserRepository userRepository, 
                                       ServiceEntryRepository serviceEntryRepository) {
        this.repo = repo;
        this.vehicleRepository = vehicleRepository;
        this.shareRepository = shareRepository;
        this.userRepository = userRepository;
        this.serviceEntryRepository = serviceEntryRepository;
    }

    private Long getUserId(Authentication authentication) {
        return userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED))
                .getId();
    }

    private boolean isVehicleOwner(long vehicleId, long userId) {
        return vehicleRepository.findByIdAndUserId(vehicleId, userId).isPresent();
    }

    private boolean isVehicleCollaborator(long vehicleId, long userId) {
        return shareRepository.existsByVehicleIdAndUserId(vehicleId, userId);
    }

    private void ensureCanView(long vehicleId, long userId) {
        boolean isOwner = isVehicleOwner(vehicleId, userId);
        boolean isCollaborator = isVehicleCollaborator(vehicleId, userId);
        if (!isOwner && !isCollaborator) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND);
        }
    }

    private void ensureOwner(long vehicleId, long userId) {
        if (!isVehicleOwner(vehicleId, userId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Only the vehicle owner can modify upcoming maintenance");
        }
    }

    // US-12: how far ahead an item counts as "due soon" (yellow) rather than just upcoming.
    private static final int DUE_SOON_DAYS = 30;
    private static final int DUE_SOON_MILES = 1000;

    @GetMapping
    public List<UpcomingMaintenanceDTO> list(@PathVariable Long vehicleId, Authentication authentication) {
        Long userId = getUserId(authentication);
        ensureCanView(vehicleId, userId);

        // Get the vehicle - for mileage info for status calculation
        Vehicle vehicle = vehicleRepository.findById(vehicleId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));

        LocalDate today = LocalDate.now();

        return repo.findByVehicleId(vehicleId).stream()
                .map(task -> new UpcomingMaintenanceDTO(
                        task.getId(),
                        task.getServiceType().replace("_", " "),
                        task.getDueDate(),
                        task.getDueMileage(),
                        task.getNotes(),
                        computeStatus(task, vehicle.getMileage(), today)))
                // US-12 acceptance: sort by soonest due -> overdue first, then due-soon,
                // then by nearest date, then by nearest mileage.
                .sorted(Comparator
                        .comparingInt((UpcomingMaintenanceDTO d) -> statusRank(d.getStatus()))
                        .thenComparing(UpcomingMaintenanceDTO::getDueDate,
                                Comparator.nullsLast(Comparator.naturalOrder()))
                        .thenComparing(UpcomingMaintenanceDTO::getDueMileage,
                                Comparator.nullsLast(Comparator.naturalOrder())))
                .toList();
    }

    private String computeStatus(UpcomingMaintenance task, int currentMileage, LocalDate today) {
        boolean overdueByMileage = task.getDueMileage() != null && currentMileage >= task.getDueMileage();
        boolean overdueByDate = task.getDueDate() != null && !task.getDueDate().isAfter(today);
        if (overdueByMileage || overdueByDate) {
            return "OVERDUE";
        }

        boolean dueSoonByMileage = task.getDueMileage() != null
                && task.getDueMileage() - currentMileage <= DUE_SOON_MILES;
        boolean dueSoonByDate = task.getDueDate() != null
                && !task.getDueDate().isAfter(today.plusDays(DUE_SOON_DAYS));
        if (dueSoonByMileage || dueSoonByDate) {
            return "DUE_SOON";
        }

        return "UPCOMING";
    }

    private int statusRank(String status) {
        return switch (status) {
            case "OVERDUE" -> 0;
            case "DUE_SOON" -> 1;
            default -> 2;
        };
    }

    @PostMapping
    public UpcomingMaintenance add(@PathVariable Long vehicleId, @RequestBody UpcomingMaintenance upcomingMaintenance, Authentication authentication) {
        ensureOwner(vehicleId, getUserId(authentication));
        upcomingMaintenance.setId(null);
        upcomingMaintenance.setVehicleId(vehicleId);
        return repo.save(upcomingMaintenance);
    }

    @PostMapping("/{itemId}/complete")
    public ServiceEntry complete(@PathVariable Long vehicleId,
                                 @PathVariable Long itemId,
                                 @RequestBody CompleteUpcomingMaintenanceRequest request,
                                 Authentication authentication) {
        long userId = getUserId(authentication);
        ensureOwner(vehicleId, userId);

        UpcomingMaintenance task = repo.findById(itemId)
                .filter(t -> t.getVehicleId().equals(vehicleId))
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));

        Vehicle vehicle = vehicleRepository.findById(vehicleId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));

        ServiceEntry serviceEntry = new ServiceEntry();
        serviceEntry.setVehicleId(vehicleId);
        serviceEntry.setServiceType(task.getServiceType().replace("_", " "));
        serviceEntry.setServiceDate(LocalDate.parse(request.getActualDate()));
        serviceEntry.setMileage(request.getActualMileage());
        serviceEntry.setCost(BigDecimal.valueOf(request.getActualCost()));
        serviceEntry.setNotes(task.getNotes());
        serviceEntry.setCreatedBy(userId);

        ServiceEntry savedEntry = serviceEntryRepository.save(serviceEntry);

        if (request.getActualMileage() > vehicle.getMileage()) {
            vehicle.setMileage(request.getActualMileage());
            vehicleRepository.save(vehicle);
        }

        repo.delete(task);
        return savedEntry;
    }

    public static class CompleteUpcomingMaintenanceRequest {
        private String actualDate;
        private int actualMileage;
        private double actualCost;

        public String getActualDate() {
            return actualDate;
        }

        public void setActualDate(String actualDate) {
            this.actualDate = actualDate;
        }

        public int getActualMileage() {
            return actualMileage;
        }

        public void setActualMileage(int actualMileage) {
            this.actualMileage = actualMileage;
        }

        public double getActualCost() {
            return actualCost;
        }

        public void setActualCost(double actualCost) {
            this.actualCost = actualCost;
        }
    }
}