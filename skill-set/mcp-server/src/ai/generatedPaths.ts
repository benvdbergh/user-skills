import path from "node:path";

/** ADR: ephemeral outputs under skillsRoot/.generated/ */
export function generatedRoot(skillsRoot: string): string {
  return path.join(skillsRoot, ".generated");
}

export function agentSessionDir(skillsRoot: string, sessionId: string): string {
  return path.join(generatedRoot(skillsRoot), "agent-sessions", sessionId);
}

/** Validation reports: `.generated/reports/{env}/{skill}/` */
export function validationReportDir(
  skillsRoot: string,
  environmentId: string,
  skillName: string,
): string {
  return path.join(
    generatedRoot(skillsRoot),
    "reports",
    environmentId,
    skillName,
  );
}

export function proposalFilePath(
  skillsRoot: string,
  patchToken: string,
): string {
  return path.join(generatedRoot(skillsRoot), "proposals", `${patchToken}.json`);
}

/** Latest catalog health scan: `.generated/health/latest.json` */
export function catalogHealthLatestPath(skillsRoot: string): string {
  return path.join(generatedRoot(skillsRoot), "health", "latest.json");
}
