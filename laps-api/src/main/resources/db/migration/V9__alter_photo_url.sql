-- Expand photo_url to TEXT so base64 data: URLs (or long CDN URLs) fit cleanly.
ALTER TABLE member ALTER COLUMN photo_url TYPE TEXT;
