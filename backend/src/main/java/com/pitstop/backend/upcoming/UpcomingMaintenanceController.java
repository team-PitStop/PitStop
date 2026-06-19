package com.pitstop.backend.upcoming;

import com.pitstop.backend.user.UserRepository;
import com.pitstop.backend.vehicle.VehicleRepository;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

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

    @GetMapping
    public List<UpcomingMaintenance> list(@PathVariable Long vehicleId, Authentication authentication) {
        ensureOwner(vehicleId, getUserId(authentication));
        return repo.findByVehicleId(vehicleId);
    }

    @PostMapping
    public UpcomingMaintenance add(@PathVariable Long vehicleId, @RequestBody UpcomingMaintenance upcomingMaintenance, Authentication authentication) {
        ensureOwner(vehicleId, getUserId(authentication));
        upcomingMaintenance.setId(null);
        upcomingMaintenance.setVehicleId(vehicleId);
        return repo.save(upcomingMaintenance);
    }
}