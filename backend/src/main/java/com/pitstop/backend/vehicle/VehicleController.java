package com.pitstop.backend.vehicle;

import com.pitstop.backend.user.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@RestController
@RequestMapping("/api/vehicles")
public class VehicleController {

    private final VehicleRepository repo;
    private final UserRepository userRepository;

    public VehicleController(VehicleRepository repo, UserRepository userRepository) {
        this.repo = repo;
        this.userRepository = userRepository;
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
        return repo.findByUserId(getUserId(authentication)).stream()
                .map(VehicleGridDTO::new)
                .toList();
    }

    @PostMapping
    public Vehicle add(@RequestBody Vehicle vehicle, Authentication authentication) {
        vehicle.setUserId(getUserId(authentication));
        return repo.save(vehicle);
    }

    // US-5: GET a single vehicle by its ID
    @GetMapping("/{id}")
    public ResponseEntity<Vehicle> getById(@PathVariable Long id) {
        return repo.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // US-5: UPDATE an existing vehicle
    @PutMapping("/{id}")
    public ResponseEntity<Vehicle> update(@PathVariable Long id, @RequestBody Vehicle updated) {
        return repo.findById(id)
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

    // US-5: DELETE a vehicle
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        if (!repo.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        repo.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
