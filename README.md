# LAPS - Laboratório de Aquisição e Processamento de Sinais

Site oficial do Laboratório de Aquisição e Processamento de Sinais (LAPS) da Universidade Estadual de Maringá (UEM).

## 🚀 Deploy no GitHub Pages

Este projeto está totalmente configurado para deploy automático no GitHub Pages.

### 1. Configuração do Repositório

1. **Criar repositório no GitHub**
2. **Fazer push do código:**
   ```bash
   git init
   git add .
   git commit -m "Initial commit - LAPS website"
   git branch -M main
   git remote add origin https://github.com/SEU_USUARIO/laps-nextjs.git
   git push -u origin main
   ```

3. **Configurar GitHub Pages:**
   - Ir em **Settings** > **Pages**
   - Em **Source**, selecionar **GitHub Actions**

### 2. Deploy Automático

O deploy acontece automaticamente quando você faz push para a branch `main`. O workflow está configurado em `.github/workflows/deploy.yml`.

### 3. Deploy Manual Local

Para testar o build localmente:

```bash
npm install
npm run build
npm run deploy
```

### 4. Desenvolvimento Local

```bash
npm install
npm run dev
```

O site estará disponível em `http://localhost:3000`.

## 🛠 Tecnologias Utilizadas

- **Next.js 15** - Framework React com App Router
- **TypeScript** - Tipagem estática
- **Tailwind CSS** - Framework de CSS utilitário
- **Framer Motion** - Animações
- **Radix UI** - Componentes acessíveis
- **Lucide React** - Ícones
- **React Hook Form** - Gerenciamento de formulários
- **Zod** - Validação de esquemas

## 📁 Estrutura do Projeto

```
src/
├── app/                 # App Router (Next.js 13+)
│   ├── contato/        # Página de contato
│   ├── equipe/         # Página da equipe
│   ├── eventos/        # Página de eventos
│   ├── noticias/       # Página de notícias
│   ├── projetos/       # Página de projetos
│   └── sobre/          # Página sobre
├── components/          # Componentes reutilizáveis
│   ├── layout/         # Header, Footer, Navbar
│   ├── sections/       # Seções da homepage
│   └── ui/            # Componentes UI (Radix-based)
├── data/               # Dados mockados
├── lib/                # Utilitários
└── types/              # Tipos TypeScript
```

## 🎨 Características

- ✅ Design moderno e responsivo
- ✅ Animação de ondas senoidais interativa
- ✅ Seções para equipe, projetos, notícias e eventos
- ✅ Sistema de navegação completo
- ✅ Otimizado para SEO
- ✅ Build estático para GitHub Pages
- ✅ Formulários funcionais
- ✅ Modo escuro/claro (futuro)

## 🔧 Configurações Específicas para GitHub Pages

- **Output estático:** `output: 'export'` no `next.config.ts`
- **Trailing slash:** Habilitado para compatibilidade
- **Imagens não otimizadas:** Para funcionar sem servidor
- **Workflow automático:** Deploy via GitHub Actions
- **Arquivo .nojekyll:** Para preservar arquivos iniciados com _

## 📄 Scripts Disponíveis

- `npm run dev` - Desenvolvimento local
- `npm run build` - Build de produção
- `npm run start` - Servidor local (após build)
- `npm run lint` - Verificação de código
- `npm run deploy` - Build + preparação para deploy

## 📞 Contato

**LAPS - Laboratório de Aquisição e Processamento de Sinais**  
Universidade Estadual de Maringá (UEM)  
Departamento de Informática  

**Website:** [Será disponibilizado após o deploy]

## 📝 Licença

Este projeto é desenvolvido para fins acadêmicos pela UEM.
