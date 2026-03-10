# Padrão para importação de aulas

Use este formato nos documentos para que as aulas sejam criadas automaticamente no Rua do Saber.

---

## Formato do arquivo

- **Extensão:** `.md` (Markdown)
- **Estrutura:** bloco **YAML no topo** (metadados) + **seções em Markdown** (conteúdo pedagógico)

### 1. Cabeçalho YAML (entre \`---\`)

Todos os campos abaixo são opcionais, exceto **title**. Use os **nomes exatos** de coleção, ano, pilar e habilidade já cadastrados no sistema (ou deixe em branco).

\`\`\`yaml
---
title: "Título da aula"
slug: "url-amigavel"
summary: "Resumo em uma linha."
number_in_collection: 1
status: draft
collection: "Nome da Coleção"
grade: "1º ano"
pillar: "Comportamento"
skill: "Respeitar a sinalização"
youtube_url: "https://www.youtube.com/watch?v=..."
thumbnail_url: ""
card_name: "Nome do card"
card_description: "Descrição do card."
card_image_url: ""
game_type: "quiz"
---
\`\`\`

**status:** draft | review | published | archived  
**game_type:** quiz | decision | memory | match  

**Referências (collection, grade, pillar, skill):** o importador busca no banco pelo **nome**. Cadastre antes no Supabase ou deixe vazio.

### 2. Seções em Markdown

Use exatamente estes títulos. O texto sob cada um vai para o campo correspondente.

| Título no documento | Campo no sistema |
|--------------------|------------------|
| \`## Objetivo de aprendizagem\` | Objetivo da aula |
| \`## Introdução para o professor\` | Introdução ao professor |
| \`## Perguntas para debate\` | Perguntas para debate (uma por linha com \`-\`) |
| \`## Descrição da atividade\` | Atividade prática |
| \`## Missão para casa\` | Missão para casa |

---

## Exemplo completo

Veja \`docs/templates/aula-exemplo.md\`.

---

## Como importar

1. **Script:** coloque os \`.md\` em uma pasta e rode:
   \`cd plataforma && npx tsx scripts/import-lessons.ts ../docs/aulas\`
   Use \`SUPABASE_SERVICE_ROLE_KEY\` no \`.env.local\` para o script criar aulas.

2. **Interface:** futura tela "Importar" no admin.
