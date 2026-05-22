import { Hono } from "hono";
import { afterEach, describe, expect, it, vi } from "vitest";
import { PathAccessError } from "../src/config/pathGuard.js";
import { ProposalValidationError } from "../src/domain/proposalValidation.js";
import { QueryParamError } from "../src/http/queryParams.js";
import {
  handleApiError,
  PROBLEM_TYPES,
  SAFE_CLIENT_DETAILS,
} from "../src/http/problemDetails.js";

/** Windows drive paths and common Unix home roots — not `https://` in problem `type`. */
const HOST_ABSOLUTE_PATH =
  /(?:[A-Za-z]:\\(?:Users|Windows|Program Files)|\/(?:Users|home|etc)\/)/;

function appWithHandler(): Hono {
  const app = new Hono();
  app.onError((err, c) => handleApiError(c, err));
  return app;
}

describe("HTTP problem details (BEN-68)", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("PathAccessError returns 403 without absolute paths in JSON", async () => {
    const app = appWithHandler();
    const secretPath = "C:\\Users\\secret\\outside\\SKILL.md";
    app.get("/api/test-path", () => {
      throw new PathAccessError(
        `Path is outside configured skills roots: ${secretPath}`,
      );
    });

    const res = await app.request("/api/test-path");
    expect(res.status).toBe(403);
    expect(res.headers.get("content-type")).toContain(
      "application/problem+json",
    );

    const raw = await res.text();
    expect(raw).not.toContain(secretPath);
    expect(raw).not.toMatch(HOST_ABSOLUTE_PATH);
    const body = JSON.parse(raw) as {
      type: string;
      status: number;
      detail: string;
    };
    expect(body.status).toBe(403);
    expect(body.type).toBe(PROBLEM_TYPES.forbidden);
    expect(body.detail).toBe(SAFE_CLIENT_DETAILS.pathForbidden);
  });

  it("unhandled errors return generic 500 detail and log server-side", async () => {
    const app = appWithHandler();
    const secretPath = "C:\\Users\\secret\\missing.json";
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});

    app.get("/api/boom", () => {
      throw new Error(`ENOENT: no such file ${secretPath}`);
    });

    const res = await app.request("/api/boom");
    expect(res.status).toBe(500);

    const raw = await res.text();
    expect(raw).not.toContain(secretPath);
    expect(raw).not.toMatch(HOST_ABSOLUTE_PATH);
    const body = JSON.parse(raw) as {
      type: string;
      status: number;
      detail: string;
    };
    expect(body.type).toBe(PROBLEM_TYPES.internal);
    expect(body.detail).toBe(SAFE_CLIENT_DETAILS.internal);
    expect(consoleError).toHaveBeenCalled();
  });

  it("QueryParamError returns 400 with message", async () => {
    const app = appWithHandler();
    app.get("/api/graph", () => {
      throw new QueryParamError("Invalid number for limit: not-a-number");
    });

    const res = await app.request("/api/graph?limit=not-a-number");
    expect(res.status).toBe(400);
    const body = (await res.json()) as { type: string; detail: string };
    expect(body.type).toBe(PROBLEM_TYPES.validation);
    expect(body.detail).toContain("limit");
  });

  it("ProposalValidationError returns 400 with message", async () => {
    const app = appWithHandler();
    app.post("/api/proposals/skill-patch", () => {
      throw new ProposalValidationError("Patch proposals require fileChanges");
    });

    const res = await app.request("/api/proposals/skill-patch", {
      method: "POST",
    });
    expect(res.status).toBe(400);
    const body = (await res.json()) as { detail: string };
    expect(body.detail).toContain("fileChanges");
  });
});
