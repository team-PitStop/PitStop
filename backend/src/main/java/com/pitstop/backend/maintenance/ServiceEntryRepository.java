package com.pitstop.backend.maintenance;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ServiceEntryRepository extends JpaRepository<ServiceEntry, Long> {

    List<ServiceEntry> findByVehicleIdOrderByServiceDateDesc(Long vehicleId);

    @Query("SELECT new com.pitstop.backend.maintenance.ServiceEntryDTO(" +
           "se.id, se.vehicleId, se.serviceType, se.serviceDate, se.mileage, se.cost, se.notes, " +
           "se.createdBy, u.email) " +
           "FROM ServiceEntry se " +
           "JOIN User u ON se.createdBy = u.id " +
           "WHERE se.vehicleId = :vehicleId " +
           "ORDER BY se.serviceDate DESC")
    List<ServiceEntryDTO> findByVehicleIdWithCreatorOrderByServiceDateDesc(Long vehicleId);
}
