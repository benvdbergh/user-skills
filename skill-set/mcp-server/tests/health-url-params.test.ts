import { describe, expect, it } from "vitest";

/** Mirrors web/src/lib/healthUrlParams.ts */
function parseHealthUrlFilters(params: URLSearchParams) {
  const SEVERITY = new Set(["error", "warning", "info"]);
  const raw = params.get("severity") ?? "";
  const severity = SEVERITY.has(raw) ? raw : "";
  return {
    severity,
    category: params.get("category") ?? "",
    q: params.get("q") ?? "",
  };
}

function buildHealthPath(options: {
  severity?: string;
  category?: string;
  q?: string;
  environmentId?: string;
} = {}) {
  const search = new URLSearchParams();
  if (options.environmentId) search.set("environmentId", options.environmentId);
  if (options.severity) search.set("severity", options.severity);
  if (options.category) search.set("category", options.category);
  if (options.q?.trim()) search.set("q", options.q.trim());
  const qs = search.toString();
  return qs ? `/health?${qs}` : "/health";
}

function applyHealthUrlUpdates(
  base: URLSearchParams,
  updates: Partial<ReturnType<typeof parseHealthUrlFilters>>,
) {
  const current = parseHealthUrlFilters(base);
  const next = new URLSearchParams(base);
  const merged = {
    severity:
      updates.severity !== undefined ? updates.severity : current.severity,
    category:
      updates.category !== undefined ? updates.category : current.category,
    q: updates.q !== undefined ? updates.q : current.q,
  };
  if (merged.severity) next.set("severity", merged.severity);
  else next.delete("severity");
  if (merged.category) next.set("category", merged.category);
  else next.delete("category");
  if (merged.q) next.set("q", merged.q);
  else next.delete("q");
  return next;
}

describe("health URL params (BEN-52 / BEN-54)", () => {
  it("parses severity, category, q", () => {
    const params = new URLSearchParams(
      "severity=error&category=index&q=missing",
    );
    expect(parseHealthUrlFilters(params)).toEqual({
      severity: "error",
      category: "index",
      q: "missing",
    });
  });

  it("ignores invalid severity", () => {
    const params = new URLSearchParams("severity=critical");
    expect(parseHealthUrlFilters(params).severity).toBe("");
  });

  it("buildHealthPath includes environmentId and severity", () => {
    expect(
      buildHealthPath({ environmentId: "proj-a", severity: "warning" }),
    ).toBe("/health?environmentId=proj-a&severity=warning");
  });

  it("applyHealthUrlUpdates preserves environmentId", () => {
    const base = new URLSearchParams("environmentId=proj-a&severity=error");
    const next = applyHealthUrlUpdates(base, { q: "foo" });
    expect(next.get("environmentId")).toBe("proj-a");
    expect(next.get("severity")).toBe("error");
    expect(next.get("q")).toBe("foo");
  });
});
