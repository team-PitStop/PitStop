package com.pitstop.backend.upcoming;

import com.pitstop.backend.user.UserRepository;
import com.pitstop.backend.vehicle.Vehicle;
import com.pitstop.backend.vehicle.VehicleRepository;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.util.Comparator;
import java.util.List;

@RestController
@RequestMapping("/api/vehicles/{vehicleId}/upcoming-maintenance")
public class UpcomingMaintenanceController {

    private final UpcomingMaintenanceRepository repo;
    private final VehicleRepository vehicleRepository;
    private final UserRepository userRepository;

    public UpcomingMaintenanceController(UpcomingMaintenanceRepository repo, VehicleRepository vehicleRepository, UserRepository userRepository) {
        this.repo = repo;
        this.vehicleRepository = vehicleRepository;
        this.userRepository = userRepository;
    }

    private Long getUserId(Authentication authentication) {
        return userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED))
                .getId();
    }

    private void ensureOwner(long vehicleId, long userId) {
        if (vehicleRepository.findByIdAndUserId(vehicleId, userId).isEmpty()) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND);
        }
    }

    // US-12: how far ahead an item counts as "due soon" (yellow) rather than just upcoming.
    private static final int DUE_SOON_DAYS = 30;
    private static final int DUE_SOON_MILES = 1000;

    @GetMapping
    public List<UpcomingMaintenanceDTO> list(@PathVariable Long vehicleId, Authentication authentication) {
        Vehicle vehicle = vehicleRepository.findByIdAndUserId(vehicleId, getUserId(authentication))
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
}