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

    public VehicleGridDTO(Long id, int year, String make, String model, int mileage) {
        this.id = id;
        this.year = year;
        this.make = make;
        this.model = model;
        this.mileage = mileage;
    }

    public VehicleGridDTO(Vehicle vehicle) {
        this.id = vehicle.getId();
        this.year = vehicle.getYear();
        this.make = vehicle.getMake();
        this.model = vehicle.getModel();
        this.mileage = vehicle.getMileage();
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
}
