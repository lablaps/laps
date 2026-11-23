-- Language proficiency entries for each member.
-- Stored as a JSON array: [{"code":"en","level":"C1"},{"code":"ja","level":"N2"}]
-- Language codes follow ISO 639-1. Level values are system-specific strings
-- (CEFR: A1–C2, HSK: HSK1–HSK6, JLPT: N5–N1, TOPIK: TOPIK1–TOPIK6, universal: NATIVE).
-- The backend treats this column as opaque text; the frontend owns the schema.

ALTER TABLE member ADD COLUMN languages text;
