-- Undergraduate course the member came through.
--
-- Stored as the enum name (COMPUTER_ENGINEERING / ARTIFICIAL_INTELLIGENCE) to
-- match @Enumerated(EnumType.STRING) on Member#undergradProgram. Nullable: the
-- course is unknown for the existing roster and irrelevant for staff, and a
-- NOT NULL default would assert Computer Engineering for people who never
-- studied it.
--
-- Deliberately not constrained to UNDERGRAD members — a master's or doctoral
-- student still has an originating bachelor's, and the lab wants to see which
-- pipeline its researchers came from.

ALTER TABLE member ADD COLUMN undergrad_program varchar(40);
