# 📋 Guia de Atualização dos Membros - LAPS

## Resumo das Alterações

Este script sincroniza a lista de membros da equipe LAPS com base nas listas fornecidas de Doutorandos, Mestrandos e Pesquisadores.

### Categorias de Membros

#### ✅ Doutorandos (10 membros válidos)
1. Antonio Fhillipi Maciel Silva
2. Dailan de Jesus Pereira Bernardes
3. Fabrício Almeida do Carmo
4. Freud Sebastian Bach Carvalho Lima
5. Marcelo Viana da Silva
6. Nilton Rodrigues Cantanhede
7. Paulo Henrique Bezerra Carvalho
8. Yanna Leidy Ketley Fernandes Cruz
9. Wesley Batista Dominices
10. Reinaldo Silva

#### ✅ Mestrandos (10 membros válidos)
1. Breno Batista
2. Elias Nazareno de Oliveira Azevedo
3. Felipe Castro Viana
4. Frank Wener Ribeiro Rodrigues
5. José Carlos Costa Ferreira Júnior
6. José Eduardo Carvalho Thomaz
7. Lucas Souza Rodrigues
8. Nildson de Castro Pinheiro Mello
9. Pedro Víctor de Sousa Dantas
10. Tiago Pereira Santana

#### ✅ Pesquisadores (3 membros a adicionar)
1. MSc. Ana Paula Ferreira
2. MSc. Danilo José dos Santos Costa
3. MSc. David Silva e Silva

---

## 📝 Como Usar

### Passo 1: Executar o Relatório (Verificação)

Primeiro, execute **APENAS** o primeiro SELECT para ver quais membros serão afetados:

```sql
-- Copie e execute tudo do arquivo update-team-members.sql
-- até a seção "SCRIPTS DE EXECUÇÃO"
```

Isso mostrará uma lista de:
- **REMOVER - PhD**: Doutorandos que NÃO estão na lista válida
- **REMOVER - Master**: Mestrandos que NÃO estão na lista válida
- **ADICIONAR - Pesquisador**: Pesquisadores que precisam ser adicionados

### Passo 2: Revisar os Resultados

Certifique-se de que os nomes corresponderam corretamente. Se houver erros de digitação, corrija-os **antes** de executar as deletes.

### Passo 3: Executar as Atualizações

Após revisar, descomente e execute **cada bloco sequencialmente**:

#### 3.1 Remover Doutorandos Inválidos
```sql
DELETE FROM team_members
WHERE id IN (
  SELECT tm.id
  FROM team_members tm
  JOIN roles r ON tm.role_id = r.id
  WHERE r.name = 'Doutorando'
    AND tm.name NOT IN (
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
    )
);
```

#### 3.2 Remover Mestrandos Inválidos
```sql
DELETE FROM team_members
WHERE id IN (
  SELECT tm.id
  FROM team_members tm
  JOIN roles r ON tm.role_id = r.id
  WHERE r.name = 'Mestrando'
    AND tm.name NOT IN (
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
    )
);
```

#### 3.3 Adicionar Pesquisadores Novos
```sql
INSERT INTO team_members (
  name,
  role_id,
  email,
  bio,
  photo_url,
  expertise,
  research_areas,
  social_links,
  active,
  created_at,
  updated_at
) VALUES
(
  'MSc. Ana Paula Ferreira',
  (SELECT id FROM roles WHERE name = 'Pesquisador' LIMIT 1),
  NULL,
  'Pesquisadora do LAPS',
  NULL,
  ARRAY[]::text[],
  ARRAY[]::text[],
  '{}'::jsonb,
  true,
  NOW(),
  NOW()
),
(
  'MSc. Danilo José dos Santos Costa',
  (SELECT id FROM roles WHERE name = 'Pesquisador' LIMIT 1),
  NULL,
  'Pesquisador do LAPS',
  NULL,
  ARRAY[]::text[],
  ARRAY[]::text[],
  '{}'::jsonb,
  true,
  NOW(),
  NOW()
),
(
  'MSc. David Silva e Silva',
  (SELECT id FROM roles WHERE name = 'Pesquisador' LIMIT 1),
  NULL,
  'Pesquisador do LAPS',
  NULL,
  ARRAY[]::text[],
  ARRAY[]::text[],
  '{}'::jsonb,
  true,
  NOW(),
  NOW()
);
```

---

## ⚠️ Importante

### Antes de Executar:

1. **Faça um Backup** de sua base de dados
2. **Execute em Ambiente de Teste** primeiro
3. **Verifique os Nomes** - O script usa correspondência exata (CASE SENSITIVE)
4. **Confirme o Role ID** - Certifique-se de que existe um role chamado 'Pesquisador'

### Verificar se o Role Existe:

```sql
SELECT id, name, level FROM roles WHERE name IN ('Doutorando', 'Mestrando', 'Pesquisador');
```

Se não houver 'Pesquisador', crie-o:

```sql
INSERT INTO roles (name, level, description, created_at)
VALUES ('Pesquisador', 4, 'Pesquisador do LAPS', NOW());
```

---

## 🔍 Verificação Pós-Atualização

Após executar, verifique o resultado:

```sql
-- Contar membros por role
SELECT 
  r.name as role,
  COUNT(tm.id) as total
FROM team_members tm
JOIN roles r ON tm.role_id = r.id
WHERE tm.active = true
GROUP BY r.name
ORDER BY r.name;

-- Ver todos os doutorandos atuais
SELECT name FROM team_members tm
JOIN roles r ON tm.role_id = r.id
WHERE r.name = 'Doutorando' AND tm.active = true
ORDER BY name;

-- Ver todos os mestrandos atuais
SELECT name FROM team_members tm
JOIN roles r ON tm.role_id = r.id
WHERE r.name = 'Mestrando' AND tm.active = true
ORDER BY name;

-- Ver todos os pesquisadores atuais
SELECT name FROM team_members tm
JOIN roles r ON tm.role_id = r.id
WHERE r.name = 'Pesquisador' AND tm.active = true
ORDER BY name;
```

---

## 📌 Localização do Arquivo

- **Script SQL**: `scripts/update-team-members.sql`
- **Instruções**: Este arquivo (GUIA_UPDATE_TEAM.md)

Execute em: **Supabase SQL Editor** ou **pgAdmin**

---

**Data de Criação**: 19/12/2025  
**Status**: ✅ Pronto para execução
