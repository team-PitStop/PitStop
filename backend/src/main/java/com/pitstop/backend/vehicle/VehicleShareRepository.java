package com.pitstop.backend.vehicle;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface VehicleShareRepository extends JpaRepository<VehicleShare, Long> {

    List<VehicleShare> findByUserId(Long userId);

    boolean existsByVehicleIdAndUserId(Long vehicleId, Long userId);

}
