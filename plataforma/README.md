# Plataforma Municipal de Educação no Trânsito (MVP)

Next.js (App Router) + TypeScript + Tailwind + Supabase. Educação no trânsito para ensino fundamental: vídeos, jogos e área do professor/gestor.

## Pré-requisitos

- Node.js 18+
- Conta [Supabase](https://supabase.com) (Auth, Postgres, Storage)

## Setup

1. **Clone e instale dependências**

   ```bash
   cd plataforma
   npm install
   ```

2. **Variáveis de ambiente**

   Copie o exemplo e preencha com as credenciais do seu projeto Supabase:

   ```bash
   cp .env.local.example .env.local
   ```

   Edite `.env.local` com:

   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`

3. **Banco de dados**

   Crie as tabelas no Supabase (SQL Editor) usando as migrations em `db/migrations/` (quando existirem). Consulte o documento de desenvolvimento na pasta `educacao-transito` para o schema.

4. **Rodar em desenvolvimento**

   ```bash
   npm run dev
   ```

   Acesse [http://localhost:3001](http://localhost:3001).  
   (Porta 3001 para não conflitar com outros projetos na 3000, ex.: DVCE.)

## Rotas

| Rota | Descrição |
|------|-----------|
| `/` | Landing |
| `/t/[tenantSlug]` | Programa do município (coleções) |
| `/t/[tenantSlug]/colecoes/[id]` | Episódios da coleção |
| `/t/[tenantSlug]/episodios/[id]` | Episódio (vídeo + jogo + guia professor) |
| `/t/[tenantSlug]/jogos/[id]` | Página do jogo |
| `/aluno` | Área do aluno (desenvolvimento + atividades) |
| `/professor` | Área do professor (visão da turma) |
| `/gestor` | Painel do gestor (KPIs) |
| `/admin` | Admin (CRUD, marca) |

## Próximos passos (Etapa 2)

- Migrations SQL (tenants, collections, episodes, games, schools, classes, users, progress_events)
- RLS por role
- Seed e CRUD Admin (coleções/episódios)
- Páginas públicas com dados do Supabase

Documento completo: `../plataforma_educacao_no_transito_documento_de_desenvolvimento_mvp_para_a_feira.md`  
Planejamento em etapas/horas: `../PLANEJAMENTO_MVP_ETAPAS_HORAS.md`
