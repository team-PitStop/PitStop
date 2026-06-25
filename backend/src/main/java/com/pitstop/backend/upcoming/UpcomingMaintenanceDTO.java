package com.pitstop.backend.upcoming;

import java.time.LocalDate;

/**
 * US-12: View Upcoming Maintenance
 * Sends a vehicle's upcoming maintenance to the frontend along with a computed
 * urgency status ("OVERDUE", "DUE_SOON", or "UPCOMING") used to color-code the list.
 */
public class UpcomingMaintenanceDTO {
    private Long id;
    private String serviceType;
    private LocalDate dueDate;
    private Integer dueMileage;
    private String notes;
    private String status; // "OVERDUE", "DUE_SOON", or "UPCOMING"

    public UpcomingMaintenanceDTO(Long id, String serviceType, LocalDate dueDate,
                                  Integer dueMileage, String notes, String status) {
        this.id = id;
        this.serviceType = serviceType;
        this.dueDate = dueDate;
        this.dueMileage = dueMileage;
        this.notes = notes;
        this.status = status;
    }

    public Long getId() { return id; }
    public String getServiceType() { return serviceType; }
    public LocalDate getDueDate() { return dueDate; }
    public Integer getDueMileage() { return dueMileage; }
    public String getNotes() { return notes; }
    public String getStatus() { return status; }
}
