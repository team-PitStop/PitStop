-- Add created_by column to track who created each service entry
ALTER TABLE service_entries ADD COLUMN created_by BIGINT NOT NULL DEFAULT 1;

-- Add foreign key constraint to users table
ALTER TABLE service_entries ADD CONSTRAINT fk_service_entries_created_by 
  FOREIGN KEY (created_by) REFERENCES users(id);

-- Remove the default after adding the column to existing rows
ALTER TABLE service_entries ALTER COLUMN created_by DROP DEFAULT;
