-- US-16: Share a Vehicle with Another User
-- Links a vehicle to a collaborator (the user it was shared WITH).
CREATE TABLE vehicle_shares (
    id          BIGSERIAL PRIMARY KEY,
    vehicle_id  BIGINT NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
    user_id     BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (vehicle_id, user_id)
);
