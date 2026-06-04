ALTER TABLE service_entries
    DROP CONSTRAINT service_entries_vehicle_id_fkey;

ALTER TABLE service_entries
    ADD CONSTRAINT service_entries_vehicle_id_fkey
        FOREIGN KEY (vehicle_id) REFERENCES vehicles(id) ON DELETE CASCADE;
