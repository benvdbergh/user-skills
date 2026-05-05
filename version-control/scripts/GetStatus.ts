#!/usr/bin/env bun

/**
 * Git status, branch, and recent commits for the selected repository.
 */

import { $ } from "bun";
import { existsSync } from "fs";
import { join } from "path";
import { getRepoRoot } from "./repoRoot";

async function getStatus(): Promise<void> {
  const repoRoot = getRepoRoot();
  const gitDir = join(repoRoot, ".git");
  
  if (!existsSync(gitDir)) {
    console.error("Git repository not initialized. Run InitializeGit.ts first.");
    process.exit(1);
  }

  try {
    // Get branch info
    const branch = await $`cd ${repoRoot} && git branch --show-current`.text();
    console.log(`Branch: ${branch.trim() || "main"}`);

    // Get current commit
    const commit = await $`cd ${repoRoot} && git rev-parse --short HEAD`.text();
    console.log(`Commit: ${commit.trim()}`);

    // Get status
    console.log("\nStatus:");
    const status = await $`cd ${repoRoot} && git status --short`.text();
    if (status.trim()) {
      console.log(status);
    } else {
      console.log("  No uncommitted changes");
    }

    // Get recent commits
    console.log("\nRecent commits:");
    const log = await $`cd ${repoRoot} && git log --oneline -5`.text();
    console.log(log);
  } catch (error) {
    console.error("Failed to get status:", error);
    process.exit(1);
  }
}

async function main() {
  try {
    await getStatus();
  } catch (error) {
    console.error("Failed to get status:", error);
    process.exit(1);
  }
}

if (import.meta.main) {
  main();
}
