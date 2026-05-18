import { Hono } from "hono";
import { z } from "zod";
import { PathAccessError } from "../config/pathGuard.js";
import type { SkillCatalogService } from "../domain/SkillCatalogService.js";
import type { SkillGraphService } from "../domain/SkillGraphService.js";
import type { SkillHealthService } from "../domain/SkillHealthService.js";
import {
  EnvironmentSchema,
  GraphFilterSchema,
  GraphNeighborsQuerySchema,
  SkillDetailSchema,
  SkillSummarySchema,
} from "../domain/types.js";
import {
  buildCatalogHealthPayload,
  buildGraphNeighborsPayload,
  buildSkillGraphPayload,
} from "../adapters/graphHealthPayload.js";
import {
  formatZodError,
  graphFilterFromSearchParams,
  graphNeighborsFromSearchParams,
  QueryParamError,
} from "./queryParams.js";
import {
  forbiddenProblem,
  internalProblem,
  notFoundProblem,
  validationProblem,
} from "./problemDetails.js";

export interface ApiServices {
  catalog: SkillCatalogService;
  graph: SkillGraphService;
  health: SkillHealthService;
}

export function createApi(services: ApiServices): Hono {
  const { catalog, graph, health } = services;
  const app = new Hono();

  app.onError((err, c) => {
    if (err instanceof PathAccessError) {
      return forbiddenProblem(c, err.message, c.req.path);
    }
    if (err instanceof QueryParamError) {
      return validationProblem(c, err.message, c.req.path);
    }
    return internalProblem(
      c,
      err instanceof Error ? err.message : "Unknown error",
      c.req.path,
    );
  });

  app.get("/api/environments", (c) => {
    const environments = z
      .array(EnvironmentSchema)
      .parse(catalog.listEnvironments());
    return c.json({ environments });
  });

  app.get("/api/skills", (c) => {
    const environmentId = c.req.query("environmentId");
    const skills = z
      .array(SkillSummarySchema)
      .parse(catalog.listSkills({ environmentId }));
    return c.json({ skills });
  });

  app.get("/api/skills/:environmentId/:skillName", (c) => {
    const { environmentId, skillName } = c.req.param();
    const detail = catalog.getSkillDetail(environmentId, skillName);
    if (!detail) {
      return notFoundProblem(
        c,
        `Skill not found: ${environmentId}/${skillName}`,
        c.req.path,
      );
    }
    const skill = SkillDetailSchema.parse(detail);
    return c.json({ skill });
  });

  app.get("/api/graph", (c) => {
    try {
      const raw = graphFilterFromSearchParams(new URL(c.req.url).searchParams);
      const filters = GraphFilterSchema.parse(raw);
      const graphResult = buildSkillGraphPayload(graph, filters);
      return c.json({ graph: graphResult });
    } catch (err) {
      if (err instanceof z.ZodError) {
        return validationProblem(c, formatZodError(err), c.req.path);
      }
      throw err;
    }
  });

  app.get("/api/graph/neighbors", (c) => {
    try {
      const raw = graphNeighborsFromSearchParams(
        new URL(c.req.url).searchParams,
      );
      const query = GraphNeighborsQuerySchema.parse(raw);
      const graphResult = buildGraphNeighborsPayload(graph, query);
      return c.json({ graph: graphResult });
    } catch (err) {
      if (err instanceof z.ZodError) {
        return validationProblem(c, formatZodError(err), c.req.path);
      }
      throw err;
    }
  });

  app.post("/api/health", async (c) => {
    const report = buildCatalogHealthPayload(health);
    return c.json({ report });
  });

  return app;
}
