#!/usr/bin/env bun

/**
 * Branch management tool for PAI repository
 * Create, switch, list, describe, and delete branches with metadata tracking
 */

import { $ } from "bun";
import { existsSync, readFileSync, writeFileSync } from "fs";
import { join } from "path";
import { updateStateForVCOperation } from "./StateIntegration";

const PAI_DIR = process.env.PAI_DIR || "/home/ben/.claude";
const BRANCHES_METADATA = join(PAI_DIR, ".pai-branches.json");

interface BranchMetadata {
  name: string;
  description: string;
  purpose: string;
  created: string;
  lastUsed?: string;
  tags?: string[];
}

interface BranchesMetadata {
  branches: Record<string, Omit<BranchMetadata, "name">>;
}

function loadMetadata(): BranchesMetadata {
  if (existsSync(BRANCHES_METADATA)) {
    try {
      return JSON.parse(readFileSync(BRANCHES_METADATA, "utf-8"));
    } catch {
      return { branches: {} };
    }
  }
  return { branches: {} };
}

function saveMetadata(metadata: BranchesMetadata): void {
  writeFileSync(BRANCHES_METADATA, JSON.stringify(metadata, null, 2), "utf-8");
}

async function createBranch(
  name: string,
  description: string,
  purpose: string,
  from?: string
): Promise<void> {
  const gitDir = join(PAI_DIR, ".git");
  if (!existsSync(gitDir)) {
    console.error("Git repository not initialized. Run InitializeGit.ts first.");
    process.exit(1);
  }

  // Create branch
  if (from) {
    await $`cd ${PAI_DIR} && git checkout -b ${name} ${from}`.quiet();
  } else {
    await $`cd ${PAI_DIR} && git checkout -b ${name}`.quiet();
  }

  // Save metadata
  const metadata = loadMetadata();
  metadata.branches[name] = {
    description,
    purpose,
    created: new Date().toISOString(),
    lastUsed: new Date().toISOString(),
  };
  saveMetadata(metadata);

  // Update state with branch creation
  await updateStateForVCOperation('branch_create', {
    branchName: name,
  });

  console.log(`✓ Created branch: ${name}`);
  console.log(`  Description: ${description}`);
  console.log(`  Purpose: ${purpose}`);
}

async function switchBranch(name: string): Promise<void> {
  const gitDir = join(PAI_DIR, ".git");
  if (!existsSync(gitDir)) {
    console.error("Git repository not initialized. Run InitializeGit.ts first.");
    process.exit(1);
  }

  // Check if branch exists
  const branches = await $`cd ${PAI_DIR} && git branch --list ${name}`.text();
  if (!branches.trim()) {
    console.error(`Branch '${name}' does not exist`);
    process.exit(1);
  }

  // Switch branch
  await $`cd ${PAI_DIR} && git checkout ${name}`.quiet();

  // Update last used
  const metadata = loadMetadata();
  if (metadata.branches[name]) {
    metadata.branches[name].lastUsed = new Date().toISOString();
    saveMetadata(metadata);
  }

  // Update state with branch switch
  await updateStateForVCOperation('branch_switch', {
    branchName: name,
  });

  console.log(`✓ Switched to branch: ${name}`);
  
  // Show branch info
  if (metadata.branches[name]) {
    console.log(`  Purpose: ${metadata.branches[name].purpose}`);
    console.log(`  Description: ${metadata.branches[name].description}`);
  }
}

async function listBranches(): Promise<void> {
  const gitDir = join(PAI_DIR, ".git");
  if (!existsSync(gitDir)) {
    console.error("Git repository not initialized. Run InitializeGit.ts first.");
    process.exit(1);
  }

  const currentBranch = await $`cd ${PAI_DIR} && git branch --show-current`.text();
  const allBranches = await $`cd ${PAI_DIR} && git branch --list`.text();
  const metadata = loadMetadata();

  console.log("Branches:\n");
  for (const line of allBranches.split("\n")) {
    const branchName = line.replace(/^\*?\s+/, "").trim();
    if (!branchName) continue;

    const isCurrent = branchName === currentBranch.trim();
    const marker = isCurrent ? "* " : "  ";
    const branchMeta = metadata.branches[branchName];

    console.log(`${marker}${branchName}`);
    if (branchMeta) {
      console.log(`    Purpose: ${branchMeta.purpose}`);
      console.log(`    ${branchMeta.description}`);
    }
    console.log();
  }
}

