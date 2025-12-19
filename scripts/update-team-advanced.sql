-- ============================================
-- SCRIPT AVANÇADO: COMPARAÇÃO E SINCRONIZAÇÃO
-- Versão com Transações e Rollback
-- ============================================

-- ============================================
-- PASSO 1: ANÁLISE PRELIMINAR (SEM MODIFICAÇÕES)
-- ============================================

-- Relatório detalhado do que será modificado
WITH valid_phd AS (
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
valid_masters AS (
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
valid_researchers AS (
  SELECT unnest(ARRAY[
    'MSc. Ana Paula Ferreira',
    'MSc. Danilo José dos Santos Costa',
    'MSc. David Silva e Silva'
  ]) AS name
),
current_phd AS (
  SELECT tm.id, tm.name, r.name as role_name
  FROM team_members tm
  JOIN roles r ON tm.role_id = r.id
  WHERE r.name = 'Doutorando' AND tm.active = true
),
current_masters AS (
  SELECT tm.id, tm.name, r.name as role_name
  FROM team_members tm
  JOIN roles r ON tm.role_id = r.id
  WHERE r.name = 'Mestrando' AND tm.active = true
),
current_researchers AS (
  SELECT tm.id, tm.name, r.name as role_name
  FROM team_members tm
  JOIN roles r ON tm.role_id = r.id
  WHERE r.name = 'Pesquisador' AND tm.active = true
)

SELECT 
  '===== DOUTORANDOS =====' as section, 
  NULL::text as status,
  NULL::text as name,
  NULL::int as member_id
UNION ALL
SELECT '   VÁLIDOS', NULL, NULL, NULL
UNION ALL
SELECT '   ✓ Deve manter', vp.name, NULL, NULL
FROM valid_phd vp
UNION ALL
SELECT '', NULL, NULL, NULL
UNION ALL
SELECT '   INVÁLIDOS', NULL, NULL, NULL
UNION ALL
SELECT '   ✗ Deve remover', cp.name, cp.id, NULL
FROM current_phd cp
WHERE cp.name NOT IN (SELECT name FROM valid_phd)

UNION ALL
SELECT '', NULL, NULL, NULL
UNION ALL
SELECT '===== MESTRANDOS =====', NULL, NULL, NULL
UNION ALL
SELECT '   VÁLIDOS', NULL, NULL, NULL
UNION ALL
SELECT '   ✓ Deve manter', vm.name, NULL, NULL
FROM valid_masters vm
UNION ALL
SELECT '', NULL, NULL, NULL
UNION ALL
SELECT '   INVÁLIDOS', NULL, NULL, NULL
UNION ALL
SELECT '   ✗ Deve remover', cm.name, cm.id, NULL
FROM current_masters cm
WHERE cm.name NOT IN (SELECT name FROM valid_masters)

UNION ALL
SELECT '', NULL, NULL, NULL
UNION ALL
SELECT '===== PESQUISADORES =====', NULL, NULL, NULL
UNION ALL
SELECT '   NOVOS', NULL, NULL, NULL
UNION ALL
SELECT '   ✓ Deve adicionar', vr.name, NULL, NULL
FROM valid_researchers vr
WHERE NOT EXISTS (
  SELECT 1 FROM team_members tm
  WHERE tm.name = vr.name
)
UNION ALL
SELECT '', NULL, NULL, NULL
UNION ALL
SELECT '   EXISTENTES', NULL, NULL, NULL
UNION ALL
SELECT '   → Já está', crr.name, crr.id, NULL
FROM current_researchers crr

ORDER BY section, status DESC, name;

-- ============================================
-- RESUMO ESTATÍSTICO
-- ============================================

SELECT 
  'RESUMO DE ALTERAÇÕES' as secao,
  COUNT(*) FILTER (WHERE role = 'Doutorando' AND status = 'REMOVER') as phd_to_delete,
  COUNT(*) FILTER (WHERE role = 'Mestrando' AND status = 'REMOVER') as masters_to_delete,
  COUNT(*) FILTER (WHERE role = 'Pesquisador' AND status = 'ADICIONAR') as researchers_to_add
FROM (
  SELECT 
    CASE 
      WHEN tm.name NOT IN (
        SELECT * FROM (VALUES 
          ('Antonio Fhillipi Maciel Silva'),
          ('Dailan de Jesus Pereira Bernardes'),
          ('Fabrício Almeida do Carmo'),
          ('Freud Sebastian Bach Carvalho Lima'),
          ('Marcelo Viana da Silva'),
          ('Nilton Rodrigues Cantanhede'),
          ('Paulo Henrique Bezerra Carvalho'),
          ('Yanna Leidy Ketley Fernandes Cruz'),
          ('Wesley Batista Dominices'),
          ('Reinaldo Silva')
        ) AS valid(name)) THEN 'REMOVER'
      ELSE 'MANTER'
    END as status,
    r.name as role,
    tm.name,
    tm.id
  FROM team_members tm
  JOIN roles r ON tm.role_id = r.id
  WHERE r.name = 'Doutorando' AND tm.active = true

  UNION ALL

  SELECT 
    CASE 
      WHEN tm.name NOT IN (
        SELECT * FROM (VALUES 
          ('Breno Batista'),
          ('Elias Nazareno de Oliveira Azevedo'),
          ('Felipe Castro Viana'),
          ('Frank Wener Ribeiro Rodrigues'),
          ('José Carlos Costa Ferreira Júnior'),
          ('José Eduardo Carvalho Thomaz'),
          ('Lucas Souza Rodrigues'),
          ('Nildson de Castro Pinheiro Mello'),
          ('Pedro Víctor de Sousa Dantas'),
          ('Tiago Pereira Santana')
        ) AS valid(name)) THEN 'REMOVER'
      ELSE 'MANTER'
    END as status,
    r.name as role,
    tm.name,
    tm.id
  FROM team_members tm
  JOIN roles r ON tm.role_id = r.id
  WHERE r.name = 'Mestrando' AND tm.active = true

  UNION ALL

  SELECT 
    CASE 
      WHEN tm.name IN (
        SELECT * FROM (VALUES 
          ('MSc. Ana Paula Ferreira'),
          ('MSc. Danilo José dos Santos Costa'),
          ('MSc. David Silva e Silva')
        ) AS new(name))
      THEN 'ADICIONAR'
      ELSE 'MANTER'
    END as status,
    r.name as role,
    tm.name,
    tm.id
  FROM team_members tm
  JOIN roles r ON tm.role_id = r.id
  WHERE r.name = 'Pesquisador' AND tm.active = true
) summary;

-- ============================================
-- SCRIPT COM TRANSAÇÃO (USE COM CUIDADO)
-- ============================================

/*
BEGIN TRANSACTION;

-- 1. Remover doutorandos inválidos
DELETE FROM team_members WHERE id IN (
  SELECT tm.id FROM team_members tm
  JOIN roles r ON tm.role_id = r.id
  WHERE r.name = 'Doutorando'
    AND tm.name NOT IN (
      'Antonio Fhillipi Maciel Silva', 'Dailan de Jesus Pereira Bernardes',
      'Fabrício Almeida do Carmo', 'Freud Sebastian Bach Carvalho Lima',
      'Marcelo Viana da Silva', 'Nilton Rodrigues Cantanhede',
      'Paulo Henrique Bezerra Carvalho', 'Yanna Leidy Ketley Fernandes Cruz',
      'Wesley Batista Dominices', 'Reinaldo Silva'
    )
);

-- 2. Remover mestrandos inválidos
DELETE FROM team_members WHERE id IN (
  SELECT tm.id FROM team_members tm
  JOIN roles r ON tm.role_id = r.id
  WHERE r.name = 'Mestrando'
    AND tm.name NOT IN (
      'Breno Batista', 'Elias Nazareno de Oliveira Azevedo',
      'Felipe Castro Viana', 'Frank Wener Ribeiro Rodrigues',
      'José Carlos Costa Ferreira Júnior', 'José Eduardo Carvalho Thomaz',
      'Lucas Souza Rodrigues', 'Nildson de Castro Pinheiro Mello',
      'Pedro Víctor de Sousa Dantas', 'Tiago Pereira Santana'
    )
);

-- 3. Adicionar pesquisadores novos
INSERT INTO team_members (name, role_id, email, bio, photo_url, expertise, research_areas, social_links, active, created_at, updated_at)
SELECT 
  unnest AS name,
  (SELECT id FROM roles WHERE name = 'Pesquisador' LIMIT 1),
  NULL,
  'Pesquisador(a) do LAPS',
  NULL,
  ARRAY[]::text[],
  ARRAY[]::text[],
  '{}'::jsonb,
  true,
  NOW(),
  NOW()
FROM (
  SELECT unnest(ARRAY[
    'MSc. Ana Paula Ferreira',
    'MSc. Danilo José dos Santos Costa',
    'MSc. David Silva e Silva'
  ]) AS unnest
) new_researchers
WHERE unnest NOT IN (
  SELECT name FROM team_members
);

COMMIT;
-- Em caso de erro, execute: ROLLBACK;
*/
