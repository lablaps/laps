-- ============================================
-- COMPARADOR E ATUALIZADOR DE MEMBROS DA EQUIPE LAPS
-- Data: 2025-12-19
-- Objetivo: Sincronizar Doutorandos, Mestrandos e Pesquisadores
-- ============================================

-- PASSO 1: Definir listas de membros válidos
-- Estes são os doutorandos que devem permanecer no sistema
WITH valid_phd_students AS (
  SELECT unnest(ARRAY[
    'Antonio Fhillipi Maciel Silva',
    'Dailan de Jesus Pereira Bernardes',
    'Fabrício Almeida do Carmo',
    'Freud Sebastian Bach Carvalho Lima',
    'Marcelo Viana da Silva',
    'Nilton Rodrigues Cantanhede',
    'Paulo Henrique Bezerra Carvalho',
    'Yanna Leidy Ketley Fernandes Cruz',
    'Wesley Batista Dominices',
    'Reinaldo Silva'
  ]) AS name
),

-- Estes são os mestrandos que devem permanecer no sistema
valid_master_students AS (
  SELECT unnest(ARRAY[
    'Breno Batista',
    'Elias Nazareno de Oliveira Azevedo',
    'Felipe Castro Viana',
    'Frank Wener Ribeiro Rodrigues',
    'José Carlos Costa Ferreira Júnior',
    'José Eduardo Carvalho Thomaz',
    'Lucas Souza Rodrigues',
    'Nildson de Castro Pinheiro Mello',
    'Pedro Víctor de Sousa Dantas',
    'Tiago Pereira Santana'
  ]) AS name
),

-- Estes são os pesquisadores que devem ser adicionados
valid_researchers AS (
  SELECT unnest(ARRAY[
    'MSc. Ana Paula Ferreira',
    'MSc. Danilo José dos Santos Costa',
    'MSc. David Silva e Silva'
  ]) AS name
),

-- PASSO 2: Identificar doutorandos a remover (não estão na lista válida)
phd_to_delete AS (
  SELECT tm.id, tm.name
  FROM team_members tm
  JOIN roles r ON tm.role_id = r.id
  WHERE r.name = 'Doutorando'
    AND tm.name NOT IN (SELECT name FROM valid_phd_students)
),

-- PASSO 3: Identificar mestrandos a remover (não estão na lista válida)
masters_to_delete AS (
  SELECT tm.id, tm.name
  FROM team_members tm
  JOIN roles r ON tm.role_id = r.id
  WHERE r.name = 'Mestrando'
    AND tm.name NOT IN (SELECT name FROM valid_master_students)
),

-- PASSO 4: Identificar pesquisadores a adicionar (não existem no sistema)
researchers_to_add AS (
  SELECT vr.name
  FROM valid_researchers vr
  WHERE NOT EXISTS (
    SELECT 1 FROM team_members tm
    WHERE tm.name = vr.name
  )
)

-- ============================================
-- RELATÓRIO: MEMBROS A REMOVER
-- ============================================
SELECT 
  'REMOVER - PhD' as action,
  name,
  id
FROM phd_to_delete

UNION ALL

SELECT 
  'REMOVER - Master',
  name,
  id
FROM masters_to_delete

UNION ALL

SELECT 
  'ADICIONAR - Pesquisador',
  name,
  NULL
FROM researchers_to_add

ORDER BY action DESC, name;


-- ============================================
-- SCRIPTS DE EXECUÇÃO (descomentar para executar)
-- ============================================

-- -- 1. REMOVER DOUTORANDOS INVÁLIDOS
-- DELETE FROM team_members
-- WHERE id IN (
--   SELECT tm.id
--   FROM team_members tm
--   JOIN roles r ON tm.role_id = r.id
--   WHERE r.name = 'Doutorando'
--     AND tm.name NOT IN (
--       'Antonio Fhillipi Maciel Silva',
--       'Dailan de Jesus Pereira Bernardes',
--       'Fabrício Almeida do Carmo',
--       'Freud Sebastian Bach Carvalho Lima',
--       'Marcelo Viana da Silva',
--       'Nilton Rodrigues Cantanhede',
--       'Paulo Henrique Bezerra Carvalho',
--       'Yanna Leidy Ketley Fernandes Cruz',
--       'Wesley Batista Dominices',
--       'Reinaldo Silva'
--     )
-- );

-- -- 2. REMOVER MESTRANDOS INVÁLIDOS
-- DELETE FROM team_members
-- WHERE id IN (
--   SELECT tm.id
--   FROM team_members tm
--   JOIN roles r ON tm.role_id = r.id
--   WHERE r.name = 'Mestrando'
--     AND tm.name NOT IN (
--       'Breno Batista',
--       'Elias Nazareno de Oliveira Azevedo',
--       'Felipe Castro Viana',
--       'Frank Wener Ribeiro Rodrigues',
--       'José Carlos Costa Ferreira Júnior',
--       'José Eduardo Carvalho Thomaz',
--       'Lucas Souza Rodrigues',
--       'Nildson de Castro Pinheiro Mello',
--       'Pedro Víctor de Sousa Dantas',
--       'Tiago Pereira Santana'
--     )
-- );

-- -- 3. ADICIONAR PESQUISADORES NOVOS
-- -- Primeiro, obter o ID do role 'Pesquisador' (ajuste conforme necessário)
-- INSERT INTO team_members (
--   name,
--   role_id,
--   email,
--   bio,
--   photo_url,
--   expertise,
--   research_areas,
--   social_links,
--   active,
--   created_at,
--   updated_at
-- ) VALUES
-- (
--   'MSc. Ana Paula Ferreira',
--   (SELECT id FROM roles WHERE name = 'Pesquisador' LIMIT 1),
--   NULL,
--   'Pesquisadora do LAPS',
--   NULL,
--   ARRAY[]::text[],
--   ARRAY[]::text[],
--   '{}'::jsonb,
--   true,
--   NOW(),
--   NOW()
-- ),
-- (
--   'MSc. Danilo José dos Santos Costa',
--   (SELECT id FROM roles WHERE name = 'Pesquisador' LIMIT 1),
--   NULL,
--   'Pesquisador do LAPS',
--   NULL,
--   ARRAY[]::text[],
--   ARRAY[]::text[],
--   '{}'::jsonb,
--   true,
--   NOW(),
--   NOW()
-- ),
-- (
--   'MSc. David Silva e Silva',
--   (SELECT id FROM roles WHERE name = 'Pesquisador' LIMIT 1),
--   NULL,
--   'Pesquisador do LAPS',
--   NULL,
--   ARRAY[]::text[],
--   ARRAY[]::text[],
--   '{}'::jsonb,
--   true,
--   NOW(),
--   NOW()
-- );
