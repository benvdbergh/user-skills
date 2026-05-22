const ORIGIN_KEY = "skill-lab:session-return-origin";

export type SessionReturnOrigin =
  | { kind: "skill"; environmentId: string; skillName: string }
  | { kind: "health" };

export function setSessionReturnOrigin(origin: SessionReturnOrigin): void {
  try {
    sessionStorage.setItem(ORIGIN_KEY, JSON.stringify(origin));
  } catch {
    /* ignore quota */
  }
}

export function getSessionReturnOrigin(): SessionReturnOrigin | null {
  try {
    const raw = sessionStorage.getItem(ORIGIN_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as unknown;
    if (!parsed || typeof parsed !== "object") return null;
    const o = parsed as Record<string, unknown>;
    if (o.kind === "health") return { kind: "health" };
    if (
      o.kind === "skill" &&
      typeof o.environmentId === "string" &&
      typeof o.skillName === "string" &&
      o.environmentId &&
      o.skillName
    ) {
      return {
        kind: "skill",
        environmentId: o.environmentId,
        skillName: o.skillName,
      };
    }
    return null;
  } catch {
    return null;
  }
}

export function clearSessionReturnOrigin(): void {
  try {
    sessionStorage.removeItem(ORIGIN_KEY);
  } catch {
    /* ignore */
  }
}
