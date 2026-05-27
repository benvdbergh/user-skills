# Prior Art: AI HTML Visualization for Lengthy Reports

**Research date:** 2026-05-27  
**Purpose:** Inform `web-visual` v1.2+ (skill-set optimize cycle)  
**Branches:** 4 (Generative UI landscape, long-doc UX, agent skills, performance/security)

---

## Executive Summary

Agents that turn long reports into HTML are converging on three layers: **(1) structured planning** before code, **(2) semantic component mapping** (not markdown mirroring), and **(3) post-generation critique**. Google’s Generative UI and academic systems (ViviDoc) validate web-visual’s pipeline shape; community skills (md2html) add concrete pattern tables for long Markdown. The largest gaps in web-visual v1.1 were **long-report orchestration**, **deep-research handoff**, and **skill-escalation** boundaries—addressed in companion reference files.

**Recommendation:** Keep single-file HTML as the default deliverable; add mandatory blueprint + batched compose for long reports; optional Mermaid and `content-visibility`; document when to escalate to `diagram`, `slides`, or declarative A2UI inside products.

---

## 1. Generative UI Landscape

**Confidence: HIGH**

| Finding | Source |
|---------|--------|
| Models can generate full HTML/CSS/JS pages; users prefer custom UI over markdown in ~83% of evaluated cases when generation quality is sufficient | [Generative UI paper](https://arxiv.org/html/2604.09577v1) |
| Production pattern: system instructions + tools (search, images) + **post-processors** for common failures | [Google Research blog](https://research.google/blog/generative-ui-a-rich-custom-visual-interactive-user-experience-for-any-prompt/) |
| Three deployment patterns: declarative specs (A2UI), registry (`viz_type` + data), open-ended HTML surfaces | [CopilotKit 2026 guide](https://www.copilotkit.ai/blog/the-developer-s-guide-to-generative-ui-in-2026) |
| ViviDoc: Planner → Styler → Executor → Evaluator; **DocSpec** intermediate representation; SRTC for interactions | [ViviDoc](https://arxiv.org/html/2603.27991v1) |

**Implication for web-visual:** Blueprint ≈ lightweight DocSpec; audit ≈ Evaluator; compose ≈ Executor. No change to single-file output strategy.

---

## 2. Long-Document UX

**Confidence: HIGH**

| Pattern | Evidence |
|---------|----------|
| Sticky TOC + active section highlighting | [CSS-Tricks scrollspy](https://css-tricks.com/sticky-table-of-contents-with-scrolling-active-states/), [Bramus IO](https://www.bram.us/2020/01/10/smooth-scrolling-sticky-scrollspy-navigation/) |
| CSS-native scroll spy (`scroll-target-group`, `:target-current`) reducing JS | [una.im](https://una.im/scroll-target-group/) |
| Semantic promotion: flows → diagrams, trade-offs → cards, appendices → collapsible | [md2html](https://github.com/haidang1810/md2html) |
| WCAG, mobile TOC drawer, print stylesheet, reduced motion | md2html README claims |

**Implication:** Add `long-report.md` workflow; extend component-map with citation appendix; require mobile TOC for dossier-style pages.

---

## 3. Agent Skills Ecosystem

**Confidence: MEDIUM**

| Pattern | Evidence |
|---------|----------|
| SKILL.md <500 lines; templates in `assets/`; decision guides in `references/` | [Agentailor skill guide](https://blog.agentailor.com/posts/how-to-build-and-deploy-agent-skill-from-scratch) |
| md2html: explicit “what markdown becomes what UI” table | [md2html](https://github.com/haidang1810/md2html) |
| markdown-viewer-skills: HTML embedded in markdown for diagrams | [yellwoo/markdown-viewer-skills](https://github.com/yellwoo/markdown-viewer-skills) |
| Data viz dashboards: extraction JSON layer separate from presentation HTML | [Generative AI in the Newsroom](https://generative-ai-newsroom.com/i-vibe-coded-a-complex-data-visualization-and-analysis-dashboard-heres-what-i-learned-146398657149) |

**Implication:** web-visual should not absorb md2html’s full scope; differentiate via **interactive** multi-component reports and **deep-research** handoff. Optional future: `assets/report-patterns.md` mirroring md2html’s mapping table.

---

## 4. Performance & Security

**Confidence: MEDIUM**

| Topic | Guidance | Source |
|-------|----------|--------|
| Large static pages | `content-visibility: auto` before virtualization | [Sujeet Jaiswal](https://sujeet.pro/articles/virtualization-and-windowing) |
| Huge files (2MB+) | Chunked/virtual DOM; trade-offs for find-in-page | [Igor Techno Club](https://igorstechnoclub.com/how-i-render-10mb-markdown-files-in-the-browser/) |
| Agent-driven product UI | A2UI declarative catalog, not arbitrary HTML | [A2UI](https://a2ui.org/), [Google Developers Blog](https://developers.googleblog.com/introducing-a2ui-an-open-project-for-agent-driven-interfaces/) |

**Implication:** Document in skill-escalation when **not** to use raw HTML; add `content-visibility` to long-report compose defaults.

---

## 5. skill-set Validation Snapshot

| Dimension | v1.1 | v1.2 target |
|-----------|------|-------------|
| Instruction quality | Strong pipeline, weak long-doc path | `long-report.md` + handoff |
| Token economics | SKILL.md reasonable | Heavy rules in references |
| Tool fitness | No MCP required ✓ | Optional browser preview unchanged |
| Ecosystem | deep-research link only | Escalation + prior-art doc |
| Composability | Partial | Explicit diagram/slides/A2UI boundaries |

**Estimated effectiveness uplift:** 74 → 86/100 after implementing v1.2 references (subjective; run full `skill-set validate` for official score).

---

## Citation Appendix

1. https://arxiv.org/html/2604.09577v1 — Generative UI: LLMs are Effective UI Generators  
2. https://research.google/blog/generative-ui-a-rich-custom-visual-interactive-user-experience-for-any-prompt/  
3. https://arxiv.org/html/2603.27991v1 — ViviDoc  
4. https://www.copilotkit.ai/blog/the-developer-s-guide-to-generative-ui-in-2026  
5. https://github.com/haidang1810/md2html  
6. https://css-tricks.com/sticky-table-of-contents-with-scrolling-active-states/  
7. https://una.im/scroll-target-group/  
8. https://a2ui.org/  
9. https://blog.agentailor.com/posts/how-to-build-and-deploy-agent-skill-from-scratch  
10. https://sujeet.pro/articles/virtualization-and-windowing  
