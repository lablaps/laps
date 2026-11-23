-- Publications snapshot. Source: laps-signal-lab/src/lib/publications-data.ts
-- Postgres rewrite: deterministic UUIDs (gen_random_uuid()-free for repeatability).

-- 1. GAN Histological 2025
INSERT INTO publication (id, title, venue, year, doi, type, status) VALUES
  ('11111111-0001-0000-0000-000000000001',
   'Generative Adversarial Networks in Histological Image Segmentation: A Systematic Literature Review',
   'Applied Sciences (MDPI)', 2025, '10.3390/app15147802', 'JOURNAL', 'PUBLISHED');
INSERT INTO authorship (publication_id, member_id, external_author_name, author_order, author_role)
SELECT '11111111-0001-0000-0000-000000000001'::uuid, m.id, NULL, 1, 'AUTHOR' FROM member m WHERE m.slug = 'antonio-fhillipi-maciel-silva'
UNION ALL
SELECT '11111111-0001-0000-0000-000000000001'::uuid, m.id, NULL, 2, 'AUTHOR' FROM member m WHERE m.slug = 'ewaldo-eder-santana'
UNION ALL
SELECT '11111111-0001-0000-0000-000000000001'::uuid, NULL, 'Daniel G. Costa (Univ. Porto)', 3, 'AUTHOR';

-- 2. EvoImp PLoS One 2024
INSERT INTO publication (id, title, venue, year, type, status) VALUES
  ('11111111-0002-0000-0000-000000000002',
   'EvoImp: Multiple Imputation of Multi-label Classification data with a genetic algorithm',
   'PLoS One, v.19, e0297147', 2024, 'JOURNAL', 'PUBLISHED');
INSERT INTO authorship (publication_id, member_id, external_author_name, author_order, author_role)
SELECT '11111111-0002-0000-0000-000000000002'::uuid, m.id, NULL, 1, 'AUTHOR' FROM member m WHERE m.slug = 'fabricio-almeida-do-carmo'
UNION ALL
SELECT '11111111-0002-0000-0000-000000000002'::uuid, NULL, 'Jacob Jr.', 2, 'AUTHOR'
UNION ALL
SELECT '11111111-0002-0000-0000-000000000002'::uuid, m.id, NULL, 3, 'AUTHOR' FROM member m WHERE m.slug = 'ewaldo-eder-santana'
UNION ALL
SELECT '11111111-0002-0000-0000-000000000002'::uuid, NULL, 'Lobato', 4, 'AUTHOR';

-- 3. Wildemarkes hallucinations MSc 2024
INSERT INTO publication (id, title, venue, year, type, status) VALUES
  ('11111111-0003-0000-0000-000000000003',
   'Alucinações em Modelos de IA Generativa: Limitações e Desafios na Compreensão da Linguagem Humana',
   'PECS/UEMA · MSc dissertation, defended 2024-05-31', 2024, 'DISSERTATION', 'COMPLETED');
INSERT INTO authorship (publication_id, member_id, external_author_name, author_order, author_role)
SELECT '11111111-0003-0000-0000-000000000003'::uuid, m.id, NULL, 1, 'AUTHOR' FROM member m WHERE m.slug = 'wildemarkes-de-almeida-da-silva'
UNION ALL
SELECT '11111111-0003-0000-0000-000000000003'::uuid, NULL, 'Luis Carlos Costa Fonseca', 2, 'ADVISOR'
UNION ALL
SELECT '11111111-0003-0000-0000-000000000003'::uuid, m.id, NULL, 3, 'AUTHOR' FROM member m WHERE m.slug = 'ewaldo-eder-santana';

-- 4. Embeddings Jurídico WCGE 2023
INSERT INTO publication (id, title, venue, year, type, status) VALUES
  ('11111111-0004-0000-0000-000000000004',
   'Embeddings Jurídico: Representações Orientadas à Linguagem Jurídica Brasileira',
   'Workshop WCGE 2023', 2023, 'WORKSHOP', 'PUBLISHED');
