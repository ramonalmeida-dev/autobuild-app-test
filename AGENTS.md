# Autobuild Agent — Instruções de trabalho

## Stack e convenções

- Use sempre os componentes e primitivos existentes antes de criar novos.
- Mantenha consistência com o estilo de código do repositório.
- Siga o discovery como fonte de verdade funcional.
- Abra um PR quando solicitado ou ao concluir a tarefa.
- Nunca altere arquivos fora do escopo da tarefa.
- Lint e typecheck devem passar antes de concluir.

## Supabase MCP

Não há MCP do Supabase configurado para este run.
Se precisar interagir com banco de dados, use apenas o código e migrations do repositório como referência.

## Qualidade de código

- Sem `console.log` de debug no código final.
- Tipos TypeScript explícitos — evite `any`.
- Componentes React com props tipadas.
- Sem comentários que apenas descrevem o óbvio.
