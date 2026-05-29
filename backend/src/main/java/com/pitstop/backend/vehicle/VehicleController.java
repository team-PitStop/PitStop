package com.pitstop.backend.vehicle;

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

    @PostMapping
    public Vehicle add(@RequestBody Vehicle vehicle) {
        return repo.save(vehicle);
    }
}