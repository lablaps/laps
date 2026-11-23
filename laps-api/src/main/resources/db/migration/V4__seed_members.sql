-- Roster snapshot — UUIDs match laps-signal-lab/src/lib/team-data.ts so URLs
-- (/team/<uuid>) are stable from the bundled SPA.

INSERT INTO member (id, slug, full_name, member_role, status, current_role_started_at) VALUES
  -- HEAD
  ('f1c1c1e5-2087-4d7d-bbc0-ab2eaf140afb', 'ewaldo-eder-santana',                'Ph.D Ewaldo Eder Santana',               'HEAD',       'ACTIVE', DATE '2008-01-01'),

  -- DOCTORATE
  ('c894d827-6138-4f5b-9870-73d53adb45d3', 'antonio-fhillipi-maciel-silva',      'Antonio Fhillipi Maciel Silva',          'DOCTORATE',  'ACTIVE', DATE '2022-08-01'),
  ('6f1d7604-03f6-4a92-928a-a3bcd9ca9b7e', 'dailan-de-jesus-pereira-bernardes',  'Dailan de Jesus Pereira Bernardes',      'DOCTORATE',  'ACTIVE', DATE '2022-08-01'),
  ('be38b457-012d-453f-b8e3-8ec2280fb55d', 'fabricio-almeida-do-carmo',          'Fabrício Almeida do Carmo',              'DOCTORATE',  'ACTIVE', DATE '2022-08-01'),
  ('7ee1851b-2470-4104-9728-5c5c7d9014d0', 'freud-sebastian-bach-carvalho-lima', 'Freud Sebastian Bach Carvalho Lima',     'DOCTORATE',  'ACTIVE', DATE '2022-08-01'),
  ('fd99a219-eae1-4c5f-bb9d-bfc5c0bfdfa7', 'kassio-felipe-da-costa-serra',       'Kassio Felipe da Costa Serra',           'DOCTORATE',  'ACTIVE', DATE '2023-03-01'),
  ('5f5499b2-e867-4443-9850-188b767ab2fd', 'marcelo-viana-da-silva',             'Marcelo Viana da Silva',                 'DOCTORATE',  'ACTIVE', DATE '2023-03-01'),
  ('baa1b0cc-fc57-4826-99ac-b11afdba1d34', 'nilton-rodrigues-cantanhede',        'Nilton Rodrigues Cantanhede',            'DOCTORATE',  'ACTIVE', DATE '2020-03-01'),
  ('d7cfa326-5503-4cc7-afd9-4f3955ee43f7', 'paulo-henrique-bezerra-de-carvalho', 'Paulo Henrique Bezerra de Carvalho',     'DOCTORATE',  'ACTIVE', DATE '2023-08-01'),
  ('e8cef7cb-d773-441a-98aa-447505503522', 'wildemarkes-de-almeida-da-silva',    'Wildemarkes de Almeida da Silva',        'DOCTORATE',  'ACTIVE', DATE '2024-08-01'),
  ('623d875f-d1a9-4264-91cb-218dedd85131', 'yanna-leidy-ketley-fernandes-cruz',  'Yanna Leidy Ketley Fernandes Cruz',      'DOCTORATE',  'ACTIVE', DATE '2022-08-01'),

  -- MASTER
  ('ea86e4ad-bfd2-4017-9685-a03c9490a37b', 'cely-gabrielle-santos-silva',        'Cély Gabrielle Santos Silva',            'MASTER',     'ACTIVE',    DATE '2024-03-01'),
  ('57132ae6-e60f-4502-ad83-79ce2bbd900e', 'elias-nazareno-de-oliveira-azevedo', 'Elias Nazareno de Oliveira Azevedo',     'MASTER',     'ACTIVE',    DATE '2024-03-01'),
  ('80609c40-7d6b-4c87-a0b2-adeafc65c00b', 'felipe-castro-viana',                'Felipe Castro Viana',                    'MASTER',     'ACTIVE',    DATE '2024-03-01'),
  ('149549b4-b00f-4ef2-8832-fd7e65cbf170', 'francisco-soares-fonseca',           'Francisco Soares Fonseca',               'MASTER',     'ACTIVE',    DATE '2024-03-01'),
  ('773b4e57-1406-45ca-9fa4-1f416689076a', 'geise-alves-da-silva-serra',         'Geise Alves da Silva Serra',             'MASTER',     'ACTIVE',    DATE '2024-03-01'),
  ('7130efd5-120c-42fc-8644-81869ad95e13', 'jose-carlos-costa-junior',           'José Carlos Costa Júnior',               'MASTER',     'ACTIVE',    DATE '2024-03-01'),
  ('60c1cab9-faa7-4cb6-ad95-1f7ee2b8eaaf', 'jose-eduardo-carvalho-thomaz',       'José Eduardo Carvalho Thomaz',           'MASTER',     'ACTIVE',    DATE '2024-03-01'),
  ('0423aef4-d5c1-40d9-8e78-5f1dbe8cfd08', 'joao-marcos-rodrigues-coelho',       'João Marcos Rodrigues Coelho',           'MASTER',     'ACTIVE',    DATE '2024-03-01'),
  ('17896c55-2299-4379-b734-5af1a0af5076', 'luany-maiara-andrade-ribeiro',       'Luany Maiara Andrade Ribeiro',           'MASTER',     'COMPLETED', DATE '2021-03-01'),
  ('53f25eec-a4b3-4b0f-a329-4330a4d2d2e3', 'lucas-souza-rodrigues',              'Lucas Souza Rodrigues',                  'MASTER',     'ACTIVE',    DATE '2024-08-01'),
  ('16c2210f-4135-478e-8d87-ba7deec89e42', 'luis-augusto-da-costa-cardoso',      'Luis Augusto da Costa Cardoso',          'MASTER',     'ACTIVE',    DATE '2024-08-01'),
  ('1e04aa5e-b193-4b5f-9cad-fca37e32fbde', 'nildson-de-castro-pinheiro-mello',   'Nildson de Castro Pinheiro Mello',       'MASTER',     'ACTIVE',    DATE '2024-08-01'),
  ('ef0f142d-1ba8-4638-ab9d-a4268e59b121', 'pedro-victor-de-sousa-dantas',       'Pedro Victor de Sousa Dantas',           'MASTER',     'ACTIVE',    DATE '2025-03-01'),
  ('887a7d0a-9e2e-40ab-8747-5598dd2411c2', 'tiago-pereira-santana',              'Tiago Pereira Santana',                  'MASTER',     'ACTIVE',    DATE '2025-03-01'),

  -- UNDERGRAD (IC)
  ('e2b23d5d-7b5c-4c94-9f24-b2084d807d16', 'ana-luiza-brasil-barbosa',           'Ana Luiza Brasil Barbosa',               'UNDERGRAD',  'ACTIVE', DATE '2024-08-01'),
  ('61e79ef2-8c5b-483c-be28-0f8fad41666e', 'ayrton-cesar-teixeira-e-silva',      'Ayrton César Teixeira e Silva',          'UNDERGRAD',  'ACTIVE', DATE '2024-08-01'),
  ('3325a78c-4a0e-4e76-9736-0a3daab5b03c', 'felipe-sammuel-martins',             'Felipe Sammuel Martins',                 'UNDERGRAD',  'ACTIVE', DATE '2024-08-01'),
  ('aa619e11-cca7-4377-a25e-ced4ded0ba9e', 'gabriel-rodrigues-ramalho',          'Gabriel Rodrigues Ramalho',              'UNDERGRAD',  'ACTIVE', DATE '2024-08-01'),
  ('4f877fc0-459c-40e9-8839-98f99ef5742c', 'icaro-de-jesus-silva',               'Icaro de Jesus Silva',                   'UNDERGRAD',  'ACTIVE', DATE '2024-08-01'),
  ('ca04864b-1c5b-4eca-888a-ab154ef22223', 'igor-barros-grilo',                  'Igor Barros Grilo',                      'UNDERGRAD',  'ACTIVE', DATE '2024-08-01'),
  ('60ab7d44-1d60-4308-8006-094dacc1adbb', 'joao-vitor-coelho-ferreira',         'João Vitor Coelho Ferreira',             'UNDERGRAD',  'ACTIVE', DATE '2024-08-01'),
  ('0e95a5be-c464-49d3-a3fd-50c4ebc9b7d7', 'julia-emmyle-lima-cabral',           'Júlia Emmyle Lima Cabral',               'UNDERGRAD',  'ACTIVE', DATE '2024-08-01'),
  ('981b473f-07dd-45e4-92be-d6afa6275b30', 'laysa-cristinna-de-souza-cordeiro',  'Laysa Cristinna de Souza Cordeiro',      'UNDERGRAD',  'ACTIVE', DATE '2024-08-01'),
  ('25c67b6b-3a32-4043-82f6-b24e1bc319fc', 'lethicia-kelly-silva-sousa',         'Lethicia Kelly Silva Sousa',             'UNDERGRAD',  'ACTIVE', DATE '2024-08-01'),
  ('8c4d04b2-0fc0-4e9d-8739-4f0a69739fb7', 'luis-guilherme-busaglo-lopes',       'Luis Guilherme Busaglo Lopes',           'UNDERGRAD',  'ACTIVE', DATE '2024-08-01'),
  ('a540686b-cc4a-429b-8bfb-ef6c1dd834a8', 'maiza-yumi-ueda-almeida',            'Maiza Yumi Ueda Almeida',                'UNDERGRAD',  'ACTIVE', DATE '2024-08-01'),
  ('cf975ef2-d1ea-4482-b06b-db5e2c9effda', 'maria-tereza-cunha-de-albuquerque',  'Maria Tereza Cunha de Albuquerque',      'UNDERGRAD',  'ACTIVE', DATE '2024-08-01'),
  ('f38fd36d-879b-40dc-b3d0-f0ab6fa8ad54', 'patrick-melo-albuquerque',           'Patrick Melo Albuquerque',               'UNDERGRAD',  'ACTIVE', DATE '2024-08-01'),
  ('db47fcd3-e7e7-447b-859e-fb25cc58ec24', 'paulo-alex-carvalho-barata',         'Paulo Alex Carvalho Barata',             'UNDERGRAD',  'ACTIVE', DATE '2024-08-01'),
  ('81092b08-a5fb-4795-9931-3fcd4cd714d7', 'pedro-gabriel-moreira-goncalves',    'Pedro Gabriel Moreira Gonçalves',        'UNDERGRAD',  'ACTIVE', DATE '2024-08-01'),
  ('334294fd-2f48-4462-b229-295868bb6f11', 'pedro-luis-jovino-da-silva',         'Pedro Luis Jovino da Silva',             'UNDERGRAD',  'ACTIVE', DATE '2024-08-01'),
  ('cdc82b7b-5d19-4799-9a5b-777898e620d6', 'renan-de-jesus-montenegro-da-silva', 'Renan de Jesus Montenegro da Silva',     'UNDERGRAD',  'ACTIVE', DATE '2024-08-01'),
  ('bb4eee65-ff42-4b82-afc1-dfbedaef24b5', 'sofia-barros-coimbra',               'Sofia Barros Coimbra',                   'UNDERGRAD',  'ACTIVE', DATE '2024-08-01'),
  ('22ec0a50-f245-4c41-bdf3-69525b749aa5', 'suami-gomes-santos',                 'Suamí Gomes Santos',                     'UNDERGRAD',  'ACTIVE', DATE '2024-08-01'),
  ('b9d90c22-131c-4619-98b1-4a197f7a4ed7', 'thassia-raquel-silva-ribeiro',       'Thassia Raquel Silva Ribeiro',           'UNDERGRAD',  'ACTIVE', DATE '2024-08-01'),

  -- UNDERGRAD — Calouros 2026 (Sensores)
  ('6f658db2-ce5a-43f1-9b34-acb84211c160', 'marcio-henrique-da-silva-sousa',     'Márcio Henrique da Silva Sousa',         'UNDERGRAD',  'ACTIVE', DATE '2026-03-01'),
  ('8515a52f-2be8-46fe-b52a-c8d73f7cb33b', 'vital-ribamar-silva-santos-neto',    'Vital Ribamar Silva Santos Neto',        'UNDERGRAD',  'ACTIVE', DATE '2026-03-01'),
  ('6bed2e64-9f80-4b5e-baee-7eb47f054048', 'aylton-kalebe-ribeiro-lacerda',      'Aylton Kalebe Ribeiro Lacerda',          'UNDERGRAD',  'ACTIVE', DATE '2026-03-01');

