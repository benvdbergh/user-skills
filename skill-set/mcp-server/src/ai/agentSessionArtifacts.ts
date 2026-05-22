import fs from "node:fs";
import path from "node:path";
import { assertPathUnderRoots } from "../config/pathGuard.js";
import type { SkillLabConfig } from "../config/loadConfig.js";
import type { AgentSession } from "../domain/types.js";
import { agentSessionDir } from "./generatedPaths.js";
import { redactSecrets } from "./logRedaction.js";

export type SessionManifest = AgentSession & {
  updatedAt: string;
  pid?: number;
};

const LOG_TAIL_BYTES = 8192;

export function ensureAgentSessionDir(
  config: SkillLabConfig,
  sessionId: string,
): string {
  const dir = agentSessionDir(config.skillsRoot, sessionId);
  assertPathUnderRoots(dir, config.allowedRoots);
  fs.mkdirSync(dir, { recursive: true });
  return dir;
}

export function writeSessionManifest(
  config: SkillLabConfig,
  manifest: SessionManifest,
): void {
  const dir = ensureAgentSessionDir(config, manifest.id);
  const filePath = path.join(dir, "manifest.json");
  assertPathUnderRoots(filePath, config.allowedRoots);
  fs.writeFileSync(filePath, JSON.stringify(manifest, null, 2), "utf8");
}

export function readSessionManifest(
  config: SkillLabConfig,
  sessionId: string,
): SessionManifest | null {
  const filePath = path.join(
    agentSessionDir(config.skillsRoot, sessionId),
    "manifest.json",
  );
  if (!fs.existsSync(filePath)) return null;
  assertPathUnderRoots(filePath, config.allowedRoots);
  return JSON.parse(fs.readFileSync(filePath, "utf8")) as SessionManifest;
}

export function appendSessionLog(
  config: SkillLabConfig,
  sessionId: string,
  line: string,
): void {
  const dir = ensureAgentSessionDir(config, sessionId);
  const logPath = path.join(dir, "log.txt");
  assertPathUnderRoots(logPath, config.allowedRoots);
  const safe = redactSecrets(line);
  fs.appendFileSync(logPath, safe.endsWith("\n") ? safe : `${safe}\n`, "utf8");
}

export function readSessionLogTail(
  config: SkillLabConfig,
  sessionId: string,
): string | undefined {
  const logPath = path.join(
    agentSessionDir(config.skillsRoot, sessionId),
    "log.txt",
  );
  if (!fs.existsSync(logPath)) return undefined;
  assertPathUnderRoots(logPath, config.allowedRoots);
  const stat = fs.statSync(logPath);
  const start = Math.max(0, stat.size - LOG_TAIL_BYTES);
  const fd = fs.openSync(logPath, "r");
  try {
    const buf = Buffer.alloc(stat.size - start);
    fs.readSync(fd, buf, 0, buf.length, start);
    return redactSecrets(buf.toString("utf8"));
  } finally {
    fs.closeSync(fd);
  }
}
