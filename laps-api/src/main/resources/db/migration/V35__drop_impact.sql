-- V35 — Remove the Impacts feature (table `impact`, created by V32)
--
-- Decision of 2026-11-14: prizes and scholarships are published as news
-- (V34) tagged AWARD or SCHOLARSHIP, with NATIONAL / INTERNATIONAL saying
-- where they came from. "Prêmios e Bolsas" is now that filtered news feed, so
-- the per-member impact records — a dozen structured fields per entry, and an
-- API of their own — have no reader left. The application code was removed in
-- the same change.
--
-- CONSEQUENCE: this deletes every impact row, in every environment it runs
-- in. It was deliberately NOT migrated into news: the lab chose to remove the
-- records entirely rather than convert them. Anything worth keeping must be
-- re-published as a news item from the Central de Comando.
--
-- IF EXISTS keeps this re-runnable against a database that never had V32's
-- table (a fresh install still runs V32 first, so in practice it always exists).

DROP TABLE IF EXISTS impact;
