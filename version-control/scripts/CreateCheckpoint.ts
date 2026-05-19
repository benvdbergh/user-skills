#!/usr/bin/env bun

/**
 * Create an annotated checkpoint tag in the selected repository.
 */

import { $ } from "bun";
import { existsSync } from "fs";
import { join } from "path";
import { updateStateForVCOperation, getCurrentCommitHash } from "./StateIntegration";
import { getRepoRoot } from "./repoRoot";

interface CheckpointOptions {
  name: string;
  message?: string;
  commitFirst?: boolean;
}

async function createCheckpoint(options: CheckpointOptions): Promise<void> {
  const repoRoot = getRepoRoot();
  const gitDir = join(repoRoot, ".git");
  
  if (!existsSync(gitDir)) {
    console.error("Git repository not initialized. Run InitializeGit.ts first.");
    process.exit(1);
  }

  // Commit any uncommitted changes first if requested
  if (options.commitFirst) {
    const statusOutput = await $`cd ${repoRoot} && git status --porcelain`.text();
    if (statusOutput.trim()) {
      const commitMessage = options.message || `Checkpoint: ${options.name}`;
      await $`cd ${repoRoot} && git add -A`.quiet();
      await $`cd ${repoRoot} && git commit -m ${commitMessage}`.quiet();
      console.log("✓ Committed current changes");
    }
  }

  // Create tag
  const tagMessage = options.message || `Checkpoint: ${options.name}`;
  const tagName = `checkpoint-${options.name.toLowerCase().replace(/\s+/g, "-")}`;
  
  await $`cd ${repoRoot} && git tag -a ${tagName} -m ${tagMessage}`.quiet();

  // Get commit hash for state update
  const commitHash = await getCurrentCommitHash();

  // Update state with checkpoint information
  await updateStateForVCOperation('checkpoint', {
    checkpointName: tagName,
    commitHash: commitHash || undefined,
    commitMessage: tagMessage,
  });

  console.log(`✓ Created checkpoint: ${tagName}`);
  console.log(`  Message: ${tagMessage}`);
  if (commitHash) {
    console.log(`  Commit: ${commitHash}`);
  }
}

async function main() {
  try {
    const args = process.argv.slice(2);
    const nameIndex = args.indexOf("--name");
    const messageIndex = args.indexOf("--message");
    const commitFirst = args.includes("--commit-first");

    if (nameIndex === -1) {
      console.error("--name is required");
      process.exit(1);
    }

    const options: CheckpointOptions = {
      name: args[nameIndex + 1],
      commitFirst,
    };

    if (messageIndex !== -1) {
      options.message = args[messageIndex + 1];
    }

    await createCheckpoint(options);
  } catch (error) {
    console.error("Failed to create checkpoint:", error);
    process.exit(1);
  }
}

if (import.meta.main) {
  main();
}