INSERT INTO authorship (publication_id, member_id, external_author_name, author_order, author_role)
SELECT '11111111-0004-0000-0000-000000000004'::uuid, NULL, 'Serejo', 1, 'AUTHOR'
UNION ALL
SELECT '11111111-0004-0000-0000-000000000004'::uuid, m.id, NULL, 2, 'AUTHOR' FROM member m WHERE m.slug = 'fabricio-almeida-do-carmo'
UNION ALL
SELECT '11111111-0004-0000-0000-000000000004'::uuid, NULL, 'Jacob Jr.', 3, 'AUTHOR'
UNION ALL
SELECT '11111111-0004-0000-0000-000000000004'::uuid, m.id, NULL, 4, 'AUTHOR' FROM member m WHERE m.slug = 'ewaldo-eder-santana'
UNION ALL
SELECT '11111111-0004-0000-0000-000000000004'::uuid, NULL, 'Lobato', 5, 'AUTHOR';

-- 5. Luany triagem obesos MSc 2023
INSERT INTO publication (id, title, venue, year, type, status) VALUES
  ('11111111-0005-0000-0000-000000000005',
   'Comparação de algoritmos de aprendizado de máquinas para desenvolvimento de um sistema para triagem de adolescentes obesos utilizando variáveis clínicas',
   'PECS/UEMA · MSc dissertation, 2023', 2023, 'DISSERTATION', 'COMPLETED');
INSERT INTO authorship (publication_id, member_id, external_author_name, author_order, author_role)
SELECT '11111111-0005-0000-0000-000000000005'::uuid, m.id, NULL, 1, 'AUTHOR' FROM member m WHERE m.slug = 'luany-maiara-andrade-ribeiro'
UNION ALL
SELECT '11111111-0005-0000-0000-000000000005'::uuid, m.id, NULL, 2, 'ADVISOR' FROM member m WHERE m.slug = 'ewaldo-eder-santana';

-- 6. OOCYHISTDB RSC 2022
INSERT INTO publication (id, title, venue, year, type, status) VALUES
  ('11111111-0006-0000-0000-000000000006',
   'OOCYHISTDB: Um conjunto de dados de imagens histológicas para detecção de ovócitos',
   'Revista de Sistemas e Computação (RSC), v.12, p.61-68', 2022, 'JOURNAL', 'PUBLISHED');
INSERT INTO authorship (publication_id, member_id, external_author_name, author_order, author_role)
SELECT '11111111-0006-0000-0000-000000000006'::uuid, m.id, NULL, 1, 'AUTHOR' FROM member m WHERE m.slug = 'yanna-leidy-ketley-fernandes-cruz'
UNION ALL
SELECT '11111111-0006-0000-0000-000000000006'::uuid, m.id, NULL, 2, 'AUTHOR' FROM member m WHERE m.slug = 'antonio-fhillipi-maciel-silva'
UNION ALL
SELECT '11111111-0006-0000-0000-000000000006'::uuid, m.id, NULL, 3, 'AUTHOR' FROM member m WHERE m.slug = 'ewaldo-eder-santana'
UNION ALL
SELECT '11111111-0006-0000-0000-000000000006'::uuid, NULL, 'Isa Rosete', 4, 'AUTHOR'
UNION ALL
SELECT '11111111-0006-0000-0000-000000000006'::uuid, NULL, 'Raimunda Fortes', 5, 'AUTHOR';

-- 7. Kassio spectroscopy MSc 2022
INSERT INTO publication (id, title, venue, year, type, status) VALUES
  ('11111111-0007-0000-0000-000000000007',
   'Estudo Teórico das Propriedades Espectroscópicas Eletrônicas e Termodinâmicas das Estruturas dos Aditivos no Combustível Espacial',
   'UEMA · MSc dissertation, defended 2022-09-26', 2022, 'DISSERTATION', 'COMPLETED');
INSERT INTO authorship (publication_id, member_id, external_author_name, author_order, author_role)
SELECT '11111111-0007-0000-0000-000000000007'::uuid, m.id, NULL, 1, 'AUTHOR' FROM member m WHERE m.slug = 'kassio-felipe-da-costa-serra';

