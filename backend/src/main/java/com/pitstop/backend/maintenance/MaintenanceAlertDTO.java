package com.pitstop.backend.maintenance;

/**
 * US-15: Overdue Alerts
 * DTO to send alert information to the dashboard.
 */
public class MaintenanceAlertDTO {
    private Long vehicleId;
    private String vehicleName;
    private String serviceType;
    private String reason; // "Mileage" or "Date"

    public MaintenanceAlertDTO(Long vehicleId, String vehicleName, String serviceType, String reason) {
        this.vehicleId = vehicleId;
        this.vehicleName = vehicleName;
        this.serviceType = serviceType;
        this.reason = reason;
    }

    public Long getVehicleId() { return vehicleId; }
    public String getVehicleName() { return vehicleName; }
    public String getServiceType() { return serviceType; }
    public String getReason() { return reason; }
}