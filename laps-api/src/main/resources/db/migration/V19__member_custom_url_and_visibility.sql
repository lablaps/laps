-- Custom URL + per-field contact visibility for the self-service portal.
--
-- custom_url / custom_url_label: one free-form link the member curates (personal
-- site, ORCID, ResearchGate, portfolio…). The label is what renders as the link
-- text; when blank the UI falls back to a generic "Site" caption.
--
-- show_*: per-field opt-out, enforced by the API (see MemberPublicView) rather
-- than as a client-side cosmetic.
--
-- The link flags default TRUE: a LinkedIn or Lattes URL is published on purpose,
-- so defaulting them hidden would retroactively blank profiles that read fine
-- today.
--
-- show_email defaults FALSE. That column governs the *login* address ("email de
-- login e recuperação" in the portal), not the separately-editable public
-- contact address. Publishing a credential identifier to anonymous callers by
-- default is the wrong posture for a roster covered by the LGPD, so members opt
-- in instead of opting out. Members who want a public address fill in
-- contact_email, which the profile page prefers anyway.

ALTER TABLE member ADD COLUMN custom_url         varchar(500);
ALTER TABLE member ADD COLUMN custom_url_label   varchar(60);

ALTER TABLE member ADD COLUMN show_email         boolean NOT NULL DEFAULT FALSE;
ALTER TABLE member ADD COLUMN show_contact_email boolean NOT NULL DEFAULT TRUE;
ALTER TABLE member ADD COLUMN show_linkedin      boolean NOT NULL DEFAULT TRUE;
ALTER TABLE member ADD COLUMN show_lattes        boolean NOT NULL DEFAULT TRUE;
ALTER TABLE member ADD COLUMN show_github        boolean NOT NULL DEFAULT TRUE;
ALTER TABLE member ADD COLUMN show_custom_url    boolean NOT NULL DEFAULT TRUE;
