---
name: enterprise-architecture
description: >-
  Global, tool-agnostic enterprise architecture skill combining ArchiMate
  ontology, arc42 documentation framework, and model quality workflows.
  USE WHEN enterprise architecture modeling, ArchiMate entity classification,
  entity extraction, relationship proposals, gap analysis, arc42 documentation,
  visual layout best practices, model quality review, metamodel design,
  architecture process, ontology-guided modeling.
---

# enterprise-architecture

Global enterprise architecture skill that owns all ArchiMate + arc42 methodology: entity classification, entity extraction, relationship proposals, gap analysis, visual layout best practices, and model quality review. It is **tool-agnostic** — archiscribe is optional; the `diagram` skill is the default output mechanism.

**Invoke when:** user asks to model enterprise architecture, extract ArchiMate entities from text, propose relationships, classify enterprise content, run gap analysis, apply arc42 documentation structure, validate model quality, or apply visual best practices to architecture diagrams.

> **Note on project-local ontology:** The live enterprise ontology (`ontology-v1.json`) lives in the project-local skill at `.claude/skills/enterprise-model-store/references/ontology-v1.json`. Load it when extracting entities or proposing relationships. The human-readable documentation is in `references/ontology-v1.md` (this skill).

---

## MCP Dependencies

| Tool | Role | Required? |
|------|------|-----------|
| `archiscribe` | ArchiMate model CRUD (create, update, read elements and relationships) | **Optional** — use when available; fall back to `diagram` skill otherwise |
| `diagram` | Default output mechanism for views and diagrams (draw.io, Excalidraw, Mermaid, PlantUML) | **Default** |

**Pattern:** Use archiscribe if available in the current context; otherwise emit a diagram-ready graph slice and delegate visual output to the `diagram` skill.

---

## Workflow Routing

| Workflow | Trigger | File |
|----------|---------|------|
| **ClassifyText** | "classify text", "what domain", "scope analysis", "enterprise text" | `references/ClassifyText.md` |
| **ExtractEntities** | "extract entities", "text to entities", "entity extraction", "find entities" | `references/ExtractEntities.md` |
| **ProposeRelationships** | "propose relationships", "connect entities", "relationship analysis" | `references/ProposeRelationships.md` |
| **DetectModelGaps** | "gap analysis", "detect gaps", "model completeness", "missing connections" | `references/DetectModelGaps.md` |
| **ApplyVisualBestPractices** | "create view", "update view", "layout diagram", "visual best practices" | `references/ApplyVisualBestPractices.md` |
| **QualityReview** | "validate architecture", "quality review", "architectural logic", "gap analysis" | `references/QualityReview.md` |

---

## Standard Workflow (End-to-End)

1. **Classify text** → `references/ClassifyText.md`
2. **Extract entities** → `references/ExtractEntities.md` (loads project-local `ontology-v1.json`)
3. **Propose relationships** → `references/ProposeRelationships.md`
4. **Detect gaps** → `references/DetectModelGaps.md`
5. **Apply visual layout** → `references/ApplyVisualBestPractices.md`
6. **Quality review** → `references/QualityReview.md`

---

## Framework Overview

This skill implements a comprehensive enterprise architecture framework organized into four layers:

1. **Layer 1: Metamodel** (Source of Truth) — `references/MetamodelDesign.md`
2. **Layer 2: Modeling Frameworks** (Projection Rules) — `references/ModelingApproaches.md`
3. **Layer 3: arc42** (Documentation Templates) — `references/arc42.md`
4. **Layer 4: Visualization** (Tool-agnostic) — `references/ApplyVisualBestPractices.md`

See `references/FourLayerStack.md` for complete details.

---

## References

### Methodology Workflows
| File | Purpose |
|------|---------|
| `references/ClassifyText.md` | Classify enterprise text by domain and scope |
| `references/ExtractEntities.md` | Extract ArchiMate-aligned entities from text |
| `references/ProposeRelationships.md` | Propose relationships between entities |
| `references/DetectModelGaps.md` | Detect gaps and missing connections in model |

### Ontology & Mapping
| File | Purpose |
|------|---------|
| `references/ontology-v1.md` | Human-readable ArchiMate ontology documentation |
| `references/ArchimateMappingGuide.md` | Consulting terminology to ArchiMate type mapping |
| `references/LlmReferenceGuide.md` | LLM reference resolution guide |
| `references/IntegrationPatterns-DiagramDocsEA.md` | Integration patterns: diagram, docs, and EA skill interop |

### Core Framework
| File | Purpose |
|------|---------|
| `references/FourLayerStack.md` | Four-layer architecture stack |
| `references/arc42.md` | arc42 documentation structure and zoom levels |
| `references/ArchitectureProcess.md` | Six-phase architecture process |

### Reference Materials
| File | Purpose |
|------|---------|
| `references/MetamodelDesign.md` | Metamodel structure and domain extensions |
| `references/ModelingApproaches.md` | C4, BPMN-lite, and domain modeling approaches |
| `references/ValidationRules.md` | Metamodel validation rules |
| `references/QualityAssurance.md` | Quality checks and stakeholder views |

### Visual & Quality Workflows
| File | Purpose |
|------|---------|
| `references/ApplyVisualBestPractices.md` | ArchiMate visual layout best practices |
| `references/QualityReview.md` | Systematic model quality review workflow |

### Examples
| File | Purpose |
|------|---------|
| `references/examples/IntralogisticsExample.md` | Warehouse automation ArchiMate model example |

## Assets

| File | Purpose |
|------|---------|
| `assets/MetamodelTemplate.md` | Base metamodel template structure |

---

## Core Principles

1. **ArchiMate-aligned thinking** — Use ArchiMate entity types and relationship types from the ontology
2. **Structure is a hypothesis** — All extracted entities are proposals subject to human validation
3. **Confidence and assumptions** — Always express `confidence_score` (0–1) and list assumptions
4. **Tool-agnostic output** — Use archiscribe if available; otherwise emit diagram-ready graph slices for the `diagram` skill
5. **Human-in-the-loop** — Propose updates, never apply automatically without approval
6. **Ontology-first** — Load ontology before extracting entities or proposing relationships

---

## Quick Start

1. **New architecture?** → `references/ArchitectureProcess.md` for phases, then `references/ExtractEntities.md`
2. **Classifying text?** → `references/ClassifyText.md`
3. **Creating views?** → `references/ApplyVisualBestPractices.md` + `diagram` skill
4. **Running gap analysis?** → `references/DetectModelGaps.md` or `references/QualityReview.md`
5. **Need a template?** → `assets/MetamodelTemplate.md`
6. **Looking for examples?** → `references/examples/IntralogisticsExample.md`
