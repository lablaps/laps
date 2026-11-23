-- When the member joined LAPS, at two granularities. Both nullable and
-- independent: a member may remember the semester but not the month, or the
-- reverse, and filling either is better than filling neither.
--
-- Distinct from current_role_started_at, which tracks the CURRENT role and is
-- rewritten on every promotion. Someone who joined as an undergrad in 2019 and
-- became a master's student in 2023 has current_role_started_at = 2023 but
-- joined LAPS in 2019 — there was previously no column that could say so.
--
-- joined_semester: Brazilian academic period, 'YYYY.1' or 'YYYY.2'.
-- joined_month:    ISO year-month, 'YYYY-MM'. Deliberately NOT a DATE — a DATE
--                  would force a day component that nobody supplies and that
--                  would then be rendered, implying precision we do not have.
--                  As text it also sorts correctly lexicographically.
--
-- Both formats are enforced by @Pattern on the request DTOs; the CHECK
-- constraints below are the backstop for anything written outside the API.

ALTER TABLE member ADD COLUMN joined_semester varchar(6);
ALTER TABLE member ADD COLUMN joined_month    varchar(7);

ALTER TABLE member ADD CONSTRAINT member_joined_semester_format
    CHECK (joined_semester IS NULL OR joined_semester ~ '^[0-9]{4}\.[12]$');

ALTER TABLE member ADD CONSTRAINT member_joined_month_format
    CHECK (joined_month IS NULL OR joined_month ~ '^[0-9]{4}-(0[1-9]|1[0-2])$');
