package com.pitstop.backend.vehicle;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/vehicles")
public class VehicleController {

    private final VehicleRepository repo;

    public VehicleController(VehicleRepository repo) {
        this.repo = repo;
    }

    @GetMapping
    public List<Vehicle> getAll() {
        return repo.findAll();
    }

    // ============================================================
    // US-4: GET vehicles in grid format
    // ============================================================
    // Returns a list of vehicles with only essential information
    // (id, year, make, model, mileage) optimized for grid display.
    @GetMapping("/grid")
    public List<VehicleGridDTO> getVehicleGrid() {
        return repo.findAll().stream()
                .map(VehicleGridDTO::new)
                .toList();
    }

    @PostMapping
    public Vehicle add(@RequestBody Vehicle vehicle) {
        return repo.save(vehicle);
    }

    // ============================================================
    // US-5: GET a single vehicle by its ID
    // ============================================================
    // Used by the edit form to pre-fill with existing data.
    @GetMapping("/{id}")
    public ResponseEntity<Vehicle> getById(@PathVariable Long id) {
        return repo.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // ============================================================
    // US-5: UPDATE an existing vehicle (Edit functionality)
    // ============================================================
    // Called when the user clicks "Save Changes" on the edit form.
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

    // ============================================================
    // US-5: DELETE a vehicle
    // ============================================================
    // Called when the user clicks "Yes, Delete" on the confirmation modal.
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        if (!repo.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        repo.deleteById(id);
        return ResponseEntity.noContent().build();
    }


}