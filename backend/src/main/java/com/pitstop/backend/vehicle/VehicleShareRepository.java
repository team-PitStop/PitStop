package com.pitstop.backend.vehicle;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface VehicleShareRepository extends JpaRepository<VehicleShare, Long> {

    List<VehicleShare> findByUserId(Long userId);

    // US-20: Find invites by user and status
    List<VehicleShare> findByUserIdAndStatus(Long userId, String status);

    boolean existsByVehicleIdAndUserId(Long vehicleId, Long userId);

    List<VehicleShare> findByVehicleId(Long vehicleId);

    void deleteByVehicleIdAndUserId(Long vehicleId, Long userId);
    
    // US-20: Helper for accept/decline logic
    Optional<VehicleShare> findByIdAndUserId(Long id, Long userId);
}