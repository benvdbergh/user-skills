import type { Hono } from "hono";
import { z } from "zod";
import {
  buildPromptBundle,
  mcpPromptNameToTemplateId,
  type PromptBundleDeps,
} from "../../mcp/prompts.js";
import { PromptBundleSchema } from "../../domain/types.js";
import { notFoundProblem, validationProblem } from "../problemDetails.js";

const PromptQuerySchema = z.object({
  environmentId: z.string().optional(),
  skillName: z.string().optional(),
});

function isSkillRequiredError(err: unknown): boolean {
  return (
    err instanceof Error &&
    (err.message.includes("requires environmentId and skillName") ||
      err.message.includes("requires skillMdRelativePath"))
  );
}

export function registerPromptRoutes(app: Hono, deps: PromptBundleDeps): void {
  app.get("/api/prompts/:promptId", (c) => {
    const promptId = decodeURIComponent(c.req.param("promptId"));
    const templateId =
      mcpPromptNameToTemplateId(`skill-lab/${promptId}`) ??
      mcpPromptNameToTemplateId(promptId) ??
      promptId;

    const parsed = PromptQuerySchema.safeParse({
      environmentId: c.req.query("environmentId"),
      skillName: c.req.query("skillName"),
    });
    if (!parsed.success) {
      return validationProblem(c, "Invalid query parameters", c.req.path);
    }

    try {
      const bundle = buildPromptBundle(deps, templateId, parsed.data);
      return c.json({
        prompt: PromptBundleSchema.parse(bundle),
        skillSetRoot: deps.config.skillSetRoot.replace(/\\/g, "/"),
      });
    } catch (err) {
      if (err instanceof Error && err.message.startsWith("Unknown prompt")) {
        return notFoundProblem(c, err.message, c.req.path);
      }
      if (err instanceof Error && err.message.includes("Skill not found")) {
        return notFoundProblem(c, err.message, c.req.path);
      }
      if (isSkillRequiredError(err)) {
        return validationProblem(
          c,
          err instanceof Error ? err.message : "Skill target required",
          c.req.path,
        );
      }
      throw err;
    }
  });
}
