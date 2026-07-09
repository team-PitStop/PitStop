package com.pitstop.backend.vehicle;

import com.pitstop.backend.user.User;
import com.pitstop.backend.user.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.ArrayList;
import java.util.List;

@RestController
@RequestMapping("/api/vehicles")
public class VehicleController {

    private final VehicleRepository repo;
    private final UserRepository userRepository;
    private final VehicleShareRepository shareRepository;

    public VehicleController(VehicleRepository repo, UserRepository userRepository,
                             VehicleShareRepository shareRepository) {
        this.repo = repo;
        this.userRepository = userRepository;
        this.shareRepository = shareRepository;
    }

    private Long getUserId(Authentication authentication) {
        return userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED))
                .getId();
    }

    @GetMapping
    public List<Vehicle> getAll(Authentication authentication) {
        return repo.findByUserId(getUserId(authentication));
    }

    @GetMapping("/grid")
    public List<VehicleGridDTO> getVehicleGrid(Authentication authentication) {
        Long userId = getUserId(authentication);

        List<VehicleGridDTO> grid = new ArrayList<>();
        // The user's own vehicles.
        for (Vehicle vehicle : repo.findByUserId(userId)) {
            grid.add(new VehicleGridDTO(vehicle, false));
        }
        // US-16: vehicles other users have shared WITH this user.
        for (VehicleShare share : shareRepository.findByUserId(userId)) {
            repo.findById(share.getVehicleId())
                    .ifPresent(vehicle -> grid.add(new VehicleGridDTO(vehicle, true)));
        }
        return grid;
    }

    // US-16: Share a vehicle with another user by their email.
    @PostMapping("/{id}/share")
    public ResponseEntity<Void> share(@PathVariable Long id,
                                      @RequestBody ShareRequest request,
                                      Authentication authentication) {
        Long ownerId = getUserId(authentication);

        // Only the owner of the vehicle may share it.
        repo.findByIdAndUserId(id, ownerId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Vehicle not found"));

        String email = request.email() == null ? "" : request.email().trim();
        User recipient = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "No user with that email"));

        if (recipient.getId().equals(ownerId)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "You already own this vehicle");
        }
        if (shareRepository.existsByVehicleIdAndUserId(id, recipient.getId())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Vehicle already shared with that user");
        }

        shareRepository.save(new VehicleShare(id, recipient.getId()));
        return ResponseEntity.status(HttpStatus.CREATED).build();
    }

    @GetMapping("/{id}/collaborators")
    public List<VehicleCollaboratorDTO> getCollaborators(@PathVariable Long id, Authentication authentication) {
        Long requesterId = getUserId(authentication);

        Vehicle vehicle = repo.findByIdAndUserId(id, requesterId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Vehicle not found"));

        List<VehicleCollaboratorDTO> result = new ArrayList<>();

        User owner = userRepository.findById(vehicle.getUserId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Owner not found"));
        result.add(new VehicleCollaboratorDTO(owner.getId(), owner.getEmail(), "OWNER"));

        for (VehicleShare share : shareRepository.findByVehicleId(id)) {
            userRepository.findById(share.getUserId())
                    .ifPresent(user -> result.add(new VehicleCollaboratorDTO(user.getId(), user.getEmail(), "MEMBER")));
        }

        return result;
    }

    @DeleteMapping("/{id}/collaborators/{userId}")
    public ResponseEntity<Void> removeCollaborator(@PathVariable Long id, @PathVariable Long userId,
                                                   Authentication authentication) {
        Long requesterId = getUserId(authentication);

        repo.findByIdAndUserId(id, requesterId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Vehicle not found"));

        shareRepository.deleteByVehicleIdAndUserId(id, userId);
        return ResponseEntity.noContent().build();
    }

    @PostMapping
    public Vehicle add(@RequestBody Vehicle vehicle, Authentication authentication) {
        vehicle.setUserId(getUserId(authentication));
        return repo.save(vehicle);
    }

    // US-5: GET a single vehicle by its ID (owner only)
    @GetMapping("/{id}")
    public ResponseEntity<Vehicle> getById(@PathVariable Long id, Authentication authentication) {
        return repo.findByIdAndUserId(id, getUserId(authentication))
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // US-5: UPDATE an existing vehicle (owner only)
    @PutMapping("/{id}")
    public ResponseEntity<Vehicle> update(@PathVariable Long id, @RequestBody Vehicle updated,
                                          Authentication authentication) {
        return repo.findByIdAndUserId(id, getUserId(authentication))
                .map(vehicle -> {
                    vehicle.setMake(updated.getMake());
                    vehicle.setModel(updated.getModel());
                    vehicle.setYear(updated.getYear());
                    vehicle.setMileage(updated.getMileage());
                    vehicle.setNickname(updated.getNickname());
                    vehicle.setLicensePlate(updated.getLicensePlate());
                    return ResponseEntity.ok(repo.save(vehicle));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    // US-5: DELETE a vehicle (owner only)
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id, Authentication authentication) {
        return repo.findByIdAndUserId(id, getUserId(authentication))
                .map(vehicle -> {
                    repo.delete(vehicle);
                    return ResponseEntity.noContent().<Void>build();
                })
                .orElse(ResponseEntity.notFound().build());
    }
}
