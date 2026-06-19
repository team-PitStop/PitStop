package com.pitstop.backend.upcoming;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface UpcomingMaintenanceRepository extends JpaRepository<UpcomingMaintenance, Long> {

    java.util.List<UpcomingMaintenance> findByVehicleId(Long vehicleId);
}