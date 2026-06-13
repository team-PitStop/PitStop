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

    // Dylan's US-6: List all service entries for a vehicle
    @GetMapping
    public List<ServiceEntry> list(@PathVariable Long vehicleId, Authentication authentication) {
        ensureOwner(vehicleId, getUserId(authentication));
        return repo.findByVehicleIdOrderByServiceDateDesc(vehicleId);
    }

    // Dylan's US-6: Add a new service entry
    @PostMapping
    public ServiceEntry add(@PathVariable Long vehicleId, @RequestBody ServiceEntry serviceEntry, Authentication authentication) {
        ensureOwner(vehicleId, getUserId(authentication));
        serviceEntry.setId(null);
        serviceEntry.setVehicleId(vehicleId);
        vehicleRepository.findById(vehicleId).ifPresent(vehicle -> {
            if (serviceEntry.getMileage() > vehicle.getMileage()) {
                vehicle.setMileage(serviceEntry.getMileage());
                vehicleRepository.save(vehicle);
            }
        });
        return repo.save(serviceEntry);
    }

    // ============================================================
    // US-8: GET a single service entry by its ID
    // ============================================================
    // Used by the edit form to pre-fill with existing data.
    @GetMapping("/{id}")
    public ServiceEntry getById(@PathVariable Long vehicleId, @PathVariable Long id, Authentication authentication) {
        ensureOwner(vehicleId, getUserId(authentication));

        ServiceEntry entry = repo.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));

        if (!entry.getVehicleId().equals(vehicleId)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND);
        }

        return entry;
    }

    // ============================================================
    // US-8: UPDATE an existing service entry (Edit functionality)
    // ============================================================
    // Called when the user clicks "Save Changes" on the edit form.
    @PutMapping("/{id}")
    public ServiceEntry update(
            @PathVariable Long vehicleId,
            @PathVariable Long id,
            @RequestBody ServiceEntry updated,
            Authentication authentication) {

        ensureOwner(vehicleId, getUserId(authentication));

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

        return repo.save(entry);
    }

    // ============================================================
    // US-8: DELETE a service entry
    // ============================================================
    // Called when the user clicks "Yes, Delete" on the confirmation modal.
    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long vehicleId, @PathVariable Long id, Authentication authentication) {
        ensureOwner(vehicleId, getUserId(authentication));

        ServiceEntry entry = repo.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));

        if (!entry.getVehicleId().equals(vehicleId)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND);
        }

        repo.delete(entry);
    }
}
