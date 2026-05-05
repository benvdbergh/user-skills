#!/usr/bin/env bun

/**
 * Revert or restore paths in the selected repository.
 */

import { $ } from "bun";
import { existsSync } from "fs";
import { join } from "path";
import { updateStateForVCOperation, getCurrentCommitHash } from "./StateIntegration";
import { getRepoRoot } from "./repoRoot";

interface RevertOptions {
  commit?: string;
  file?: string;
  hard?: boolean;
}

async function revertChange(options: RevertOptions): Promise<void> {
  const repoRoot = getRepoRoot();
  const gitDir = join(repoRoot, ".git");
  
  if (!existsSync(gitDir)) {
    console.error("Git repository not initialized. Run InitializeGit.ts first.");
    process.exit(1);
  }

  let revertedTo: string | undefined;
  let commitHash: string | undefined;

  if (options.commit) {
    // Revert to specific commit
    revertedTo = options.commit;
    if (options.hard) {
      await $`cd ${repoRoot} && git reset --hard ${options.commit}`.quiet();
      console.log(`✓ Reset to commit ${options.commit.substring(0, 7)}`);
    } else {
      await $`cd ${repoRoot} && git revert --no-commit ${options.commit}`.quiet();
      await $`cd ${repoRoot} && git commit -m "Revert to ${options.commit.substring(0, 7)}"`.quiet();
      commitHash = await getCurrentCommitHash() || undefined;
      console.log(`✓ Reverted to commit ${options.commit.substring(0, 7)}`);
    }
  } else if (options.file) {
    // Restore specific file from HEAD
    await $`cd ${repoRoot} && git checkout HEAD -- ${options.file}`.quiet();
    console.log(`✓ Restored ${options.file} from HEAD`);
  } else {
    // Revert uncommitted changes
    if (options.hard) {
      await $`cd ${repoRoot} && git reset --hard HEAD`.quiet();
      console.log("✓ Discarded all uncommitted changes");
    } else {
      await $`cd ${repoRoot} && git checkout -- .`.quiet();
      console.log("✓ Restored all files to last commit");
    }
  }

  // Update state with revert information (only if we reverted to a commit)
  if (revertedTo) {
    await updateStateForVCOperation('revert', {
      revertedTo,
      commitHash,
    });
  }
}

async function main() {
  try {
    const args = process.argv.slice(2);
    const commitIndex = args.indexOf("--commit");
    const fileIndex = args.indexOf("--file");
    const hard = args.includes("--hard");

    const options: RevertOptions = { hard };

    if (commitIndex !== -1) {
      options.commit = args[commitIndex + 1];
    }

    if (fileIndex !== -1) {
      options.file = args[fileIndex + 1];
    }

    if (!options.commit && !options.file && !hard) {
      console.error("Specify --commit, --file, or use --hard to discard all changes");
      process.exit(1);
    }

    await revertChange(options);
  } catch (error) {
    console.error("Failed to revert change:", error);
    process.exit(1);
  }
}

if (import.meta.main) {
  main();
}
