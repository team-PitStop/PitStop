package com.pitstop.backend.vehicle;

/**
 * US - 4: View My Garage
 * Data Transfer Object for displaying vehicles in a grid view.
 * Contains only the essential vehicle information needed for grid display.
 */
public class VehicleGridDTO {

    private Long id;
    private int year;
    private String make;
    private String model;
    private int mileage;
    // US-16: true when this vehicle was shared WITH the current user (they are a
    // collaborator, not the owner). False for the user's own vehicles.
    private boolean shared;

    public VehicleGridDTO(Long id, int year, String make, String model, int mileage) {
        this.id = id;
        this.year = year;
        this.make = make;
        this.model = model;
        this.mileage = mileage;
    }

    public VehicleGridDTO(Vehicle vehicle) {
        this(vehicle, false);
    }

    public VehicleGridDTO(Vehicle vehicle, boolean shared) {
        this.id = vehicle.getId();
        this.year = vehicle.getYear();
        this.make = vehicle.getMake();
        this.model = vehicle.getModel();
        this.mileage = vehicle.getMileage();
        this.shared = shared;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public int getYear() {
        return year;
    }

    public void setYear(int year) {
        this.year = year;
    }

    public String getMake() {
        return make;
    }

    public void setMake(String make) {
        this.make = make;
    }

    public String getModel() {
        return model;
    }

    public void setModel(String model) {
        this.model = model;
    }

    public int getMileage() {
        return mileage;
    }

    public void setMileage(int mileage) {
        this.mileage = mileage;
    }

    public boolean isShared() {
        return shared;
    }

    public void setShared(boolean shared) {
        this.shared = shared;
    }
}
