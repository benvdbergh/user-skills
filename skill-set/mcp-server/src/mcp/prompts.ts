import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { GetPromptResult } from "@modelcontextprotocol/sdk/types.js";
import { z } from "zod";
import type { SkillLabConfig } from "../config/loadConfig.js";
import type { SkillCatalogService } from "../domain/SkillCatalogService.js";
import {
  PromptBundleSchema,
  type PromptBundle,
  type PromptBundleContext,
  type PromptSourceRef,
} from "../domain/types.js";
import type { PromptSourceService } from "../prompts/PromptSourceService.js";
import { PROMPT_TEMPLATE_IDS } from "../prompts/templateSources.js";
import type { RelationshipMapRepository } from "../repositories/RelationshipMapRepository.js";

/** MCP prompt names (FR-037). */
export const SKILL_LAB_MCP_PROMPT_NAMES = [
  "skill-lab/improve-skill-description",
  "skill-lab/create-skill-escalation",
  "skill-lab/validate-skill-effectiveness",
  "skill-lab/suggest-relationships",
  "skill-lab/analyze-trigger-conflicts",
  "skill-lab/synthesize-new-skill",
] as const;

export type SkillLabMcpPromptName = (typeof SKILL_LAB_MCP_PROMPT_NAMES)[number];

const MCP_PROMPT_META: Record<
  SkillLabMcpPromptName,
  { templateId: string; title: string; description: string; requiresSkill: boolean }
> = {
  "skill-lab/improve-skill-description": {
    templateId: "improve-skill-description",
    title: "Improve skill description",
    description:
      "Assemble lifecycle rubrics to improve a skill description and triggers from feedback.",
    requiresSkill: true,
  },
  "skill-lab/create-skill-escalation": {
    templateId: "create-skill-escalation",
    title: "Create skill escalation",
    description:
      "Draft references/skill-escalation.md from the narrow create-escalation rubric and target SKILL.md (not full lint/validate).",
    requiresSkill: true,
  },
  "skill-lab/validate-skill-effectiveness": {
    templateId: "validate-skill-effectiveness",
    title: "Validate skill effectiveness",
    description:
      "Load validation and effectiveness rubrics for assessing skill instruction quality.",
    requiresSkill: false,
  },
  "skill-lab/suggest-relationships": {
    templateId: "suggest-relationships",
    title: "Suggest relationships",
    description:
      "Suggest relationship edges using synthesis guidance and the relationship map.",
    requiresSkill: false,
  },
  "skill-lab/analyze-trigger-conflicts": {
    templateId: "analyze-trigger-conflicts",
    title: "Analyze trigger conflicts",
    description:
      "Detect overlapping triggers across the catalog using lint rules and trigger inventory.",
    requiresSkill: false,
  },
  "skill-lab/synthesize-new-skill": {
    templateId: "synthesize-new-skill",
    title: "Synthesize new skill",
    description:
      "Synthesize a new skill outline from skill-set governance sources and authoring guidance.",
    requiresSkill: false,
  },
};

export function mcpPromptNameToTemplateId(name: string): string | undefined {
  const meta = MCP_PROMPT_META[name as SkillLabMcpPromptName];
  return meta?.templateId;
}

export function templateIdToMcpPromptName(templateId: string): string | undefined {
  const entry = Object.entries(MCP_PROMPT_META).find(
    ([, m]) => m.templateId === templateId,
  );
  return entry?.[0];
}

export function assertKnownTemplateId(templateId: string): void {
  if (!PROMPT_TEMPLATE_IDS.includes(templateId)) {
    throw new Error(`Unknown prompt template: ${templateId}`);
  }
}

export function formatTriggerCatalogText(catalog: SkillCatalogService): string {
  const lines: string[] = [];
  for (const skill of catalog.listSkills()) {
    if (skill.triggers.length === 0) continue;
    for (const trigger of skill.triggers) {
      lines.push(`${skill.name}: ${trigger}`);
    }
  }
  return lines.join("\n");
}

export interface PromptBundleDeps {
  config: SkillLabConfig;
  catalog: SkillCatalogService;
  prompts: PromptSourceService;
  relationshipMap: RelationshipMapRepository;
}

export function buildPromptBundleContext(
  deps: PromptBundleDeps,
  templateId: string,
  args: { environmentId?: string; skillName?: string },
): PromptBundleContext {
  assertKnownTemplateId(templateId);
  const context: PromptBundleContext = {};

  if (args.environmentId) context.environmentId = args.environmentId;
  if (args.skillName) context.skillName = args.skillName;

  if (args.environmentId && args.skillName) {
    const detail = deps.catalog.getSkillDetail(
      args.environmentId,
      args.skillName,
    );
    if (!detail) {
      throw new Error(
        `Skill not found: ${args.environmentId}/${args.skillName}`,
      );
    }
    context.skillMdRelativePath = detail.path;
  }

  if (templateId === "analyze-trigger-conflicts") {
    context.triggerCatalogText = formatTriggerCatalogText(deps.catalog);
  }

  if (templateId === "suggest-relationships") {
    context.relationshipMapText = JSON.stringify(
      deps.relationshipMap.read(),
      null,
      2,
    );
  }

  return context;
}

export function buildPromptBundle(
  deps: PromptBundleDeps,
  templateId: string,
  args: { environmentId?: string; skillName?: string },
): PromptBundle {
  const meta = Object.values(MCP_PROMPT_META).find(
    (m) => m.templateId === templateId,
  );
  if (meta?.requiresSkill && (!args.environmentId || !args.skillName)) {
    throw new Error(
      `Template ${templateId} requires environmentId and skillName`,
    );
  }
  const context = buildPromptBundleContext(deps, templateId, args);
  return PromptBundleSchema.parse(
    deps.prompts.buildPromptBundle(templateId, context),
  );
}

export function promptBundleToGetPromptResult(
  bundle: PromptBundle,
  skillSetRoot: string,
  description?: string,
): GetPromptResult {
  const sourceRefs = bundle.sourceRefs;
  return {
    description,
    messages: [
      {
        role: "user",
        content: {
          type: "text",
          text: bundle.assembledPrompt,
        },
      },
    ],
    _meta: {
      templateId: bundle.templateId,
      skillSetRoot,
      sourceRefs,
    },
  };
}

export function registerMcpPrompts(
  server: McpServer,
  deps: PromptBundleDeps,
): void {
  const skillSetRoot = deps.config.skillSetRoot.replace(/\\/g, "/");

  for (const name of SKILL_LAB_MCP_PROMPT_NAMES) {
    const meta = MCP_PROMPT_META[name];
    server.registerPrompt(
      name,
      {
        title: meta.title,
        description: meta.description,
        argsSchema: {
          environmentId: z
            .string()
            .optional()
            .describe("Target environment id (e.g. user)"),
          skillName: z
            .string()
            .optional()
            .describe("Target skill name when the workflow applies to one skill"),
        },
      },
      (args) => {
        const bundle = buildPromptBundle(deps, meta.templateId, {
          environmentId: args.environmentId,
          skillName: args.skillName,
        });
        return promptBundleToGetPromptResult(
          bundle,
          skillSetRoot,
          meta.description,
        );
      },
    );
  }
}
