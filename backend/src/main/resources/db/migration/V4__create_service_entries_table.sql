CREATE TABLE service_entries (
    id BIGSERIAL PRIMARY KEY,
    vehicle_id BIGINT NOT NULL REFERENCES vehicles(id),
    service_type VARCHAR(50) NOT NULL,
    service_date DATE NOT NULL,
    mileage INTEGER NOT NULL,
    cost NUMERIC(10,2) NOT NULL,
    notes TEXT
);
