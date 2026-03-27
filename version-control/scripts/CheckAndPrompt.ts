#!/usr/bin/env bun

/**
 * Standalone tool to check for pending changes and prompt for action
 * Works in both Claude Code (via hooks) and Cursor (manual invocation)
 */

import { existsSync } from "fs";
import { join } from "path";
import { $ } from "bun";

const PAI_DIR = process.env.PAI_DIR || "/home/ben/.claude";

async function checkForChanges(): Promise<void> {
  const gitDir = join(PAI_DIR, ".git");
  
  if (!existsSync(gitDir)) {
    console.log("Git repository not initialized. Run InitializeGit.ts first.");
    return;
  }

  // Check for uncommitted changes to PAI files
  const status = await $`cd ${PAI_DIR} && git status --porcelain`.text();
  const changedFiles = status
    .split("\n")
    .filter((line) => line.trim())
    .map((line) => line.substring(3).trim())
    .filter((file) => {
      const patterns = [/hooks\//, /skills\//, /scripts\//, /settings\.json$/, /\.gitignore$/];
      return patterns.some((pattern) => pattern.test(file));
    });

  if (changedFiles.length === 0) {
    console.log("✓ No uncommitted changes to PAI framework files");
    return;
  }

  console.log("\n📋 PAI Framework Changes Detected");
  console.log("=" .repeat(50));
  console.log(`Files changed: ${changedFiles.length}\n`);
  
  changedFiles.forEach((file, i) => {
    console.log(`  ${i + 1}. ${file}`);
  });

  console.log("\n💡 Next steps:");
  console.log("  1. Review changes: bun run $PAI_DIR/skills/version-control/scripts/HandlePendingAction.ts --show");
  console.log("  2. Commit: bun run $PAI_DIR/skills/version-control/scripts/HandlePendingAction.ts --commit [message]");
  console.log("  3. Branch: bun run $PAI_DIR/skills/version-control/scripts/HandlePendingAction.ts --branch <name>");
  console.log("  4. Skip: bun run $PAI_DIR/skills/version-control/scripts/HandlePendingAction.ts --skip");
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
