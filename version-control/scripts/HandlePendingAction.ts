#!/usr/bin/env bun

/**
 * Handle pending version control action (commit, branch, or skip).
 */

import { existsSync, readFileSync, unlinkSync } from "fs";
import { join } from "path";
import { $ } from "bun";
import { getRepoRoot } from "./repoRoot";

const SCRIPTS_DIR = import.meta.dir;

function pendingPaths(repoRoot: string): { primary: string; legacy: string } {
  return {
    primary: join(repoRoot, ".vc-pending-action.json"),
    legacy: join(repoRoot, ".pai-pending-action.json"),
  };
}

interface PendingAction {
  timestamp: string;
  sessionId: string;
  changedFiles: string[];
  toolName: string;
  action?: "commit" | "branch" | "skip";
  branchName?: string;
  commitMessage?: string;
}

function loadPendingAction(): PendingAction | null {
  const repoRoot = getRepoRoot();
  const { primary, legacy } = pendingPaths(repoRoot);
  for (const path of [primary, legacy]) {
    if (!existsSync(path)) continue;
    try {
      return JSON.parse(readFileSync(path, "utf-8"));
    } catch {
      return null;
    }
  }
  return null;
}

function clearPendingAction(): void {
  const repoRoot = getRepoRoot();
  const { primary, legacy } = pendingPaths(repoRoot);
  for (const path of [primary, legacy]) {
    if (existsSync(path)) {
      unlinkSync(path);
    }
  }
}

async function commitChanges(message?: string): Promise<void> {
  const repoRoot = getRepoRoot();
  const commitTool = join(SCRIPTS_DIR, "CommitChanges.ts");

  if (message) {
    await $`cd ${repoRoot} && bun run ${commitTool} --message ${message}`.quiet();
  } else {
    await $`cd ${repoRoot} && bun run ${commitTool}`.quiet();
  }
}

async function createBranch(
  name: string,
  description: string,
  purpose: string
): Promise<void> {
  const repoRoot = getRepoRoot();
  const branchTool = join(SCRIPTS_DIR, "ManageBranches.ts");
  await $`cd ${repoRoot} && bun run ${branchTool} create --name ${name} --description ${description} --purpose ${purpose}`.quiet();
}

async function handleAction(action: PendingAction): Promise<void> {
  if (!action.action) {
    console.log("No action specified. Use --commit, --branch, or --skip");
    return;
  }

  if (action.action === "skip") {
    clearPendingAction();
    console.log("✓ Skipped version control action");
    return;
  }

  if (action.action === "commit") {
    const message = action.commitMessage || "Update repository";
    await commitChanges(message);
    clearPendingAction();
    console.log(`✓ Committed changes: ${message}`);
    return;
  }

  if (action.action === "branch") {
    if (!action.branchName) {
      console.error("Branch name required for branch action");
      return;
    }

    const description = `Branch for: ${action.changedFiles.slice(0, 2).join(", ")}`;
    const purpose = `Development branch — changes to ${action.changedFiles.length} file(s)`;

    await createBranch(action.branchName, description, purpose);

    const message = action.commitMessage || "Initial changes on branch";
    await commitChanges(message);

    clearPendingAction();
    console.log(`✓ Created branch ${action.branchName} and committed changes`);
    return;
  }
}

async function showPendingAction(): Promise<void> {
  const action = loadPendingAction();

  if (!action) {
    console.log("No pending version control action");
    return;
  }

  console.log("\n📋 Pending Version Control Action");
  console.log("=".repeat(50));
  console.log(`Timestamp: ${new Date(action.timestamp).toLocaleString()}`);
  console.log(`Changed files: ${action.changedFiles.length}`);
  console.log("\nFiles:");
  action.changedFiles.forEach((file, i) => {
    console.log(`  ${i + 1}. ${file}`);
  });
  console.log("\nOptions:");
  console.log("  --commit [message]  - Commit changes to current branch");
  console.log("  --branch <name> [message] - Create branch and commit");
  console.log("  --skip             - Skip version control");
  console.log();
}

async function main() {
  try {
    const args = process.argv.slice(2);

    if (args.length === 0 || args.includes("--show") || args.includes("status")) {
      await showPendingAction();
      return;
    }

    const action = loadPendingAction();
    if (!action) {
      console.log("No pending action to handle");
      process.exit(0);
    }

    if (args.includes("--skip")) {
      action.action = "skip";
    } else if (args.includes("--commit")) {
      action.action = "commit";
      const commitIndex = args.indexOf("--commit");
      if (
        commitIndex + 1 < args.length &&
        !args[commitIndex + 1].startsWith("--")
      ) {
        action.commitMessage = args[commitIndex + 1];
      }
    } else if (args.includes("--branch")) {
      action.action = "branch";
      const branchIndex = args.indexOf("--branch");
      if (branchIndex + 1 < args.length && !args[branchIndex + 1].startsWith("--")) {
        action.branchName = args[branchIndex + 1];
        if (
          branchIndex + 2 < args.length &&
          !args[branchIndex + 2].startsWith("--")
        ) {
          action.commitMessage = args[branchIndex + 2];
        }
      } else {
        console.error("Branch name required: --branch <name> [message]");
        process.exit(1);
      }
    } else {
      console.error("Unknown action. Use --commit, --branch, or --skip");
      process.exit(1);
    }

    await handleAction(action);
  } catch (error) {
    console.error("Failed to handle pending action:", error);
    process.exit(1);
  }
}

if (import.meta.main) {
  main();
}