-- 8. IEEE SENSORS rockets 2021
INSERT INTO publication (id, title, venue, year, type, status) VALUES
  ('11111111-0008-0000-0000-000000000008',
   'Location Analysis Probing Rockets in Ground with Telemetry Data',
   'IEEE SENSORS Conference 2021', 2021, 'CONFERENCE', 'PUBLISHED');
INSERT INTO authorship (publication_id, member_id, external_author_name, author_order, author_role)
SELECT '11111111-0008-0000-0000-000000000008'::uuid, m.id, NULL, 1, 'AUTHOR' FROM member m WHERE m.slug = 'nilton-rodrigues-cantanhede'
UNION ALL
SELECT '11111111-0008-0000-0000-000000000008'::uuid, m.id, NULL, 2, 'AUTHOR' FROM member m WHERE m.slug = 'ewaldo-eder-santana'
UNION ALL
SELECT '11111111-0008-0000-0000-000000000008'::uuid, NULL, 'Paulo Fernandes da Silva Jr.', 3, 'AUTHOR'
UNION ALL
SELECT '11111111-0008-0000-0000-000000000008'::uuid, NULL, 'Raimundo Freire', 4, 'AUTHOR'
UNION ALL
SELECT '11111111-0008-0000-0000-000000000008'::uuid, NULL, 'Jonas Barros', 5, 'AUTHOR';

-- 9. Dailan Pierce Love MSc 2021
INSERT INTO publication (id, title, venue, year, type, status) VALUES
  ('11111111-0009-0000-0000-000000000009',
   'Oscilador Pierce com sensor a ondas Love na malha de realimentação',
   'PECS/UEMA · MSc dissertation, 2021', 2021, 'DISSERTATION', 'COMPLETED');
INSERT INTO authorship (publication_id, member_id, external_author_name, author_order, author_role)
SELECT '11111111-0009-0000-0000-000000000009'::uuid, m.id, NULL, 1, 'AUTHOR' FROM member m WHERE m.slug = 'dailan-de-jesus-pereira-bernardes'
UNION ALL
SELECT '11111111-0009-0000-0000-000000000009'::uuid, NULL, 'Raimundo Carlos Silverio Freire', 2, 'ADVISOR';

-- 10. Nilton trajetografia MSc 2019
INSERT INTO publication (id, title, venue, year, type, status) VALUES
  ('11111111-0010-0000-0000-000000000010',
   'Proposta de um sistema de trajetografia para veículos espaciais baseado em telemetria',
   'PECS/UEMA · MSc dissertation, 2019', 2019, 'DISSERTATION', 'COMPLETED');
INSERT INTO authorship (publication_id, member_id, external_author_name, author_order, author_role)
SELECT '11111111-0010-0000-0000-000000000010'::uuid, m.id, NULL, 1, 'AUTHOR' FROM member m WHERE m.slug = 'nilton-rodrigues-cantanhede'
UNION ALL
SELECT '11111111-0010-0000-0000-000000000010'::uuid, m.id, NULL, 2, 'ADVISOR' FROM member m WHERE m.slug = 'ewaldo-eder-santana';

-- 11. Yanna PhD thesis (in progress)
INSERT INTO publication (id, title, venue, year, type, status) VALUES
  ('11111111-0011-0000-0000-000000000011',
   'Uma abordagem para a detecção automática dos estágios de maturação ovocitária da espécie Centropomus undecimalis via aprendizagem profunda',
   'UFMA · PhD thesis (in progress)', 2026, 'THESIS', 'IN_PROGRESS');
INSERT INTO authorship (publication_id, member_id, external_author_name, author_order, author_role)
SELECT '11111111-0011-0000-0000-000000000011'::uuid, m.id, NULL, 1, 'AUTHOR' FROM member m WHERE m.slug = 'yanna-leidy-ketley-fernandes-cruz'
UNION ALL
SELECT '11111111-0011-0000-0000-000000000011'::uuid, m.id, NULL, 2, 'ADVISOR' FROM member m WHERE m.slug = 'ewaldo-eder-santana'
UNION ALL
SELECT '11111111-0011-0000-0000-000000000011'::uuid, NULL, 'Raimunda Fortes', 3, 'CO_ADVISOR';

