import fs from "node:fs";
import path from "node:path";
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

export interface CreateApiOptions {
  /** Built dashboard assets (`web/dist`). Enables static + SPA fallback when present. */
  staticDir?: string;
}

const STATIC_MIME: Record<string, string> = {
  ".html": "text/html; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  ".png": "image/png",
  ".woff2": "font/woff2",
};

function containsTraversalSegment(requestPath: string): boolean {
  try {
    const decoded = decodeURIComponent(requestPath);
    return decoded.split(/[/\\]/).some((segment) => segment === "..");
  } catch {
    return true;
  }
}

function isSpaClientRoute(requestPath: string): boolean {
  if (requestPath === "/") return true;
  if (requestPath.startsWith("/graph")) return true;
  if (requestPath.startsWith("/health")) return true;
  if (requestPath.startsWith("/proposals")) return true;
  if (requestPath.startsWith("/skills/")) return true;
  return false;
}

function isPathInsideRoot(filePath: string, root: string): boolean {
  const resolved = path.resolve(filePath);
  const resolvedRoot = path.resolve(root);
  const relative = path.relative(resolvedRoot, resolved);
  return (
    relative === "" ||
    (!relative.startsWith("..") && !path.isAbsolute(relative))
  );
}

function resolveStaticFile(
  staticDir: string,
  requestPath: string,
  indexPath: string,
): string | null {
  if (containsTraversalSegment(requestPath)) {
    return null;
  }

  const staticRoot = path.resolve(staticDir);
  const resolvedIndex = path.resolve(indexPath);
  const relative =
    requestPath === "/" ? "index.html" : requestPath.replace(/^\//, "");
  const candidate = path.resolve(staticRoot, relative);

  if (!isPathInsideRoot(candidate, staticRoot)) {
    return null;
  }

  if (fs.existsSync(candidate) && fs.statSync(candidate).isFile()) {
    return candidate;
  }

  if (
    isSpaClientRoute(requestPath) &&
    isPathInsideRoot(resolvedIndex, staticRoot)
  ) {
    return resolvedIndex;
  }

  return null;
}

function registerDashboardStatic(app: Hono, staticDir: string): void {
  const indexPath = path.join(staticDir, "index.html");
  if (!fs.existsSync(indexPath)) {
    return;
  }

  app.get("*", (c) => {
    if (c.req.path.startsWith("/api")) {
      return c.notFound();
    }

    const filePath = resolveStaticFile(staticDir, c.req.path, indexPath);
    if (!filePath || !fs.existsSync(filePath)) {
      return c.notFound();
    }

    const ext = path.extname(filePath);
    const body = fs.readFileSync(filePath);
    return c.body(body, 200, {
      "Content-Type": STATIC_MIME[ext] ?? "application/octet-stream",
    });
  });
}

export function createApi(
  services: ApiServices,
  options?: CreateApiOptions,
): Hono {
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

  app.get("/api/graph/skill-relationship-counts", (c) => {
    const counts = graph.getSkillRelationshipCounts();
    return c.json({ counts });
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

  if (options?.staticDir) {
    registerDashboardStatic(app, options.staticDir);
  }

  return app;
}
