import path from "node:path";
import type { SkillLabConfig } from "../config/loadConfig.js";
import {
  LoadedPromptSectionSchema,
  PromptBundleSchema,
  type LoadedPromptSection,
  type PromptBundle,
  type PromptBundleContext,
  type PromptSourceRef,
  type SourceCitation,
} from "../domain/types.js";
import { SkillReferenceSource } from "./SkillReferenceSource.js";
import {
  PROMPT_TEMPLATE_SOURCES,
  type PromptTemplateSourcePlan,
} from "./templateSources.js";

export class PromptSourceService {
  private readonly refs: SkillReferenceSource;

  constructor(private readonly config: SkillLabConfig) {
    this.refs = new SkillReferenceSource(config);
  }

  loadPromptSource(
    ref: PromptSourceRef,
    context: PromptBundleContext = {},
  ): LoadedPromptSection {
    const targetSkillRoot = targetSkillRootFromContext(context, this.config);
    const loaded = this.refs.readPromptRef(ref, { targetSkillRoot });
    return LoadedPromptSectionSchema.parse({
      ref,
      content: loaded.content,
      heading: loaded.heading,
    });
  }

  buildPromptBundle(
    templateId: string,
    context: PromptBundleContext = {},
  ): PromptBundle {
    const plan = PROMPT_TEMPLATE_SOURCES[templateId];
    if (!plan) {
      throw new Error(`Unknown prompt template: ${templateId}`);
    }

    const targetSkillRoot = targetSkillRootFromContext(context, this.config);
    const sections: LoadedPromptSection[] = [];
    const sourceRefs: PromptSourceRef[] = [];

    if (plan.includeSkillSetSkillMd) {
      const skillSetMd: PromptSourceRef = {
        relativePath: "skill-set/SKILL.md",
      };
      sections.push(this.loadPromptSource(skillSetMd, context));
      sourceRefs.push(skillSetMd);
    }

    for (const ref of plan.skillSetRefs) {
      sections.push(this.loadPromptSource(ref, context));
      sourceRefs.push(ref);
    }

    if (plan.targetSkillRefs?.length) {
      if (!targetSkillRoot) {
        throw new Error(
          `Template ${templateId} requires skillMdRelativePath in context. Pass skillMdRelativePath, or environmentId and skillName via buildPromptBundleContext.`,
        );
      }
      for (const ref of plan.targetSkillRefs) {
        const resolvedRef = {
          ...ref,
          relativePath: ref.relativePath.startsWith("skill-set/")
            ? ref.relativePath
            : toTargetSkillRelativePath(targetSkillRoot, ref.relativePath),
        };
        const loaded = this.refs.readPromptRef(resolvedRef, {
          targetSkillRoot,
        });
        sections.push(
          LoadedPromptSectionSchema.parse({
            ref: resolvedRef,
            content: loaded.content,
            heading: loaded.heading,
          }),
        );
        sourceRefs.push(resolvedRef);
      }
    }

    if (templateId === "analyze-trigger-conflicts" && context.triggerCatalogText) {
      const syntheticRef: PromptSourceRef = {
        relativePath: "skill-lab://catalog-triggers",
      };
      sections.push({
        ref: syntheticRef,
        content: context.triggerCatalogText.trim(),
        heading: "Catalog triggers",
      });
      sourceRefs.push(syntheticRef);
    }

    if (templateId === "suggest-relationships" && context.relationshipMapText) {
      const syntheticRef: PromptSourceRef = {
        relativePath: "skill-lab://relationship-map",
      };
      sections.push({
        ref: syntheticRef,
        content: context.relationshipMapText.trim(),
        heading: "Relationship map",
      });
      sourceRefs.push(syntheticRef);
    }

    if (templateId === "create-skill-escalation" && context.healthFindingText) {
      const syntheticRef: PromptSourceRef = {
        relativePath: "skill-lab://health-finding",
      };
      sections.unshift({
        ref: syntheticRef,
        content: context.healthFindingText.trim(),
        heading: "Health scan finding",
      });
      sourceRefs.unshift(syntheticRef);
    }

    const assembledPrompt = assemblePromptSections(templateId, sections);
    return PromptBundleSchema.parse({
      templateId,
      sections,
      sourceRefs,
      assembledPrompt,
    });
  }

  resolveCitations(
    refs: PromptSourceRef[],
    context: PromptBundleContext = {},
  ): SourceCitation[] {
    const targetSkillRoot = targetSkillRootFromContext(context, this.config);
    return refs.map((ref) => {
      if (ref.relativePath.startsWith("skill-lab://")) {
        return { sourcePath: ref.relativePath, heading: ref.sectionHeading };
      }
      try {
        const section = this.loadPromptSource(ref, context);
        const absolute = this.refs.resolveAbsolutePath(ref.relativePath, {
          targetSkillRoot,
        });
        const quote = firstQuoteLine(section.content);
        return {
          sourcePath: this.refs.posixSourcePath(absolute),
          heading: section.heading ?? ref.sectionHeading,
          quote,
        };
      } catch {
        return {
          sourcePath: ref.relativePath,
          heading: ref.sectionHeading,
        };
      }
    });
  }
}

function targetSkillRootFromContext(
  context: PromptBundleContext,
  config: SkillLabConfig,
): string | undefined {
  if (!context.skillMdRelativePath) return undefined;
  const skillMd = path.resolve(config.skillsRoot, context.skillMdRelativePath);
  return path.dirname(skillMd);
}

function toTargetSkillRelativePath(
  targetSkillRoot: string,
  relativePath: string,
): string {
  const posixRoot = targetSkillRoot.replace(/\\/g, "/");
  const parts = posixRoot.split("/");
  const skillDir = parts[parts.length - 1] ?? "";
  return `${skillDir}/${relativePath}`;
}

function assemblePromptSections(
  templateId: string,
  sections: LoadedPromptSection[],
): string {
  const blocks = sections.map((s) => {
    const label = s.heading ?? s.ref.relativePath;
    return `## Source: ${label}\n\n${s.content}`;
  });
  return [`# Prompt: ${templateId}`, "", ...blocks].join("\n");
}

function firstQuoteLine(content: string): string | undefined {
  const line = content
    .split(/\r?\n/)
    .map((l) => l.trim())
    .find((l) => l.length > 0 && !l.startsWith("#"));
  if (!line) return undefined;
  return line.length > 160 ? `${line.slice(0, 157)}...` : line;
}
