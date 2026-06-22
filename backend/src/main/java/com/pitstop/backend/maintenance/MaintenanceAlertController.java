package com.pitstop.backend.maintenance;

import com.pitstop.backend.upcoming.UpcomingMaintenance;
import com.pitstop.backend.upcoming.UpcomingMaintenanceRepository;
import com.pitstop.backend.user.UserRepository;
import com.pitstop.backend.vehicle.Vehicle;
import com.pitstop.backend.vehicle.VehicleRepository;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@RestController
@RequestMapping("/api/alerts")
@CrossOrigin(origins = "http://localhost:5173")
public class MaintenanceAlertController {

    private final VehicleRepository vehicleRepository;
    private final UpcomingMaintenanceRepository upcomingRepo;
    private final UserRepository userRepository;

    public MaintenanceAlertController(VehicleRepository vehicleRepository, 
                                    UpcomingMaintenanceRepository upcomingRepo, 
                                    UserRepository userRepository) {
        this.vehicleRepository = vehicleRepository;
        this.upcomingRepo = upcomingRepo;
        this.userRepository = userRepository;
    }

    @GetMapping("/overdue")
    public List<MaintenanceAlertDTO> getOverdueAlerts(Authentication authentication) {
        // 1. Get the current user
        Long userId = userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED))
                .getId();

        // 2. Get all vehicles for this user
        List<Vehicle> userVehicles = vehicleRepository.findByUserId(userId);
        List<MaintenanceAlertDTO> alerts = new ArrayList<>();
        LocalDate today = LocalDate.now();

        // 3. Check each vehicle for upcoming maintenance that is past due
        for (Vehicle vehicle : userVehicles) {
            List<UpcomingMaintenance> tasks = upcomingRepo.findByVehicleId(vehicle.getId());
            
            for (UpcomingMaintenance task : tasks) {
                boolean overdueByMileage = (task.getDueMileage() != null && vehicle.getMileage() >= task.getDueMileage());
                boolean overdueByDate = (task.getDueDate() != null && (task.getDueDate().isBefore(today) || task.getDueDate().isEqual(today)));

                if (overdueByMileage || overdueByDate) {
                    String reason = overdueByMileage ? "Mileage" : "Date";
                    String carName = vehicle.getYear() + " " + vehicle.getMake() + " " + vehicle.getModel();
                    
                    alerts.add(new MaintenanceAlertDTO(
                        vehicle.getId(), 
                        carName, 
                        task.getServiceType().replace("_", " "), 
                        reason
                    ));
                }
            }
        }
        return alerts;
    }
}