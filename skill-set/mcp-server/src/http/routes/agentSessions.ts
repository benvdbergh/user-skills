import type { Hono } from "hono";
import type { AgentSessionRunner } from "../../ai/AgentSessionRunner.js";
import {
  AgentAuthStatusSchema,
  AgentSessionSchema,
  AgentSessionStatusSchema,
  AgentTaskRequestSchema,
} from "../../domain/types.js";
import { formatZodError } from "../queryParams.js";
import { notFoundProblem, validationProblem } from "../problemDetails.js";

function isNotFoundError(err: unknown): boolean {
  return (
    err instanceof Error &&
    (err.message.includes("not found") ||
      err.message.includes("Not found"))
  );
}

export function registerAgentSessionRoutes(
  app: Hono,
  agent: AgentSessionRunner,
): void {
  app.get("/api/agent/auth", async (c) => {
    const auth = AgentAuthStatusSchema.parse(await agent.checkAuth());
    return c.json({ auth });
  });

  app.post("/api/agent-sessions", async (c) => {
    let body: unknown;
    try {
      body = await c.req.json();
    } catch {
      return validationProblem(c, "Request body must be JSON", c.req.path);
    }
    const parsed = AgentTaskRequestSchema.safeParse(body);
    if (!parsed.success) {
      return validationProblem(c, formatZodError(parsed.error), c.req.path);
    }
    try {
      const session = AgentSessionSchema.parse(
        await agent.start(parsed.data),
      );
      return c.json({ session }, 201);
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

  app.get("/api/agent-sessions/:id", async (c) => {
    const { id } = c.req.param();
    try {
      const status = AgentSessionStatusSchema.parse(await agent.getStatus(id));
      return c.json({ status });
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

  app.delete("/api/agent-sessions/:id", async (c) => {
    const { id } = c.req.param();
    try {
      await agent.cancel(id);
      const status = AgentSessionStatusSchema.parse(await agent.getStatus(id));
      return c.json({ status });
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
}
