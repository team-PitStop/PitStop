package com.pitstop.backend.vehicle;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.time.OffsetDateTime;

/**
 * US-16: Share a Vehicle with Another User.
 * One row = one vehicle shared WITH one user (the collaborator). Mirrors the
 * {@code vehicle_shares} table created by {@code V7__create_vehicle_shares_table.sql}.
 */
@Entity
@Table(name = "vehicle_shares")
public class VehicleShare {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "vehicle_id", nullable = false)
    private Long vehicleId;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    // Set by the database default (now()); never written by the app.
    @Column(name = "created_at", nullable = false, insertable = false, updatable = false)
    private OffsetDateTime createdAt;

    protected VehicleShare() {
        // Required by JPA.
    }

    public VehicleShare(Long vehicleId, Long userId) {
        this.vehicleId = vehicleId;
        this.userId = userId;
    }

    public Long getId() {
        return id;
    }

    public Long getVehicleId() {
        return vehicleId;
    }

    public void setVehicleId(Long vehicleId) {
        this.vehicleId = vehicleId;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public OffsetDateTime getCreatedAt() {
        return createdAt;
    }
}
