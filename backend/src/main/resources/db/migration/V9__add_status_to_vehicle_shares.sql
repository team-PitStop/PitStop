-- US-20: Add status to track pending/accepted invites
ALTER TABLE vehicle_shares ADD COLUMN status VARCHAR(20) NOT NULL DEFAULT 'PENDING';