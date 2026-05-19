#!/usr/bin/env bun

/**
 * List uncommitted paths in the selected repository and suggest next steps.
 */

import { existsSync } from "fs";
import { join } from "path";
import { $ } from "bun";
import { getRepoRoot } from "./repoRoot";

const SCRIPTS_DIR = import.meta.dir;

async function checkForChanges(): Promise<void> {
  const repoRoot = getRepoRoot();
  const gitDir = join(repoRoot, ".git");

  if (!existsSync(gitDir)) {
    console.log("Git repository not initialized. Run InitializeGit.ts first.");
    return;
  }

  const status = await $`cd ${repoRoot} && git status --porcelain`.text();
  const changedFiles = status
    .split("\n")
    .filter((line) => line.trim())
    .map((line) => line.substring(3).trim());

  if (changedFiles.length === 0) {
    console.log("✓ No uncommitted changes");
    return;
  }

  const handleScript = join(SCRIPTS_DIR, "HandlePendingAction.ts");

  console.log("\n📋 Uncommitted changes");
  console.log("=".repeat(50));
  console.log(`Files changed: ${changedFiles.length}\n`);

  changedFiles.forEach((file, i) => {
    console.log(`  ${i + 1}. ${file}`);
  });

  console.log("\n💡 Next steps:");
  console.log(`  1. Review pending (if any): bun run ${handleScript} --show`);
  console.log(`  2. Commit: bun run ${handleScript} --commit [message]`);
  console.log(`  3. Branch: bun run ${handleScript} --branch <name>`);
  console.log(`  4. Skip pending file: bun run ${handleScript} --skip`);
  console.log(`  Or commit directly: bun run ${join(SCRIPTS_DIR, "CommitChanges.ts")}`);
  console.log();
}

async function main() {
  try {
    await checkForChanges();
  } catch (error) {
    console.error("Failed to check for changes:", error);
    process.exit(1);
  }
}

if (import.meta.main) {
  main();
}
