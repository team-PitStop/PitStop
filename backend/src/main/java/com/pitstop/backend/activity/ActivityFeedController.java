package com.pitstop.backend.activity;

import com.pitstop.backend.maintenance.ServiceEntry;
import com.pitstop.backend.maintenance.ServiceEntryRepository;
import com.pitstop.backend.user.UserRepository;
import com.pitstop.backend.vehicle.VehicleRepository;
import com.pitstop.backend.vehicle.VehicleShareRepository;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.stream.Collectors;

/**
 * US-19: Activity Feed for a Shared Vehicle.
 *
 * GET /api/vehicles/{vehicleId}/activity
 * Returns the last 10 service entries logged for a vehicle,
 * showing who logged each one and when. Accessible by both
 * the vehicle owner and any collaborators.
 */
@RestController
@RequestMapping("/api/vehicles/{vehicleId}/activity")
public class ActivityFeedController {

    private final ServiceEntryRepository serviceEntryRepository;
    private final VehicleRepository vehicleRepository;
    private final VehicleShareRepository shareRepository;
    private final UserRepository userRepository;

    public ActivityFeedController(
            ServiceEntryRepository serviceEntryRepository,
            VehicleRepository vehicleRepository,
            VehicleShareRepository shareRepository,
            UserRepository userRepository) {
        this.serviceEntryRepository = serviceEntryRepository;
        this.vehicleRepository = vehicleRepository;
        this.shareRepository = shareRepository;
        this.userRepository = userRepository;
    }

    private Long getUserId(Authentication authentication) {
        return userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED))
                .getId();
    }

    private boolean isOwner(long vehicleId, long userId) {
        return vehicleRepository.findByIdAndUserId(vehicleId, userId).isPresent();
    }

    private boolean isCollaborator(long vehicleId, long userId) {
        return shareRepository.existsByVehicleIdAndUserId(vehicleId, userId);
    }

    @GetMapping
    public List<ActivityFeedDTO> getActivity(
            @PathVariable Long vehicleId,
            Authentication authentication) {

        Long userId = getUserId(authentication);

        if (!isOwner(vehicleId, userId) && !isCollaborator(vehicleId, userId)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND);
        }

        List<ServiceEntry> entries = serviceEntryRepository
                .findByVehicleIdOrderByServiceDateDesc(vehicleId)
                .stream()
                .limit(10)
                .collect(Collectors.toList());

        return entries.stream().map(entry -> {
            String performedBy = userRepository.findById(entry.getCreatedBy())
                    .map(user -> user.getEmail())
                    .orElse("Unknown user");

            String actionType = "Logged " + entry.getServiceType().replace("_", " ");

            return new ActivityFeedDTO(
                    entry.getId(),
                    actionType,
                    performedBy,
                    entry.getServiceDate()
            );
        }).collect(Collectors.toList());
    }
}