-- Primary research area assignments.
INSERT INTO member_area (member_id, area_id, is_primary)
SELECT m.id, ra.id, TRUE FROM member m JOIN research_area ra ON ra.slug = 'signal-processing'   WHERE m.slug = 'ewaldo-eder-santana'
UNION ALL
SELECT m.id, ra.id, TRUE FROM member m JOIN research_area ra ON ra.slug = 'computer-vision'     WHERE m.slug = 'antonio-fhillipi-maciel-silva'
UNION ALL
SELECT m.id, ra.id, TRUE FROM member m JOIN research_area ra ON ra.slug = 'sensors'             WHERE m.slug = 'dailan-de-jesus-pereira-bernardes'
UNION ALL
SELECT m.id, ra.id, TRUE FROM member m JOIN research_area ra ON ra.slug = 'nlp'                 WHERE m.slug = 'fabricio-almeida-do-carmo'
UNION ALL
SELECT m.id, ra.id, TRUE FROM member m JOIN research_area ra ON ra.slug = 'spectroscopy'        WHERE m.slug = 'kassio-felipe-da-costa-serra'
UNION ALL
SELECT m.id, ra.id, TRUE FROM member m JOIN research_area ra ON ra.slug = 'aerospace-telemetry' WHERE m.slug = 'nilton-rodrigues-cantanhede'
UNION ALL
SELECT m.id, ra.id, TRUE FROM member m JOIN research_area ra ON ra.slug = 'generative-ai'       WHERE m.slug = 'wildemarkes-de-almeida-da-silva'
UNION ALL
SELECT m.id, ra.id, TRUE FROM member m JOIN research_area ra ON ra.slug = 'computer-vision'     WHERE m.slug = 'yanna-leidy-ketley-fernandes-cruz'
UNION ALL
SELECT m.id, ra.id, TRUE FROM member m JOIN research_area ra ON ra.slug = 'ml-clinical'         WHERE m.slug = 'luany-maiara-andrade-ribeiro'
UNION ALL
SELECT m.id, ra.id, TRUE FROM member m JOIN research_area ra ON ra.slug = 'iot'                 WHERE m.slug = 'icaro-de-jesus-silva'
UNION ALL
SELECT m.id, ra.id, TRUE FROM member m JOIN research_area ra ON ra.slug = 'sensors'             WHERE m.slug = 'marcio-henrique-da-silva-sousa'
UNION ALL
SELECT m.id, ra.id, TRUE FROM member m JOIN research_area ra ON ra.slug = 'sensors'             WHERE m.slug = 'vital-ribamar-silva-santos-neto'
UNION ALL
SELECT m.id, ra.id, TRUE FROM member m JOIN research_area ra ON ra.slug = 'sensors'             WHERE m.slug = 'aylton-kalebe-ribeiro-lacerda';

