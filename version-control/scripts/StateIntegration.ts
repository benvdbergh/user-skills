#!/usr/bin/env bun

/**
 * Optional bridge to an external state manager (project metadata).
 * Non-blocking: failures are ignored so git operations always complete.
 */

import { existsSync } from "fs";
import { join } from "path";
import { $ } from "bun";
import { getRepoRoot } from "./repoRoot";

/**
 * When set, must be a script path invocable as:
 *   bun run <STATE_MANAGER_SCRIPT> --project <name> --action update --data <json>
 */
const STATE_MANAGER_SCRIPT = process.env.STATE_MANAGER_SCRIPT?.trim();

/**
 * Optional: parent directory of project folders (used with CURSOR_WORKSPACE / CWD).
 * Alias: KNOWLEDGE_PROJECTS_DIR
 */
const PROJECTS_ROOT =
  process.env.VERSION_CONTROL_PROJECTS_ROOT?.trim() ||
  process.env.KNOWLEDGE_PROJECTS_DIR?.trim();

function detectProject(): string | null {
  const workspacePath =
    process.env.CURSOR_WORKSPACE?.trim() ||
    process.env.CWD?.trim() ||
    process.cwd();

  if (PROJECTS_ROOT && workspacePath.startsWith(PROJECTS_ROOT)) {
    const relativePath = workspacePath.substring(PROJECTS_ROOT.length + 1);
    const projectName = relativePath.split("/")[0];
    if (projectName && existsSync(join(PROJECTS_ROOT, projectName))) {
      return projectName;
    }
  }

  return null;
}

export async function updateStateForVCOperation(
  operation:
    | "commit"
    | "checkpoint"
    | "branch_create"
    | "branch_switch"
    | "revert"
    | "initialize",
  details: {
    commitHash?: string;
    commitMessage?: string;
    branchName?: string;
    checkpointName?: string;
    revertedTo?: string;
    filesChanged?: string[];
  }
): Promise<void> {
  const project = detectProject();

  if (!project || !STATE_MANAGER_SCRIPT || !existsSync(STATE_MANAGER_SCRIPT)) {
    return;
  }

  const stateDir = PROJECTS_ROOT
    ? join(PROJECTS_ROOT, project, ".state")
    : null;
  if (stateDir && !existsSync(stateDir)) {
    return;
  }

  try {
    const timestamp = new Date().toISOString();
    let stateData: Record<string, unknown> = {
      timestamp,
      operation,
    };

    switch (operation) {
      case "commit":
        stateData = {
          ...stateData,
          commit_hash: details.commitHash,
          commit_message: details.commitMessage,
          files_changed: details.filesChanged || [],
        };
        break;

      case "checkpoint":
        stateData = {
          ...stateData,
          checkpoint_name: details.checkpointName,
          commit_hash: details.commitHash,
          message: details.commitMessage,
        };
        break;

      case "branch_create":
        stateData = {
          ...stateData,
          branch_name: details.branchName,
        };
        break;

      case "branch_switch":
        stateData = {
          ...stateData,
          branch_name: details.branchName,
        };
        break;

      case "revert":
        stateData = {
          ...stateData,
          reverted_to: details.revertedTo,
          commit_hash: details.commitHash,
        };
        break;

      case "initialize":
        stateData = {
          ...stateData,
          initialized: true,
        };
        break;
    }

    const dataJson = JSON.stringify(stateData);
    await $`bun run ${STATE_MANAGER_SCRIPT} --project ${project} --action update --data ${dataJson}`.quiet();
  } catch (error) {
    console.error(`[StateIntegration] Failed to update state: ${error}`);
  }
}

export async function getCurrentCommitHash(): Promise<string | null> {
  try {
    const repoRoot = getRepoRoot();
    const hash = await $`cd ${repoRoot} && git rev-parse --short HEAD`.text();
    return hash.trim() || null;
  } catch {
    return null;
  }
}

export async function getCurrentBranchName(): Promise<string | null> {
  try {
    const repoRoot = getRepoRoot();
    const branch = await $`cd ${repoRoot} && git branch --show-current`.text();
    return branch.trim() || null;
  } catch {
    return null;
  }
}
