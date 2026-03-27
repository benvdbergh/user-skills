#!/usr/bin/env bun

/**
 * Get current git status for PAI repository
 * Shows uncommitted changes, branch info, and recent commits
 */

import { $ } from "bun";
import { existsSync } from "fs";
import { join } from "path";

const PAI_DIR = process.env.PAI_DIR || "/home/ben/.claude";

async function getStatus(): Promise<void> {
  const gitDir = join(PAI_DIR, ".git");
  
  if (!existsSync(gitDir)) {
    console.error("Git repository not initialized. Run InitializeGit.ts first.");
    process.exit(1);
  }

  try {
    // Get branch info
    const branch = await $`cd ${PAI_DIR} && git branch --show-current`.text();
    console.log(`Branch: ${branch.trim() || "main"}`);

    // Get current commit
    const commit = await $`cd ${PAI_DIR} && git rev-parse --short HEAD`.text();
    console.log(`Commit: ${commit.trim()}`);

    // Get status
    console.log("\nStatus:");
    const status = await $`cd ${PAI_DIR} && git status --short`.text();
    if (status.trim()) {
      console.log(status);
    } else {
      console.log("  No uncommitted changes");
    }

    // Get recent commits
    console.log("\nRecent commits:");
    const log = await $`cd ${PAI_DIR} && git log --oneline -5`.text();
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
