# Skill Escalation Boundaries

## Owns

- Single-file HTML5/CSS/JS visualizations from Markdown, text, CSV, or approved blueprints.
- Ingest → design → compose → audit → refine pipeline for interactive report pages.
- Content-to-component mapping (`component-map.md`) and design tokens (`assets/design-tokens.md`).
- Long-form report UX: sticky TOC, scroll spy, progressive disclosure, citation appendix layout.
- Handoff rendering from `deep-research` report shape (sections, confidence, citations).

## Does Not Own

- Multi-source research execution, branch orchestration, or citation gathering → `deep-research`.
- Topic storage, research topic folders, or KB persistence → `research-analysis` / vault `vault-research-integration`.
- ArchiMate / EA diagrams, draw.io, Mermaid authoring as primary deliverable → `diagram`.
- Branded KION Word/PPT or corporate template packs → `kion-design`, `kion-pptx`, `kion-docx`.
- React/Vue app shells, A2UI/CopilotKit runtimes, or hosted agent UI frameworks.
- Canvas (.canvas) or slide-deck HTML presentations → `diagram` (canvas), `slides` (decks).

## Escalate To

| Trigger | Skill |
|---------|--------|
| User needs cited, multi-branch web research first | `deep-research` |
| Store or version the research topic in a vault | `research-analysis` or `vault-research-integration` |
| Complex architecture diagram (not a report section) | `diagram` |
| KION-branded colors/typography on HTML output | `kion-design` (tokens) then return here |
| Pitch deck / slide narrative (not scrollable report) | `slides` |
| Declarative agent UI inside an existing app catalog | Document A2UI/json-render path; do not force raw HTML |
| PDF/DOCX export as primary deliverable | `office-pdf`, `docx-documentation`, or vault `kion-docx` |

## Composition Rules

1. Prefer **blueprint → compose** for reports over ~12 sections or mixed data types.
2. When input is a `deep-research` report, follow `references/deep-research-handoff.md` before compose.
3. For security-sensitive embedded UIs inside products, recommend declarative specs (A2UI); this skill targets **portable static HTML artifacts**.
4. Do not duplicate `diagram` semantics—use `suggested_visualizations` from research as compose hints only; call `diagram` when the user wants a standalone diagram file.
