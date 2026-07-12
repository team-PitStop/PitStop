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
import java.util.Map;

@RestController
@RequestMapping("/api/vehicles")
@CrossOrigin(origins = "http://localhost:5173")
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

    @GetMapping("/grid")
    public List<VehicleGridDTO> getVehicleGrid(Authentication authentication) {
        Long userId = getUserId(authentication);
        List<VehicleGridDTO> grid = new ArrayList<>();

        // 1. Vehicles I own
        for (Vehicle vehicle : repo.findByUserId(userId)) {
            grid.add(new VehicleGridDTO(vehicle, false));
        }

        // 2. Vehicles shared with me (ONLY IF ACCEPTED)
        for (VehicleShare share : shareRepository.findByUserIdAndStatus(userId, "ACCEPTED")) {
            repo.findById(share.getVehicleId())
                    .ifPresent(vehicle -> grid.add(new VehicleGridDTO(vehicle, true)));
        }
        return grid;
    }

    // US-20: Get invitations the current user hasn't accepted yet
    @GetMapping("/invitations/pending")
    public List<Map<String, Object>> getPendingInvitations(Authentication authentication) {
        Long userId = getUserId(authentication);
        List<VehicleShare> pending = shareRepository.findByUserIdAndStatus(userId, "PENDING");
        
        List<Map<String, Object>> result = new ArrayList<>();
        for (VehicleShare share : pending) {
            Vehicle v = repo.findById(share.getVehicleId()).orElse(null);
            if (v != null) {
                User owner = userRepository.findById(v.getUserId()).orElse(null);
                result.add(Map.of(
                    "inviteId", share.getId(),
                    "vehicleName", v.getYear() + " " + v.getMake() + " " + v.getModel(),
                    "ownerEmail", owner != null ? owner.getEmail() : "Unknown"
                ));
            }
        }
        return result;
    }

    // US-20: Accept invitation
    @PostMapping("/invitations/{inviteId}/accept")
    public ResponseEntity<Void> acceptInvite(@PathVariable Long inviteId, Authentication authentication) {
        Long userId = getUserId(authentication);
        VehicleShare share = shareRepository.findByIdAndUserId(inviteId, userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Invite not found"));
        
        share.setStatus("ACCEPTED");
        shareRepository.save(share);
        return ResponseEntity.ok().build();
    }

    // US-20: Decline invitation
    @DeleteMapping("/invitations/{inviteId}/decline")
    public ResponseEntity<Void> declineInvite(@PathVariable Long inviteId, Authentication authentication) {
        Long userId = getUserId(authentication);
        VehicleShare share = shareRepository.findByIdAndUserId(inviteId, userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Invite not found"));
        
        shareRepository.delete(share);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/share")
    public ResponseEntity<Void> share(@PathVariable Long id, @RequestBody ShareRequest request, Authentication authentication) {
        Long ownerId = getUserId(authentication);
        repo.findByIdAndUserId(id, ownerId).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));

        User recipient = userRepository.findByEmail(request.email().trim())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "No user with that email"));

        if (recipient.getId().equals(ownerId)) throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "You already own this");
        if (shareRepository.existsByVehicleIdAndUserId(id, recipient.getId())) 
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Already shared");

        shareRepository.save(new VehicleShare(id, recipient.getId()));
        return ResponseEntity.status(HttpStatus.CREATED).build();
    }

    @GetMapping("/{id}/collaborators")
    public List<VehicleCollaboratorDTO> getCollaborators(@PathVariable Long id, Authentication authentication) {
        Long reqId = getUserId(authentication);
        Vehicle vehicle = repo.findByIdAndUserId(id, reqId).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));
        List<VehicleCollaboratorDTO> result = new ArrayList<>();
        User owner = userRepository.findById(vehicle.getUserId()).orElseThrow();
        result.add(new VehicleCollaboratorDTO(owner.getId(), owner.getEmail(), "OWNER"));
        for (VehicleShare share : shareRepository.findByVehicleId(id)) {
            userRepository.findById(share.getUserId()).ifPresent(u -> 
                result.add(new VehicleCollaboratorDTO(u.getId(), u.getEmail(), share.getStatus().equals("ACCEPTED") ? "MEMBER" : "PENDING")));
        }
        return result;
    }

    @DeleteMapping("/{id}/collaborators/{userId}")
    public ResponseEntity<Void> removeCollaborator(@PathVariable Long id, @PathVariable Long userId, Authentication authentication) {
        repo.findByIdAndUserId(id, getUserId(authentication)).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));
        shareRepository.deleteByVehicleIdAndUserId(id, userId);
        return ResponseEntity.noContent().build();
    }

    @PostMapping
    public Vehicle add(@RequestBody Vehicle vehicle, Authentication authentication) {
        vehicle.setUserId(getUserId(authentication));
        return repo.save(vehicle);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Vehicle> getById(@PathVariable Long id, Authentication authentication) {
        return repo.findByIdAndUserId(id, getUserId(authentication)).map(ResponseEntity::ok).orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}")
    public ResponseEntity<Vehicle> update(@PathVariable Long id, @RequestBody Vehicle updated, Authentication authentication) {
        return repo.findByIdAndUserId(id, getUserId(authentication)).map(v -> {
            v.setMake(updated.getMake()); v.setModel(updated.getModel()); v.setYear(updated.getYear());
            v.setMileage(updated.getMileage()); v.setNickname(updated.getNickname()); v.setLicensePlate(updated.getLicensePlate());
            return ResponseEntity.ok(repo.save(v));
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id, Authentication authentication) {
        return repo.findByIdAndUserId(id, getUserId(authentication)).map(v -> {
            repo.delete(v); return ResponseEntity.noContent().<Void>build();
        }).orElse(ResponseEntity.notFound().build());
    }
}