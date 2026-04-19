# Pipeline scripts

## Current token workflow

1. In Figma, run the **variables2json** plugin on the AI-Native DS file.
2. Save the output to `tokens/_raw/figma-export.json`.
3. Run `pnpm tokens:normalize` to transform into DTCG-format `tokens/core.tokens.json`.
4. Commit both files.

Manual steps 1–2 are a constraint, not a choice: Figma's Variables REST API
(which would automate this) requires the `file_variables:read` scope, gated
to Enterprise plans. The plugin-based workflow achieves the same end state
with two manual steps.

## Scripts

- `normalize-tokens.ts` — plugin export → DTCG
- `figma-to-tokens.enterprise.example.ts` — reference impl for Enterprise accounts
