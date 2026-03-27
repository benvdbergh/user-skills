#!/usr/bin/env bun

/**
 * Initialize git repository in PAI directory
 * Sets up version control for the .claude folder
 */

import { $ } from "bun";
import { existsSync } from "fs";
import { join } from "path";
import { updateStateForVCOperation } from "./StateIntegration";

const PAI_DIR = process.env.PAI_DIR || "/home/ben/.claude";

async function initializeGit(): Promise<void> {
  const gitDir = join(PAI_DIR, ".git");
  
  if (existsSync(gitDir)) {
    console.log("✓ Git repository already initialized");
    return;
  }

  console.log("Initializing git repository for PAI...");

  // Initialize git repository
  await $`cd ${PAI_DIR} && git init`.quiet();

  // Configure git user if not set (use environment or defaults)
  const gitUser = process.env.GIT_USER_NAME || "PAI System";
  const gitEmail = process.env.GIT_USER_EMAIL || "pai@local";

  try {
    await $`cd ${PAI_DIR} && git config user.name "${gitUser}"`.quiet();
    await $`cd ${PAI_DIR} && git config user.email "${gitEmail}"`.quiet();
  } catch (error) {
    console.warn("Could not set git user config:", error);
  }

  // Ensure .gitignore exists
  const gitignorePath = join(PAI_DIR, ".gitignore");
  if (!existsSync(gitignorePath)) {
    console.warn("⚠️  .gitignore not found. Please create it manually.");
  }

  // Create initial commit if there are files to commit
  try {
    await $`cd ${PAI_DIR} && git add -A`.quiet();
    const status = await $`cd ${PAI_DIR} && git status --porcelain`.text();
    
    if (status.trim()) {
      await $`cd ${PAI_DIR} && git commit -m "Initial commit: PAI framework baseline"`.quiet();
      console.log("✓ Created initial commit");
    } else {
      console.log("✓ Repository initialized (no files to commit)");
    }
  } catch (error) {
    console.warn("Could not create initial commit:", error);
  }

  // Update state with initialization
  await updateStateForVCOperation('initialize', {});

  console.log("✓ Git repository initialized successfully");
  console.log(`  Repository: ${PAI_DIR}`);
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