-- Secondary research area assignments (mirrors team-data.ts `areas` field).
INSERT INTO member_area (member_id, area_id, is_primary)
SELECT m.id, ra.id, FALSE FROM member m JOIN research_area ra ON ra.slug = 'iot'                 WHERE m.slug = 'ewaldo-eder-santana'
UNION ALL
SELECT m.id, ra.id, FALSE FROM member m JOIN research_area ra ON ra.slug = 'ml-clinical'         WHERE m.slug = 'ewaldo-eder-santana'
UNION ALL
SELECT m.id, ra.id, FALSE FROM member m JOIN research_area ra ON ra.slug = 'signal-processing'   WHERE m.slug = 'antonio-fhillipi-maciel-silva'
UNION ALL
SELECT m.id, ra.id, FALSE FROM member m JOIN research_area ra ON ra.slug = 'microelectronics'    WHERE m.slug = 'dailan-de-jesus-pereira-bernardes'
UNION ALL
SELECT m.id, ra.id, FALSE FROM member m JOIN research_area ra ON ra.slug = 'ml-clinical'         WHERE m.slug = 'fabricio-almeida-do-carmo'
UNION ALL
SELECT m.id, ra.id, FALSE FROM member m JOIN research_area ra ON ra.slug = 'aerospace-telemetry' WHERE m.slug = 'kassio-felipe-da-costa-serra'
UNION ALL
SELECT m.id, ra.id, FALSE FROM member m JOIN research_area ra ON ra.slug = 'sensors'             WHERE m.slug = 'nilton-rodrigues-cantanhede'
UNION ALL
SELECT m.id, ra.id, FALSE FROM member m JOIN research_area ra ON ra.slug = 'signal-processing'   WHERE m.slug = 'nilton-rodrigues-cantanhede'
UNION ALL
SELECT m.id, ra.id, FALSE FROM member m JOIN research_area ra ON ra.slug = 'nlp'                 WHERE m.slug = 'wildemarkes-de-almeida-da-silva'
UNION ALL
SELECT m.id, ra.id, FALSE FROM member m JOIN research_area ra ON ra.slug = 'signal-processing'   WHERE m.slug = 'yanna-leidy-ketley-fernandes-cruz'
UNION ALL
SELECT m.id, ra.id, FALSE FROM member m JOIN research_area ra ON ra.slug = 'signal-processing'   WHERE m.slug = 'icaro-de-jesus-silva';

-- Open role-history rows (current role).
INSERT INTO role_history (member_id, member_role, started_at, ended_at, reason)
SELECT id, member_role, current_role_started_at, NULL, 'initial seed'
FROM member;