async function describeBranch(name: string, description?: string, purpose?: string): Promise<void> {
  const metadata = loadMetadata();
  
  if (!metadata.branches[name]) {
    metadata.branches[name] = {
      description: description || "No description",
      purpose: purpose || "General development",
      created: new Date().toISOString(),
    };
  } else {
    if (description) metadata.branches[name].description = description;
    if (purpose) metadata.branches[name].purpose = purpose;
  }

  saveMetadata(metadata);
  console.log(`✓ Updated metadata for branch: ${name}`);
}

async function deleteBranch(name: string, force?: boolean): Promise<void> {
  const gitDir = join(PAI_DIR, ".git");
  if (!existsSync(gitDir)) {
    console.error("Git repository not initialized. Run InitializeGit.ts first.");
    process.exit(1);
  }

  const currentBranch = await $`cd ${PAI_DIR} && git branch --show-current`.text();
  if (name === currentBranch.trim()) {
    console.error("Cannot delete current branch. Switch to another branch first.");
    process.exit(1);
  }

  // Delete git branch
  if (force) {
    await $`cd ${PAI_DIR} && git branch -D ${name}`.quiet();
  } else {
    await $`cd ${PAI_DIR} && git branch -d ${name}`.quiet();
  }

  // Remove metadata
  const metadata = loadMetadata();
  delete metadata.branches[name];
  saveMetadata(metadata);

  console.log(`✓ Deleted branch: ${name}`);
}

async function getCurrentBranchInfo(): Promise<void> {
  const gitDir = join(PAI_DIR, ".git");
  if (!existsSync(gitDir)) {
    console.error("Git repository not initialized. Run InitializeGit.ts first.");
    process.exit(1);
  }

  const currentBranch = await $`cd ${PAI_DIR} && git branch --show-current`.text();
  const branchName = currentBranch.trim();
  const metadata = loadMetadata();
  const branchMeta = metadata.branches[branchName];

  console.log(`Current branch: ${branchName}`);
  if (branchMeta) {
    console.log(`Purpose: ${branchMeta.purpose}`);
    console.log(`Description: ${branchMeta.description}`);
    if (branchMeta.lastUsed) {
      console.log(`Last used: ${new Date(branchMeta.lastUsed).toLocaleString()}`);
    }
  } else {
    console.log("(No metadata available for this branch)");
  }
}

async function main() {
  try {
    const args = process.argv.slice(2);
    const command = args[0];

    if (command === "create") {
      const nameIndex = args.indexOf("--name");
      const descIndex = args.indexOf("--description");
      const purposeIndex = args.indexOf("--purpose");
      const fromIndex = args.indexOf("--from");

      if (nameIndex === -1 || descIndex === -1 || purposeIndex === -1) {
        console.error("Usage: create --name <name> --description <desc> --purpose <purpose> [--from <branch>]");
        process.exit(1);
      }

      await createBranch(
        args[nameIndex + 1],
        args[descIndex + 1],
        args[purposeIndex + 1],
        fromIndex !== -1 ? args[fromIndex + 1] : undefined
      );
    } else if (command === "switch") {
      const nameIndex = args.indexOf("--name");
      if (nameIndex === -1) {
        console.error("Usage: switch --name <branch>");
        process.exit(1);
      }
      await switchBranch(args[nameIndex + 1]);
    } else if (command === "list") {
      await listBranches();
    } else if (command === "describe") {
      const nameIndex = args.indexOf("--name");
      const descIndex = args.indexOf("--description");
      const purposeIndex = args.indexOf("--purpose");

      if (nameIndex === -1) {
        console.error("Usage: describe --name <branch> [--description <desc>] [--purpose <purpose>]");
        process.exit(1);
      }

      await describeBranch(
        args[nameIndex + 1],
        descIndex !== -1 ? args[descIndex + 1] : undefined,
        purposeIndex !== -1 ? args[purposeIndex + 1] : undefined
      );
    } else if (command === "delete") {
      const nameIndex = args.indexOf("--name");
      const force = args.includes("--force");

      if (nameIndex === -1) {
        console.error("Usage: delete --name <branch> [--force]");
        process.exit(1);
      }

      await deleteBranch(args[nameIndex + 1], force);
    } else if (command === "current") {
      await getCurrentBranchInfo();
    } else {
      console.error(`Unknown command: ${command}`);
      console.error("Commands: create, switch, list, describe, delete, current");
      process.exit(1);
    }
  } catch (error) {
    console.error("Failed to manage branches:", error);
    process.exit(1);
  }
}

if (import.meta.main) {
  main();
}
