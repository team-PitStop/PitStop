package com.pitstop.backend.maintenance;

import java.math.BigDecimal;
import java.time.LocalDate;

/**
 * DTO for service entries that includes the creator's email.
 */
public class ServiceEntryDTO {
    private Long id;
    private Long vehicleId;
    private String serviceType;
    private LocalDate serviceDate;
    private int mileage;
    private BigDecimal cost;
    private String notes;
    private Long createdBy;
    private String createdByEmail;

    public ServiceEntryDTO(Long id, Long vehicleId, String serviceType, LocalDate serviceDate,
                           int mileage, BigDecimal cost, String notes, Long createdBy, String createdByEmail) {
        this.id = id;
        this.vehicleId = vehicleId;
        this.serviceType = serviceType;
        this.serviceDate = serviceDate;
        this.mileage = mileage;
        this.cost = cost;
        this.notes = notes;
        this.createdBy = createdBy;
        this.createdByEmail = createdByEmail;
    }

    public Long getId() {
        return id;
    }

    public Long getVehicleId() {
        return vehicleId;
    }

    public String getServiceType() {
        return serviceType;
    }

    public LocalDate getServiceDate() {
        return serviceDate;
    }

    public int getMileage() {
        return mileage;
    }

    public BigDecimal getCost() {
        return cost;
    }

    public String getNotes() {
        return notes;
    }

    public Long getCreatedBy() {
        return createdBy;
    }

    public String getCreatedByEmail() {
        return createdByEmail;
    }
}
