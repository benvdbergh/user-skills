import fs from "node:fs";
import path from "node:path";
import type { SkillLabConfig } from "../config/loadConfig.js";
import type { AgentRuntime, SkillDetail } from "../domain/types.js";
import { agentSessionDir } from "./generatedPaths.js";
import { ensureAgentSessionDir } from "./agentSessionArtifacts.js";
import type { SessionManifest } from "./agentSessionArtifacts.js";

function mcpDeliverableTool(kind: SessionManifest["kind"]): string {
  if (kind === "suggest-relationships") return "suggest_relationship_edges";
  if (kind === "analyze-trigger-conflicts") return "detect_trigger_conflicts";
  return "propose_skill_patch";
}

/** Prepended to task.md so the fixed target is visible before the rubric. */
export function prependAgentTaskHeader(
  manifest: SessionManifest,
  detail: SkillDetail,
  assembledPrompt: string,
): string {
  const toolHint = mcpDeliverableTool(manifest.kind);
  const scopeNote =
    manifest.kind === "create-escalation"
      ? "Draft `references/skill-escalation.md` only. Do **not** run lint, validate, or full-catalog health scans — use the Health scan finding (if present) and the rubric below."
      : "Work only on the named skill. Read the rubric sections below, then read the target SKILL.md under the skills root.";
  const header = [
    "# Skill Lab agent task (fixed target — do not ask which skill to run)",
    "",
    `- **Session ID:** \`${manifest.id}\``,
    `- **Task kind:** ${manifest.kind}`,
    `- **Environment:** ${manifest.environmentId}`,
    `- **Skill name:** ${manifest.skillName}`,
    `- **SKILL.md path (from skills root):** ${detail.path}`,
    `- **MCP deliverable:** \`${toolHint}\` with the sessionId above`,
    "",
    scopeNote,
    "",
    "---",
    "",
  ].join("\n");
  return header + assembledPrompt;
}

/**
 * Short stdin prompt for `claude -p` (not passed on argv — Windows shell splits spaced values).
 * Full rubric + target SKILL.md are in task.md.
 */
export function buildShortClaudePrompt(
  manifest: SessionManifest,
  detail: SkillDetail,
): string {
  const toolHint = mcpDeliverableTool(manifest.kind);
  if (manifest.kind === "create-escalation") {
    return [
      `Draft references/skill-escalation.md for skill "${manifest.skillName}" in environment "${manifest.environmentId}".`,
      `This is a Skill Lab create-escalation session; the target is already chosen — do not ask which skill to use.`,
      `Open task.md first (health finding if any, then the narrow escalation rubric).`,
      `Do not run lint or validate workflows — fix the missing escalation artifact only.`,
      `Target SKILL.md: ${detail.path} (under the added skills root directory).`,
      `When done, call skill-lab MCP ${toolHint} with sessionId "${manifest.id}", environmentId "${manifest.environmentId}", skillName "${manifest.skillName}", citations, and fileChanges for references/skill-escalation.md (and SKILL.md only if you add a routing row).`,
      `Do not edit skill files directly except via the MCP proposal.`,
    ].join(" ");
  }
  return [
    `Improve the agent skill "${manifest.skillName}" in environment "${manifest.environmentId}".`,
    `This is a Skill Lab ${manifest.kind} session; the target is already chosen — do not ask which skill to use.`,
    `Open task.md in this directory first (fixed target and rubric at the top).`,
    `Target SKILL.md: ${detail.path} (under the added skills root directory).`,
    `When done, call skill-lab MCP ${toolHint} with sessionId "${manifest.id}", environmentId "${manifest.environmentId}", skillName "${manifest.skillName}", citations, and proposal fields.`,
    `Do not edit skill files directly.`,
  ].join(" ");
}

const RESUME_PROMPT =
  "Continue the Skill Lab agent task described in task.md in this directory.";

/**
 * Shell command to attach in a terminal. Uses `claude --resume <sessionId>` (not
 * `--continue`): headless `-p` runs do not register as the cwd's "latest"
 * interactive conversation, and bare `--continue` yields "No conversation found".
 * Spawn must pass the same `--session-id` (see buildClaudeSpawnArgs).
 */
export function buildResumeShellCommand(
  skillsRoot: string,
  sessionId: string,
  runtime: AgentRuntime,
): string | undefined {
  if (runtime === "stub") return undefined;
  const dir = agentSessionDir(skillsRoot, sessionId);
  const mcpConfigPath = path.join(dir, "skill-lab.mcp.json");
  const quotedDir = JSON.stringify(dir);
  const quotedMcp = JSON.stringify(mcpConfigPath);
  const quotedSkillsRoot = JSON.stringify(skillsRoot);
  const quotedPrompt = JSON.stringify(RESUME_PROMPT);
  const resume = [
    `claude --resume ${sessionId}`,
    `--mcp-config ${quotedMcp}`,
    "--strict-mcp-config",
    `--add-dir ${quotedSkillsRoot}`,
    quotedPrompt,
  ].join(" ");
  if (process.platform === "win32") {
    return `cd ${quotedDir}; ${resume}`;
  }
  return `cd ${quotedDir} && ${resume}`;
}

export function resolveSkillLabMcpLaunch(config: SkillLabConfig): {
  command: string;
  args: string[];
} {
  const distCli = path.join(config.packageRoot, "dist", "cli.js");
  if (fs.existsSync(distCli)) {
    return { command: process.execPath, args: [distCli, "mcp"] };
  }
  const srcCli = path.join(config.packageRoot, "src", "cli.ts");
  return { command: "bun", args: [srcCli, "mcp"] };
}

export function writeSessionMcpConfig(
  config: SkillLabConfig,
  sessionId: string,
): string {
  const dir = ensureAgentSessionDir(config, sessionId);
  const { command, args } = resolveSkillLabMcpLaunch(config);
  const mcpConfig = {
    mcpServers: {
      "skill-lab": {
        command,
        args,
        cwd: config.packageRoot,
        env: {
          SKILL_LAB_SKILLS_ROOT: config.skillsRoot,
        },
      },
    },
  };
  const filePath = path.join(dir, "skill-lab.mcp.json");
  fs.writeFileSync(filePath, JSON.stringify(mcpConfig, null, 2), "utf8");
  return filePath;
}

/** argv only — user prompt is sent on stdin to avoid Windows `shell` word-splitting. */
export function buildClaudeSpawnArgs(
  runtime: AgentRuntime,
  options: { mcpConfigPath: string; skillsRoot: string; sessionId: string },
): string[] {
  const base = runtime === "claude-background" ? ["--bg", "-p"] : ["-p"];
  return [
    ...base,
    "--session-id",
    options.sessionId,
    "--add-dir",
    options.skillsRoot,
    "--mcp-config",
    options.mcpConfigPath,
    "--strict-mcp-config",
    "--permission-mode",
    "bypassPermissions",
  ];
}
