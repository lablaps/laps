-- The lab head was seeded in V4 as 'Ph.D Ewaldo Eder Santana'. The lab uses the
-- Portuguese honorific, so the display name becomes 'Dr. Ewaldo Eder Santana'
-- (this already matches laps-signal-lab/src/lib/team-data.ts).
--
-- V4 is deliberately left untouched. Flyway validates the checksum of every
-- applied migration, so editing V4 in place would make it refuse to start on
-- any database that already ran it — production included. A forward migration
-- is the only safe way to correct seeded data.
--
-- Matched on `slug`, the stable key, rather than on the old name: the row is
-- still found even if the name was edited by hand through the admin UI. The
-- IS DISTINCT FROM guard makes this a no-op (and leaves updated_at alone) when
-- the name is already correct.

UPDATE member
   SET full_name  = 'Dr. Ewaldo Eder Santana',
       updated_at = CURRENT_TIMESTAMP
 WHERE slug = 'ewaldo-eder-santana'
   AND full_name IS DISTINCT FROM 'Dr. Ewaldo Eder Santana';
