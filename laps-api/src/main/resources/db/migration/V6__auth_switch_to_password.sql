-- Replace Google OAuth sub with bcrypt password hash.
ALTER TABLE member DROP COLUMN google_sub;
ALTER TABLE member ADD COLUMN password_hash VARCHAR(255);
