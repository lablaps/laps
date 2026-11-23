-- Adds per-member profile customisation fields that the self-service portal exposes.
-- areas:         comma-separated area slugs/labels the member curates themselves.
-- interests:     comma-separated free-text interest tags.
-- banner_color:  hex colour (e.g. #0B4E8D) used as the start of the hero gradient.
-- banner_image_url: optional uploaded cover image that replaces the gradient.

ALTER TABLE member ADD COLUMN areas text;
ALTER TABLE member ADD COLUMN interests text;
ALTER TABLE member ADD COLUMN banner_color varchar(50);
ALTER TABLE member ADD COLUMN banner_image_url text;
