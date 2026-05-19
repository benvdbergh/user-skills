const GRAPH_FILTER_KEYS = [
  "nodeTypes",
  "relationshipTypes",
  "scope",
  "project",
  "confidenceMin",
  "confidenceMax",
  "healthStatus",
  "limit",
  "cursor",
] as const;

const NEIGHBORS_EXTRA_KEYS = ["nodeId", "depth"] as const;

const ARRAY_KEYS = new Set(["nodeTypes", "relationshipTypes"]);
const NUMBER_KEYS = new Set([
  "confidenceMin",
  "confidenceMax",
  "limit",
  "depth",
]);

function parseStringArray(values: string[]): string[] {
  return values
    .flatMap((v) => v.split(","))
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
}

function parseNumber(raw: string, field: string): number {
  const n = Number(raw);
  if (!Number.isFinite(n)) {
    throw new QueryParamError(`Invalid number for ${field}: ${raw}`);
  }
  return n;
}

export class QueryParamError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "QueryParamError";
  }
}

function readField(
  params: URLSearchParams,
  key: string,
): string | string[] | number | undefined {
  const all = params.getAll(key);
  if (all.length === 0) return undefined;

  if (ARRAY_KEYS.has(key)) {
    const items = parseStringArray(all);
    return items.length > 0 ? items : undefined;
  }

  if (NUMBER_KEYS.has(key)) {
    const raw = params.get(key);
    if (raw == null || raw === "") return undefined;
    return parseNumber(raw, key);
  }

  const raw = params.get(key);
  if (raw == null || raw === "") return undefined;
  return raw;
}

function pickKnown(
  params: URLSearchParams,
  keys: readonly string[],
): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const key of keys) {
    const value = readField(params, key);
    if (value !== undefined) out[key] = value;
  }
  return out;
}

/** Normalize HTTP query to GraphFilter fields (unknown keys ignored). */
export function graphFilterFromSearchParams(
  params: URLSearchParams,
): Record<string, unknown> {
  return pickKnown(params, GRAPH_FILTER_KEYS);
}

/** Normalize HTTP query to GraphNeighborsQuery fields. */
export function graphNeighborsFromSearchParams(
  params: URLSearchParams,
): Record<string, unknown> {
  return pickKnown(params, [...GRAPH_FILTER_KEYS, ...NEIGHBORS_EXTRA_KEYS]);
}

export function formatZodError(err: {
  issues: { path: (string | number)[]; message: string }[];
}): string {
  return err.issues
    .map((i) => {
      const path = i.path.length ? i.path.join(".") : "input";
      return `${path}: ${i.message}`;
    })
    .join("; ");
}
