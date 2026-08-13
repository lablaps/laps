-- Custom URL + per-field contact visibility for the self-service portal.
--
-- custom_url / custom_url_label: one free-form link the member curates (personal
-- site, ORCID, ResearchGate, portfolio…). The label is what renders as the link
-- text; when blank the UI falls back to a generic "Site" caption.
--
-- show_*: per-field opt-out. Every flag defaults TRUE so this migration does not
-- retroactively hide anything that is already published — existing profiles keep
-- rendering exactly as they do today, and hiding becomes an explicit member
-- choice. The API is what enforces these (see MemberController#toPublicView);
-- they are not a client-side cosmetic.

ALTER TABLE member ADD COLUMN custom_url         varchar(500);
ALTER TABLE member ADD COLUMN custom_url_label   varchar(60);

ALTER TABLE member ADD COLUMN show_email         boolean NOT NULL DEFAULT TRUE;
ALTER TABLE member ADD COLUMN show_contact_email boolean NOT NULL DEFAULT TRUE;
ALTER TABLE member ADD COLUMN show_linkedin      boolean NOT NULL DEFAULT TRUE;
ALTER TABLE member ADD COLUMN show_lattes        boolean NOT NULL DEFAULT TRUE;
ALTER TABLE member ADD COLUMN show_github        boolean NOT NULL DEFAULT TRUE;
ALTER TABLE member ADD COLUMN show_custom_url    boolean NOT NULL DEFAULT TRUE;
