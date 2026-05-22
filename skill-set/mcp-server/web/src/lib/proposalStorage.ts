const TOKENS_KEY = "skill-lab:proposal-tokens";
const IGNORED_KEY = "skill-lab:proposal-ignored";
const EXPORTED_KEY = "skill-lab:proposal-exported";

function readJsonSet(key: string): Set<string> {
  try {
    const raw = sessionStorage.getItem(key);
    if (!raw) return new Set();
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return new Set();
    return new Set(parsed.filter((t): t is string => typeof t === "string"));
  } catch {
    return new Set();
  }
}

function writeJsonSet(key: string, set: Set<string>): void {
  sessionStorage.setItem(key, JSON.stringify([...set]));
}

export function listProposalTokens(): string[] {
  const ignored = readJsonSet(IGNORED_KEY);
  return [...readJsonSet(TOKENS_KEY)].filter((t) => !ignored.has(t));
}

export function addProposalToken(token: string): void {
  const tokens = readJsonSet(TOKENS_KEY);
  tokens.add(token);
  writeJsonSet(TOKENS_KEY, tokens);
}

export function removeProposalToken(token: string): void {
  const tokens = readJsonSet(TOKENS_KEY);
  tokens.delete(token);
  writeJsonSet(TOKENS_KEY, tokens);
}

export function ignoreProposalToken(token: string): void {
  const ignored = readJsonSet(IGNORED_KEY);
  ignored.add(token);
  writeJsonSet(IGNORED_KEY, ignored);
  removeProposalToken(token);
}

export function isProposalIgnored(token: string): boolean {
  return readJsonSet(IGNORED_KEY).has(token);
}

export function markProposalExported(token: string): void {
  const exported = readJsonSet(EXPORTED_KEY);
  exported.add(token);
  writeJsonSet(EXPORTED_KEY, exported);
}

export function isProposalExported(token: string): boolean {
  return readJsonSet(EXPORTED_KEY).has(token);
}
