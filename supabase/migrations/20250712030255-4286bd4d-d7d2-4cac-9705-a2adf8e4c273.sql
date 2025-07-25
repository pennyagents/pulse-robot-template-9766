
-- Add approved_date column to registrations table to track when registration was approved
ALTER TABLE registrations 
ADD COLUMN approved_date TIMESTAMP WITH TIME ZONE;

-- Update existing approved registrations to set approved_date to updated_at if status is approved
UPDATE registrations 
SET approved_date = updated_at 
WHERE status = 'approved' AND approved_date IS NULL;
