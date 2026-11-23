-- Projects + membership tables. Tags column uses JSONB (Hibernate maps to it via
-- @JdbcTypeCode(SqlTypes.JSON), the existing entity annotation).

CREATE TABLE project (
    id              UUID            NOT NULL PRIMARY KEY,
    slug            VARCHAR(100)    NOT NULL UNIQUE,
    status          VARCHAR(50)     NOT NULL,
    tags            JSONB,
    title_pt        TEXT,
    description_pt  TEXT,
    title_en        TEXT,
    description_en  TEXT,
    title_fr        TEXT,
    description_fr  TEXT,
    created_at      TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE project_area (
    project_id      UUID        NOT NULL,
    area_id         SMALLINT    NOT NULL,
    PRIMARY KEY (project_id, area_id),
    CONSTRAINT fk_proj_area_project FOREIGN KEY (project_id) REFERENCES project(id) ON DELETE CASCADE,
    CONSTRAINT fk_proj_area_area    FOREIGN KEY (area_id)    REFERENCES research_area(id) ON DELETE CASCADE
);

CREATE TABLE member_project (
    project_id      UUID            NOT NULL,
    member_id       UUID            NOT NULL,
    role            VARCHAR(50)     NOT NULL DEFAULT 'RESEARCHER',
    PRIMARY KEY (project_id, member_id),
    CONSTRAINT fk_member_project_proj FOREIGN KEY (project_id) REFERENCES project(id) ON DELETE CASCADE,
    CONSTRAINT fk_member_project_mem  FOREIGN KEY (member_id)  REFERENCES member(id) ON DELETE CASCADE
);

-- Seed projects — slugs / IDs mirror laps-signal-lab/src/lib/projects-data.ts.

INSERT INTO project (id, slug, status, tags, title_pt, description_pt, title_en, description_en, title_fr, description_fr) VALUES
('22222222-0001-0000-0000-000000000001', 'gan-histological', 'COMPLETED',
 '["Generative Adversarial Networks", "Histopathological Images", "Computer Vision"]'::jsonb,
 'Modelos GAN em Imagens Histológicas',
 'Revisão e aplicação de redes adversárias generativas para segmentação de imagens histológicas.',
 'GANs on Histological Images',
 'Systematic review and application of Generative Adversarial Networks in histological image segmentation.',
 'Modèles GAN en Images Histologiques',
 'Revue et application de réseaux antagonistes génératifs pour la segmentation d''images histologiques.');
INSERT INTO project_area (project_id, area_id) SELECT '22222222-0001-0000-0000-000000000001'::uuid, id FROM research_area WHERE slug = 'computer-vision';
INSERT INTO member_project (project_id, member_id, role) SELECT '22222222-0001-0000-0000-000000000001'::uuid, id, 'LEAD'    FROM member WHERE slug = 'antonio-fhillipi-maciel-silva';
INSERT INTO member_project (project_id, member_id, role) SELECT '22222222-0001-0000-0000-000000000001'::uuid, id, 'CO_LEAD' FROM member WHERE slug = 'ewaldo-eder-santana';

INSERT INTO project (id, slug, status, tags, title_pt, description_pt, title_en, description_en, title_fr, description_fr) VALUES
('22222222-0002-0000-0000-000000000002', 'evoimp', 'COMPLETED',
 '["Genetic Algorithms", "Data Imputation", "Multi-label Classification"]'::jsonb,
 'EvoImp: Imputação de Dados via Algoritmo Genético',
 'Sistema para imputação múltipla de dados de classificação multirrótulo usando algoritmos genéticos.',
 'EvoImp: Genetic Algorithm Data Imputation',
 'Multiple imputation of multi-label classification data with a genetic algorithm.',
 'EvoImp: Imputation de Données par Algorithme Génétique',
 'Imputation multiple de données de classification multi-labels à l''aide d''un algorithme génétique.');
INSERT INTO project_area (project_id, area_id) SELECT '22222222-0002-0000-0000-000000000002'::uuid, id FROM research_area WHERE slug IN ('nlp', 'ml-clinical');
INSERT INTO member_project (project_id, member_id, role) SELECT '22222222-0002-0000-0000-000000000002'::uuid, id, 'LEAD'    FROM member WHERE slug = 'fabricio-almeida-do-carmo';
INSERT INTO member_project (project_id, member_id, role) SELECT '22222222-0002-0000-0000-000000000002'::uuid, id, 'CO_LEAD' FROM member WHERE slug = 'ewaldo-eder-santana';

INSERT INTO project (id, slug, status, tags, title_pt, description_pt, title_en, description_en, title_fr, description_fr) VALUES
('22222222-0003-0000-0000-000000000003', 'ai-hallucinations', 'COMPLETED',
 '["Generative AI", "NLP", "LLM Hallucinations"]'::jsonb,
 'Alucinações em Modelos de IA Generativa',
 'Mapeamento das limitações e desafios na compreensão da linguagem humana por LLMs.',
 'Hallucinations in Generative AI',
 'Mapping limitations and challenges in human language understanding by Large Language Models.',
 'Hallucinations dans les Modèles d''IA Générative',
 'Cartographie des limites et défis dans la compréhension du langage humain par les LLMs.');
INSERT INTO project_area (project_id, area_id) SELECT '22222222-0003-0000-0000-000000000003'::uuid, id FROM research_area WHERE slug = 'generative-ai';
INSERT INTO member_project (project_id, member_id, role) SELECT '22222222-0003-0000-0000-000000000003'::uuid, id, 'LEAD'    FROM member WHERE slug = 'wildemarkes-de-almeida-da-silva';
INSERT INTO member_project (project_id, member_id, role) SELECT '22222222-0003-0000-0000-000000000003'::uuid, id, 'CO_LEAD' FROM member WHERE slug = 'ewaldo-eder-santana';

INSERT INTO project (id, slug, status, tags, title_pt, description_pt, title_en, description_en, title_fr, description_fr) VALUES
('22222222-0004-0000-0000-000000000004', 'legal-embeddings', 'COMPLETED',
 '["NLP", "Legal Text", "Word Embeddings", "Brazilian Law"]'::jsonb,
 'Embeddings para o Judiciário',
 'Representações orientadas à Linguagem Jurídica Brasileira e documentos judiciais longos.',
 'Legal Embeddings',
 'Representations oriented to long Brazilian Legal texts and judicial language documents.',
 'Embeddings Juridiques',
 'Représentations orientées vers les textes juridiques brésiliens et les documents judiciaires longs.');
INSERT INTO project_area (project_id, area_id) SELECT '22222222-0004-0000-0000-000000000004'::uuid, id FROM research_area WHERE slug = 'nlp';
INSERT INTO member_project (project_id, member_id, role) SELECT '22222222-0004-0000-0000-000000000004'::uuid, id, 'LEAD'    FROM member WHERE slug = 'fabricio-almeida-do-carmo';
INSERT INTO member_project (project_id, member_id, role) SELECT '22222222-0004-0000-0000-000000000004'::uuid, id, 'CO_LEAD' FROM member WHERE slug = 'ewaldo-eder-santana';

INSERT INTO project (id, slug, status, tags, title_pt, description_pt, title_en, description_en, title_fr, description_fr) VALUES
('22222222-0005-0000-0000-000000000005', 'obesity-triage', 'COMPLETED',
 '["Machine Learning", "Adolescent Obesity", "Clinical Triage"]'::jsonb,
 'Triagem Clínica de Adolescentes',
 'Construção de sistemas baseados em machine learning para triagem de adolescentes obesos.',
 'Clinical Triage for Adolescents',
 'Building machine learning-based systems for clinical triage of obese adolescents.',
 'Triage Clinique d''Adolescents',
 'Construction de systèmes basés sur le machine learning pour le triage clinique d''adolescents obèses.');
INSERT INTO project_area (project_id, area_id) SELECT '22222222-0005-0000-0000-000000000005'::uuid, id FROM research_area WHERE slug = 'ml-clinical';
INSERT INTO member_project (project_id, member_id, role) SELECT '22222222-0005-0000-0000-000000000005'::uuid, id, 'LEAD'    FROM member WHERE slug = 'luany-maiara-andrade-ribeiro';
INSERT INTO member_project (project_id, member_id, role) SELECT '22222222-0005-0000-0000-000000000005'::uuid, id, 'CO_LEAD' FROM member WHERE slug = 'ewaldo-eder-santana';

INSERT INTO project (id, slug, status, tags, title_pt, description_pt, title_en, description_en, title_fr, description_fr) VALUES
('22222222-0006-0000-0000-000000000006', 'oocyhistdb', 'ACTIVE',
 '["Oocyte Detection", "Deep Learning", "Histopathology"]'::jsonb,
 'OOCYHISTDB e Maturação Ovocitária',
 'Dataset e métodos avançados via deep learning para detecção dos estágios de maturação de ovócitos.',
 'OOCYHISTDB and Oocyte Maturation',
 'Dataset and advanced deep learning methods for detecting maturation stages of oocytes.',
 'OOCYHISTDB et Maturation des Ovocytes',
 'Ensemble de données et méthodes de deep learning pour la détection des stades de maturation des ovocytes.');
INSERT INTO project_area (project_id, area_id) SELECT '22222222-0006-0000-0000-000000000006'::uuid, id FROM research_area WHERE slug = 'computer-vision';
INSERT INTO member_project (project_id, member_id, role) SELECT '22222222-0006-0000-0000-000000000006'::uuid, id, 'LEAD'       FROM member WHERE slug = 'yanna-leidy-ketley-fernandes-cruz';
INSERT INTO member_project (project_id, member_id, role) SELECT '22222222-0006-0000-0000-000000000006'::uuid, id, 'RESEARCHER' FROM member WHERE slug = 'antonio-fhillipi-maciel-silva';
INSERT INTO member_project (project_id, member_id, role) SELECT '22222222-0006-0000-0000-000000000006'::uuid, id, 'CO_LEAD'    FROM member WHERE slug = 'ewaldo-eder-santana';

INSERT INTO project (id, slug, status, tags, title_pt, description_pt, title_en, description_en, title_fr, description_fr) VALUES
('22222222-0007-0000-0000-000000000007', 'space-fuel-spectroscopy', 'COMPLETED',
 '["Spectroscopy", "Thermodynamics", "Aerospace Additives"]'::jsonb,
 'Análise Termodinâmica e Espectroscópica',
 'Estudo teórico das propriedades espectroscópicas de estruturas e aditivos no combustível espacial.',
 'Thermodynamic and Spectroscopic Analysis',
 'Theoretical study of spectroscopic properties of structures and additives in space fuels.',
 'Analyse Thermodynamique et Spectroscopique',
 'Étude théorique des propriétés spectroscopiques des structures et additifs dans les carburants spatiaux.');
INSERT INTO project_area (project_id, area_id) SELECT '22222222-0007-0000-0000-000000000007'::uuid, id FROM research_area WHERE slug IN ('spectroscopy', 'aerospace-telemetry');
INSERT INTO member_project (project_id, member_id, role) SELECT '22222222-0007-0000-0000-000000000007'::uuid, id, 'LEAD' FROM member WHERE slug = 'kassio-felipe-da-costa-serra';

INSERT INTO project (id, slug, status, tags, title_pt, description_pt, title_en, description_en, title_fr, description_fr) VALUES
('22222222-0008-0000-0000-000000000008', 'telemetry-rockets', 'COMPLETED',
 '["Probing Rockets", "Telemetry", "Trajectography"]'::jsonb,
 'Trajetografia de Foguetes via Telemetria',
 'Sistemas de trajetografia e análise de localização voltados para veículos espaciais e foguetes de sondagem.',
 'Rocket Trajectography via Telemetry',
 'Trajectography and location analysis systems aimed at space vehicles and probing rockets.',
 'Trajectographie de Fusées via Télémétrie',
 'Systèmes de trajectographie et analyse de localisation destinés aux véhicules spatiaux et fusées sondes.');
INSERT INTO project_area (project_id, area_id) SELECT '22222222-0008-0000-0000-000000000008'::uuid, id FROM research_area WHERE slug IN ('aerospace-telemetry', 'sensors', 'signal-processing');
INSERT INTO member_project (project_id, member_id, role) SELECT '22222222-0008-0000-0000-000000000008'::uuid, id, 'LEAD'    FROM member WHERE slug = 'nilton-rodrigues-cantanhede';
INSERT INTO member_project (project_id, member_id, role) SELECT '22222222-0008-0000-0000-000000000008'::uuid, id, 'CO_LEAD' FROM member WHERE slug = 'ewaldo-eder-santana';

INSERT INTO project (id, slug, status, tags, title_pt, description_pt, title_en, description_en, title_fr, description_fr) VALUES
('22222222-0009-0000-0000-000000000009', 'pierce-love-sensor', 'COMPLETED',
 '["Pierce Oscillator", "Love Wave Sensor", "Feedback Loop"]'::jsonb,
 'Sensor Oscilador Pierce Love',
 'Oscilador Pierce acoplado a sensores a ondas Love integrados na malha de realimentação.',
 'Pierce Love Oscillator Sensor',
 'Pierce oscillator coupled with Love wave sensors integrated into the feedback loop.',
 'Capteur Oscillateur Pierce Love',
 'Oscillateur Pierce couplé à des capteurs d''ondes Love intégrés dans la boucle de rétroaction.');
INSERT INTO project_area (project_id, area_id) SELECT '22222222-0009-0000-0000-000000000009'::uuid, id FROM research_area WHERE slug IN ('sensors', 'microelectronics');
INSERT INTO member_project (project_id, member_id, role) SELECT '22222222-0009-0000-0000-000000000009'::uuid, id, 'LEAD' FROM member WHERE slug = 'dailan-de-jesus-pereira-bernardes';

INSERT INTO project (id, slug, status, tags, title_pt, description_pt, title_en, description_en, title_fr, description_fr) VALUES
('22222222-0010-0000-0000-000000000010', 'long-legal-documents', 'ACTIVE',
 '["Large Language Models", "Legal Operations", "Document Parsing"]'::jsonb,
 'Análise de Documentos Jurídicos Extensos',
 'Modelos de linguagem modernos finamente ajustados (fine-tuning) para varredura comparativa de grandes volumes legais.',
 'Extended Legal Document Analysis',
 'Modern finely-tuned language models for comparative scanning of large-volume legal documents.',
 'Analyse de Documents Juridiques Longs',
 'Modèles de langage modernes affinés pour l''analyse comparative de documents juridiques à grand volume.');
INSERT INTO project_area (project_id, area_id) SELECT '22222222-0010-0000-0000-000000000010'::uuid, id FROM research_area WHERE slug = 'nlp';
INSERT INTO member_project (project_id, member_id, role) SELECT '22222222-0010-0000-0000-000000000010'::uuid, id, 'LEAD'    FROM member WHERE slug = 'fabricio-almeida-do-carmo';
INSERT INTO member_project (project_id, member_id, role) SELECT '22222222-0010-0000-0000-000000000010'::uuid, id, 'CO_LEAD' FROM member WHERE slug = 'ewaldo-eder-santana';

-- Project 11 from projects-data.ts (Gurupi Ecological DB).
INSERT INTO project (id, slug, status, tags, title_pt, description_pt, title_en, description_en, title_fr, description_fr) VALUES
('22222222-0011-0000-0000-000000000011', 'gurupi-ecological-db', 'ACTIVE',
 '["PostGIS", "Ecological Database", "Geospatial", "Biodiversity Monitoring"]'::jsonb,
 'Base de Dados Ecológica — Reserva Biológica do Gurupi',
 'Modelagem de banco de dados geoespacial multidimensional (PostgreSQL + PostGIS) para o monitoramento ecológico contínuo da biodiversidade na Reserva Biológica do Gurupi.',
 'Ecological Database — Gurupi Biological Reserve',
 'Multidimensional geospatial database (PostgreSQL + PostGIS) for continuous ecological biodiversity monitoring at the Gurupi Biological Reserve.',
 'Base de Données Écologique — Réserve Biologique de Gurupi',
 'Modélisation d''une base de données géospatiale multidimensionnelle (PostgreSQL + PostGIS) pour le suivi écologique continu de la biodiversité à la Réserve Biologique de Gurupi.');
INSERT INTO project_area (project_id, area_id) SELECT '22222222-0011-0000-0000-000000000011'::uuid, id FROM research_area WHERE slug IN ('iot', 'sensors');
INSERT INTO member_project (project_id, member_id, role) SELECT '22222222-0011-0000-0000-000000000011'::uuid, id, 'LEAD'       FROM member WHERE slug = 'laysa-cristinna-de-souza-cordeiro';
INSERT INTO member_project (project_id, member_id, role) SELECT '22222222-0011-0000-0000-000000000011'::uuid, id, 'RESEARCHER' FROM member WHERE slug = 'icaro-de-jesus-silva';
INSERT INTO member_project (project_id, member_id, role) SELECT '22222222-0011-0000-0000-000000000011'::uuid, id, 'CO_LEAD'    FROM member WHERE slug = 'ewaldo-eder-santana';
