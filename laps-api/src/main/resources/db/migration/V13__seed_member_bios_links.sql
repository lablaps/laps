-- Promote bios + LinkedIn URLs that previously lived only in the bundled
-- frontend (laps-signal-lab/src/lib/team-data.ts) into the database, so the API
-- becomes the source of truth and team-data.ts can shrink to a photo/tag map.

UPDATE member SET
    linkedin_url = 'https://www.linkedin.com/in/ewaldo-santana-4383a874/',
    bio_pt = 'Chefe do Laboratório de Aquisição e Processamento de Sinais (LAPS) na UEMA.',
    bio_en = 'Head of the Laboratory of Signals Acquisition and Processing (LAPS) at UEMA.',
    bio_fr = 'Chef du Laboratoire d''Acquisition et Traitement des Signaux (LAPS) à l''UEMA.'
WHERE slug = 'ewaldo-eder-santana';

UPDATE member SET
    bio_pt = 'Engenharia da Computação (UEMA), pesquisador de Iniciação Científica no projeto CISMA / Dataearth.',
    bio_en = 'Computer Engineering (UEMA), Undergraduate researcher on the CISMA / Dataearth platform.',
    bio_fr = 'Génie Informatique (UEMA), chercheur de premier cycle sur la plateforme CISMA / Dataearth.'
WHERE slug = 'icaro-de-jesus-silva';
