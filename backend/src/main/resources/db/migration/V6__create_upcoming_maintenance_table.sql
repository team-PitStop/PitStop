CREATE TABLE upcoming_maintenance (
                                      id            BIGSERIAL PRIMARY KEY,
                                      vehicle_id    BIGINT NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
                                      service_type  VARCHAR(100) NOT NULL,
                                      due_date      DATE,
                                      due_mileage   INT,
                                      notes         TEXT
);