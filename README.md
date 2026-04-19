# ai-native-ds

An experiment in design systems built for AI agents as first-class consumers.

## The premise

Most design systems are documented for humans browsing a docs site. But increasingly, the consumer of a design system is a program — an LLM generating UI from a Figma file, an agent composing components from a prompt, a code assistant choosing the right token for "the confirm button."

When the consumer is a program, prose is ambiguity and ambiguity gets hallucinated. This project explores what changes when you treat the design system itself as machine-readable: specs as source of truth, tokens as DTCG JSON, components as structured contracts, docs as a byproduct.

## The model

    Figma (design)  →  Tokens + Specs (source of truth)  →  Code + Docs + AI endpoint (outputs)

Designers work in Figma. Variables sync to DTCG tokens. Component specs (JSON) define props, states, rules, a11y, and token bindings. Code, docs, and an MCP endpoint for AI agents all generate from the specs.

## Structure

- `tokens/` — DTCG-format design tokens, generated from Figma Variables
- `components/` — one folder per component: spec, code, stories, AI-optimized docs
- `schemas/` — JSON Schema contracts that every spec validates against
- `scripts/` — Figma extraction, code generation, docs generation
- `llms.txt` — AI entry point

## Status

Week 1 of a 10-week experiment. Case study to follow.
