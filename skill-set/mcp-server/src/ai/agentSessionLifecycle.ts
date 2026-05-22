import type { SkillLabConfig } from "../config/loadConfig.js";
import {
  readSessionManifest,
  writeSessionManifest,
  type SessionManifest,
} from "./agentSessionArtifacts.js";

function loadManifestOrThrow(
  config: SkillLabConfig,
  sessionId: string,
): SessionManifest {
  const manifest = readSessionManifest(config, sessionId);
  if (!manifest) {
    throw new Error(`Agent session not found: ${sessionId}`);
  }
  return manifest;
}

function persistManifest(
  config: SkillLabConfig,
  manifest: SessionManifest,
): void {
  manifest.updatedAt = new Date().toISOString();
  writeSessionManifest(config, manifest);
}

/** Persists `cancelled` before process kill so exit handlers cannot overwrite it. */
export function markSessionCancelled(
  config: SkillLabConfig,
  sessionId: string,
): "applied" | "already_terminal" {
  const manifest = loadManifestOrThrow(config, sessionId);
  if (manifest.status === "completed" || manifest.status === "cancelled") {
    return "already_terminal";
  }
  manifest.status = "cancelled";
  manifest.completedAt = new Date().toISOString();
  persistManifest(config, manifest);
  return "applied";
}

/** Applies exit outcome only when the session was not cancelled (cancel wins the race). */
export function applyProcessExitStatus(
  config: SkillLabConfig,
  sessionId: string,
  exitCode: number | null,
): void {
  const manifest = loadManifestOrThrow(config, sessionId);
  if (manifest.status === "cancelled") return;
  manifest.status = exitCode === 0 ? "completed" : "failed";
  if (exitCode !== 0) {
    manifest.error = `claude exited with code ${exitCode ?? "unknown"}`;
  }
  manifest.completedAt = new Date().toISOString();
  persistManifest(config, manifest);
}
