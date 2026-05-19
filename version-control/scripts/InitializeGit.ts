#!/usr/bin/env bun

/**
 * Initialize a git repository in the selected working tree (REPO_ROOT / GIT_WORK_TREE / cwd).
 */

import { $ } from "bun";
import { existsSync } from "fs";
import { join } from "path";
import { updateStateForVCOperation } from "./StateIntegration";
import { getRepoRoot } from "./repoRoot";

async function initializeGit(): Promise<void> {
  const repoRoot = getRepoRoot();
  const gitDir = join(repoRoot, ".git");

  if (existsSync(gitDir)) {
    console.log("✓ Git repository already initialized");
    return;
  }

  console.log("Initializing git repository...");

  await $`cd ${repoRoot} && git init`.quiet();

  const gitUser = process.env.GIT_USER_NAME || "Version Control";
  const gitEmail = process.env.GIT_USER_EMAIL || "version-control@local";

  try {
    await $`cd ${repoRoot} && git config user.name "${gitUser}"`.quiet();
    await $`cd ${repoRoot} && git config user.email "${gitEmail}"`.quiet();
  } catch (error) {
    console.warn("Could not set git user config:", error);
  }

  const gitignorePath = join(repoRoot, ".gitignore");
  if (!existsSync(gitignorePath)) {
    console.warn("⚠️  .gitignore not found. Please create it manually.");
  }

  try {
    await $`cd ${repoRoot} && git add -A`.quiet();
    const status = await $`cd ${repoRoot} && git status --porcelain`.text();

    if (status.trim()) {
      await $`cd ${repoRoot} && git commit -m "Initial commit"`.quiet();
      console.log("✓ Created initial commit");
    } else {
      console.log("✓ Repository initialized (no files to commit)");
    }
  } catch (error) {
    console.warn("Could not create initial commit:", error);
  }

  await updateStateForVCOperation("initialize", {});

  console.log("✓ Git repository initialized successfully");
  console.log(`  Repository: ${repoRoot}`);
  console.log(`  User: ${gitUser} <${gitEmail}>`);
}

async function main() {
  try {
    await initializeGit();
  } catch (error) {
    console.error("Failed to initialize git repository:", error);
    process.exit(1);
  }
}

if (import.meta.main) {
  main();
}
