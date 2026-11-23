-- Lets a member describe what they actually did on a project, distinct from
-- the coarse LEAD/CO_LEAD/RESEARCHER role label. Free text, self-service,
-- shown on the public project page next to the member's name.
--
-- Nullable: every existing member_project row predates this field, and a
-- blank contribution is meaningful ("hasn't written one yet"), not an error.
ALTER TABLE member_project ADD COLUMN contribution VARCHAR(1000);
