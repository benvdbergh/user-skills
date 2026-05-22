import type { Hono } from "hono";
import { z } from "zod";
import type { SkillValidationService } from "../../domain/SkillValidationService.js";
import {
  LintReportSchema,
  ValidationReportSchema,
} from "../../domain/types.js";
import { formatZodError } from "../queryParams.js";
import { notFoundProblem, validationProblem } from "../problemDetails.js";

const RunValidationBodySchema = z.object({
  mode: z.enum(["lint", "validate", "both"]).optional(),
  persist: z.boolean().optional(),
  deep: z.boolean().optional(),
});

function isNotFoundError(err: unknown): boolean {
  return err instanceof Error && err.message.includes("not found");
}

export function registerValidationRoutes(
  app: Hono,
  validation: SkillValidationService,
): void {
  app.post("/api/validation/:environmentId/:skillName", async (c) => {
    let body: z.infer<typeof RunValidationBodySchema> = {};
    try {
      const raw = await c.req.json();
      const parsed = RunValidationBodySchema.safeParse(raw);
      if (!parsed.success) {
        return validationProblem(c, formatZodError(parsed.error), c.req.path);
      }
      body = parsed.data;
    } catch {
      body = {};
    }

    const { environmentId, skillName } = c.req.param();
    try {
      const result = await validation.run(environmentId, skillName, {
        mode: body.mode,
        persist: body.persist,
        deep: body.deep,
      });
      const payload: Record<string, unknown> = {};
      if (result.lint) payload.lint = LintReportSchema.parse(result.lint);
      if (result.validation) {
        payload.validation = ValidationReportSchema.parse(result.validation);
      }
      return c.json(payload);
    } catch (err) {
      if (isNotFoundError(err)) {
        return notFoundProblem(
          c,
          err instanceof Error ? err.message : "Not found",
          c.req.path,
        );
      }
      throw err;
    }
  });

  app.get("/api/validation/:environmentId/:skillName/latest", (c) => {
    const { environmentId, skillName } = c.req.param();
    try {
      const latest = validation.getLatest(environmentId, skillName);
      const payload: Record<string, unknown> = {};
      if (latest.lint) payload.lint = LintReportSchema.parse(latest.lint);
      if (latest.validation) {
        payload.validation = ValidationReportSchema.parse(latest.validation);
      }
      if (!latest.lint && !latest.validation) {
        return notFoundProblem(
          c,
          `No persisted validation reports for ${environmentId}/${skillName}`,
          c.req.path,
        );
      }
      return c.json(payload);
    } catch (err) {
      if (isNotFoundError(err)) {
        return notFoundProblem(
          c,
          err instanceof Error ? err.message : "Not found",
          c.req.path,
        );
      }
      throw err;
    }
  });

  app.get("/api/validation/:environmentId/:skillName/compare", (c) => {
    const { environmentId, skillName } = c.req.param();
    const beforeId = c.req.query("beforeId");
    const afterId = c.req.query("afterId");
    if (!beforeId || !afterId) {
      return validationProblem(
        c,
        "Query parameters beforeId and afterId are required",
        c.req.path,
      );
    }
    try {
      const compare = validation.compare(
        environmentId,
        skillName,
        beforeId,
        afterId,
      );
      return c.json({ compare });
    } catch (err) {
      if (isNotFoundError(err)) {
        return notFoundProblem(
          c,
          err instanceof Error ? err.message : "Not found",
          c.req.path,
        );
      }
      if (err instanceof Error && err.message.includes("Compare requires")) {
        return validationProblem(c, err.message, c.req.path);
      }
      if (err instanceof Error && err.message.startsWith("Invalid report id")) {
        return validationProblem(c, err.message, c.req.path);
      }
      throw err;
    }
  });
}
