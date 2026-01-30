-- Migration to add image and GPS support
-- Add columns to accident_reports for image tracking
ALTER TABLE accident_reports 
ADD COLUMN IF NOT EXISTS image_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS gps_verified BOOLEAN DEFAULT FALSE;

-- Enhance accident_evidence table
ALTER TABLE accident_evidence
ADD COLUMN IF NOT EXISTS filename VARCHAR(255),
ADD COLUMN IF NOT EXISTS file_size INTEGER,
ADD COLUMN IF NOT EXISTS image_format VARCHAR(20),
ADD COLUMN IF NOT EXISTS exif_timestamp TIMESTAMP,
ADD COLUMN IF NOT EXISTS altitude DECIMAL(10, 2),
ADD COLUMN IF NOT EXISTS gps_verified BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS verified_at TIMESTAMP;

-- Create index for GPS verification
CREATE INDEX IF NOT EXISTS idx_gps_verified ON accident_evidence (gps_verified);
CREATE INDEX IF NOT EXISTS idx_report_id ON accident_evidence (report_id);

-- Add comment for tracking
COMMENT ON TABLE accident_evidence IS 'Stores image evidence with GPS-verified location data from EXIF';
COMMENT ON COLUMN accident_evidence.gps_verified IS 'True if GPS data from EXIF was validated';
