package com.pitstop.backend.maintenance;

import com.pitstop.backend.user.UserRepository;
import com.pitstop.backend.vehicle.VehicleRepository;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@RestController
@RequestMapping("/api/vehicles/{vehicleId}/service-entries")
public class ServiceEntryController {

    private final ServiceEntryRepository repo;
    private final VehicleRepository vehicleRepository;
    private final UserRepository userRepository;

    public ServiceEntryController(ServiceEntryRepository repo, VehicleRepository vehicleRepository, UserRepository userRepository) {
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
    public List<ServiceEntry> list(@PathVariable Long vehicleId, Authentication authentication) {
        ensureOwner(vehicleId, getUserId(authentication));
        return repo.findByVehicleIdOrderByServiceDateDesc(vehicleId);
    }

    @PostMapping
    public ServiceEntry add(@PathVariable Long vehicleId, @RequestBody ServiceEntry serviceEntry, Authentication authentication) {
        ensureOwner(vehicleId, getUserId(authentication));
        serviceEntry.setId(null);
        serviceEntry.setVehicleId(vehicleId);
        return repo.save(serviceEntry);
    }
}