-- 12. Fabrício legal docs (in press)
INSERT INTO publication (id, title, venue, year, type, status) VALUES
  ('11111111-0012-0000-0000-000000000012',
   'Análise comparativa de métodos baseados em modelos de linguagem para documentos jurídicos longos',
   'In press', 2025, 'JOURNAL', 'IN_PRESS');
INSERT INTO authorship (publication_id, member_id, external_author_name, author_order, author_role)
SELECT '11111111-0012-0000-0000-000000000012'::uuid, NULL, 'Araújo', 1, 'AUTHOR'
UNION ALL
SELECT '11111111-0012-0000-0000-000000000012'::uuid, m.id, NULL, 2, 'AUTHOR' FROM member m WHERE m.slug = 'fabricio-almeida-do-carmo'
UNION ALL
SELECT '11111111-0012-0000-0000-000000000012'::uuid, m.id, NULL, 3, 'AUTHOR' FROM member m WHERE m.slug = 'ewaldo-eder-santana'
UNION ALL
SELECT '11111111-0012-0000-0000-000000000012'::uuid, NULL, 'Jacob Jr.', 4, 'AUTHOR'
UNION ALL
SELECT '11111111-0012-0000-0000-000000000012'::uuid, NULL, 'Lobato', 5, 'AUTHOR';

-- Publication ↔ area links (mirrors publications-data.ts `areas` field)
INSERT INTO publication_area (publication_id, area_id) SELECT '11111111-0001-0000-0000-000000000001'::uuid, ra.id FROM research_area ra WHERE ra.slug = 'computer-vision';
INSERT INTO publication_area (publication_id, area_id) SELECT '11111111-0002-0000-0000-000000000002'::uuid, ra.id FROM research_area ra WHERE ra.slug IN ('nlp', 'ml-clinical');
INSERT INTO publication_area (publication_id, area_id) SELECT '11111111-0003-0000-0000-000000000003'::uuid, ra.id FROM research_area ra WHERE ra.slug = 'generative-ai';
INSERT INTO publication_area (publication_id, area_id) SELECT '11111111-0004-0000-0000-000000000004'::uuid, ra.id FROM research_area ra WHERE ra.slug = 'nlp';
INSERT INTO publication_area (publication_id, area_id) SELECT '11111111-0005-0000-0000-000000000005'::uuid, ra.id FROM research_area ra WHERE ra.slug = 'ml-clinical';
INSERT INTO publication_area (publication_id, area_id) SELECT '11111111-0006-0000-0000-000000000006'::uuid, ra.id FROM research_area ra WHERE ra.slug = 'computer-vision';
INSERT INTO publication_area (publication_id, area_id) SELECT '11111111-0007-0000-0000-000000000007'::uuid, ra.id FROM research_area ra WHERE ra.slug IN ('spectroscopy', 'aerospace-telemetry');
INSERT INTO publication_area (publication_id, area_id) SELECT '11111111-0008-0000-0000-000000000008'::uuid, ra.id FROM research_area ra WHERE ra.slug IN ('aerospace-telemetry', 'sensors');
INSERT INTO publication_area (publication_id, area_id) SELECT '11111111-0009-0000-0000-000000000009'::uuid, ra.id FROM research_area ra WHERE ra.slug = 'sensors';
INSERT INTO publication_area (publication_id, area_id) SELECT '11111111-0010-0000-0000-000000000010'::uuid, ra.id FROM research_area ra WHERE ra.slug = 'aerospace-telemetry';
INSERT INTO publication_area (publication_id, area_id) SELECT '11111111-0011-0000-0000-000000000011'::uuid, ra.id FROM research_area ra WHERE ra.slug = 'computer-vision';
INSERT INTO publication_area (publication_id, area_id) SELECT '11111111-0012-0000-0000-000000000012'::uuid, ra.id FROM research_area ra WHERE ra.slug = 'nlp';
