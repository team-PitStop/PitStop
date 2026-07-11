package com.pitstop.backend.maintenance;
import com.pitstop.backend.user.UserRepository;
import com.pitstop.backend.vehicle.VehicleRepository;
import com.pitstop.backend.vehicle.VehicleShareRepository;
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
    private final VehicleShareRepository shareRepository;
    private final UserRepository userRepository;

    public ServiceEntryController(ServiceEntryRepository repo, VehicleRepository vehicleRepository, 
                                 VehicleShareRepository shareRepository, UserRepository userRepository) {
        this.repo = repo;
        this.vehicleRepository = vehicleRepository;
        this.shareRepository = shareRepository;
        this.userRepository = userRepository;
    }

    private Long getUserId(Authentication authentication) {
        return userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED))
                .getId();
    }

    /**
     * Checks if the user is the vehicle owner.
     */
    private boolean isVehicleOwner(long vehicleId, long userId) {
        return vehicleRepository.findByIdAndUserId(vehicleId, userId).isPresent();
    }

    /**
     * Checks if the user is a collaborator (has the vehicle shared with them).
     */
    private boolean isVehicleCollaborator(long vehicleId, long userId) {
        return shareRepository.existsByVehicleIdAndUserId(vehicleId, userId);
    }

    /**
     * Ensures the user can view and create entries for a vehicle (owner or collaborator).
     */
    private void ensureCanViewAndCreate(long vehicleId, long userId) {
        boolean isOwner = isVehicleOwner(vehicleId, userId);
        boolean isCollaborator = isVehicleCollaborator(vehicleId, userId);
        
        if (!isOwner && !isCollaborator) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND);
        }
    }

    /**
     * Ensures the user is the vehicle owner (required for edit/delete operations).
     */
    private void ensureIsOwner(long vehicleId, long userId) {
        if (!isVehicleOwner(vehicleId, userId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Only the vehicle owner can modify service entries");
        }
    }

    // US-6: List all service entries for a vehicle (with creator info)
    @GetMapping
    public List<ServiceEntryDTO> list(@PathVariable Long vehicleId, Authentication authentication) {
        Long userId = getUserId(authentication);
        ensureCanViewAndCreate(vehicleId, userId);
        return repo.findByVehicleIdWithCreatorOrderByServiceDateDesc(vehicleId);
    }

    // US-6: Add a new service entry (owner or collaborator can add)
    @PostMapping
    public ServiceEntryDTO add(@PathVariable Long vehicleId, @RequestBody ServiceEntry serviceEntry, Authentication authentication) {
        Long userId = getUserId(authentication);
        ensureCanViewAndCreate(vehicleId, userId);
        
        serviceEntry.setId(null);
        serviceEntry.setVehicleId(vehicleId);
        serviceEntry.setCreatedBy(userId);
        
        vehicleRepository.findById(vehicleId).ifPresent(vehicle -> {
            if (serviceEntry.getMileage() > vehicle.getMileage()) {
                vehicle.setMileage(serviceEntry.getMileage());
                vehicleRepository.save(vehicle);
            }
        });
        
        ServiceEntry saved = repo.save(serviceEntry);
        
        // Return DTO with creator email
        com.pitstop.backend.user.User creator = userRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR));
        
        return new ServiceEntryDTO(saved.getId(), saved.getVehicleId(), saved.getServiceType(), 
                                   saved.getServiceDate(), saved.getMileage(), saved.getCost(), 
                                   saved.getNotes(), saved.getCreatedBy(), creator.getEmail());
    }

    // ============================================================
    // US-8: GET a single service entry by its ID
    // ============================================================
    // Used by the edit form to pre-fill with existing data.
    // Accessible by owner and collaborators, but only owner can edit.
    @GetMapping("/{id}")
    public ServiceEntryDTO getById(@PathVariable Long vehicleId, @PathVariable Long id, Authentication authentication) {
        Long userId = getUserId(authentication);
        ensureCanViewAndCreate(vehicleId, userId);

        ServiceEntry entry = repo.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));

        if (!entry.getVehicleId().equals(vehicleId)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND);
        }

        com.pitstop.backend.user.User creator = userRepository.findById(entry.getCreatedBy())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR));
        
        return new ServiceEntryDTO(entry.getId(), entry.getVehicleId(), entry.getServiceType(), 
                                   entry.getServiceDate(), entry.getMileage(), entry.getCost(), 
                                   entry.getNotes(), entry.getCreatedBy(), creator.getEmail());
    }

    // ============================================================
    // US-8: UPDATE an existing service entry (Edit functionality)
    // ============================================================
    // Only the vehicle owner can edit.
    @PutMapping("/{id}")
    public ServiceEntryDTO update(
            @PathVariable Long vehicleId,
            @PathVariable Long id,
            @RequestBody ServiceEntry updated,
            Authentication authentication) {

        Long userId = getUserId(authentication);
        ensureIsOwner(vehicleId, userId);

        ServiceEntry entry = repo.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));

        if (!entry.getVehicleId().equals(vehicleId)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND);
        }

        entry.setServiceType(updated.getServiceType());
        entry.setServiceDate(updated.getServiceDate());
        entry.setMileage(updated.getMileage());
        entry.setCost(updated.getCost());
        entry.setNotes(updated.getNotes());

        ServiceEntry saved = repo.save(entry);
        
        com.pitstop.backend.user.User creator = userRepository.findById(entry.getCreatedBy())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR));
        
        return new ServiceEntryDTO(saved.getId(), saved.getVehicleId(), saved.getServiceType(), 
                                   saved.getServiceDate(), saved.getMileage(), saved.getCost(), 
                                   saved.getNotes(), saved.getCreatedBy(), creator.getEmail());
    }

    // ============================================================
    // US-8: DELETE a service entry
    // ============================================================
    // Only the vehicle owner can delete.
    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long vehicleId, @PathVariable Long id, Authentication authentication) {
        Long userId = getUserId(authentication);
        ensureIsOwner(vehicleId, userId);

        ServiceEntry entry = repo.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));

        if (!entry.getVehicleId().equals(vehicleId)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND);
        }

        repo.delete(entry);
    }
}
