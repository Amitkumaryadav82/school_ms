-- Create holidays table
CREATE TABLE IF NOT EXISTS holidays (
    id BIGSERIAL PRIMARY KEY,
    holiday_date DATE NOT NULL UNIQUE,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    type VARCHAR(20) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at on row update
CREATE TRIGGER update_holidays_updated_at
BEFORE UPDATE ON holidays
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Add indexes
CREATE INDEX idx_holidays_date ON holidays(holiday_date);
CREATE INDEX idx_holidays_type ON holidays(type);

-- Insert some default holidays for 2025
INSERT INTO holidays (holiday_date, name, description, type)
VALUES 
    ('2025-01-01', 'New Year''s Day', 'First day of the year', 'NATIONAL_HOLIDAY'),
    ('2025-12-25', 'Christmas', 'Christmas Day celebration', 'RELIGIOUS_HOLIDAY'),
    ('2025-06-26', 'School Foundation Day', 'Annual school foundation day', 'SCHOOL_FUNCTION')
ON CONFLICT (holiday_date) DO NOTHING;
