#!/usr/bin/env bun

/**
 * Commit current changes to PAI repository
 * Generates descriptive commit messages based on file changes
 */

import { $ } from "bun";
import { existsSync } from "fs";
import { join } from "path";
import { updateStateForVCOperation, getCurrentCommitHash } from "./StateIntegration";

const PAI_DIR = process.env.PAI_DIR || "/home/ben/.claude";

interface CommitOptions {
  message?: string;
  files?: string[];
  autoMessage?: boolean;
}

async function generateCommitMessage(files: string[]): Promise<string> {
  if (files.length === 0) {
    return "Update PAI framework";
  }

  const categories: Record<string, string[]> = {
    hooks: [],
    skills: [],
    tools: [],
    settings: [],
    other: [],
  };

  for (const file of files) {
    if (file.includes("/hooks/")) {
      categories.hooks.push(file);
    } else if (file.includes("/skills/")) {
      categories.skills.push(file);
    } else if (file.includes("/scripts/")) {
      categories.tools.push(file);
    } else if (file.includes("settings.json")) {
      categories.settings.push(file);
    } else {
      categories.other.push(file);
    }
  }

  const parts: string[] = [];

  if (categories.hooks.length > 0) {
    const hookNames = categories.hooks
      .map((f) => f.split("/").pop()?.replace(".ts", "") || "")
      .filter(Boolean);
    parts.push(`hooks: ${hookNames.join(", ")}`);
  }

  if (categories.skills.length > 0) {
    const skillNames = categories.skills
      .map((f) => {
        const match = f.match(/skills\/([^/]+)/);
        return match ? match[1] : "";
      })
      .filter(Boolean)
      .filter((v, i, a) => a.indexOf(v) === i);
    parts.push(`skills: ${skillNames.join(", ")}`);
  }

  if (categories.tools.length > 0) {
    parts.push(`tools: ${categories.tools.length} file(s)`);
  }

  if (categories.settings.length > 0) {
    parts.push("settings");
  }

  if (categories.other.length > 0) {
    parts.push(`other: ${categories.other.length} file(s)`);
  }

  const message = parts.join(" | ");
  const sessionId = process.env.CLAUDE_CODE_SESSION_ID || "unknown";
  return `${message} [session: ${sessionId.substring(0, 8)}]`;
}

async function commitChanges(options: CommitOptions = {}): Promise<void> {
  const gitDir = join(PAI_DIR, ".git");
  
  if (!existsSync(gitDir)) {
    console.error("Git repository not initialized. Run InitializeGit.ts first.");
    process.exit(1);
  }

  // Get changed files
  let changedFiles: string[] = [];
  
  if (options.files && options.files.length > 0) {
    changedFiles = options.files;
  } else {
    const statusOutput = await $`cd ${PAI_DIR} && git status --porcelain`.text();
    changedFiles = statusOutput
      .split("\n")
      .filter((line) => line.trim())
      .map((line) => line.substring(3).trim());
  }

  if (changedFiles.length === 0) {
    console.log("No changes to commit");
    return;
  }

  // Generate commit message
  let commitMessage = options.message;
  
  if (!commitMessage && options.autoMessage !== false) {
    commitMessage = await generateCommitMessage(changedFiles);
  } else if (!commitMessage) {
    commitMessage = "Update PAI framework";
  }

  // Stage files
  if (options.files && options.files.length > 0) {
    for (const file of options.files) {
      const fullPath = join(PAI_DIR, file);
      if (existsSync(fullPath)) {
        await $`cd ${PAI_DIR} && git add ${file}`.quiet();
      }
    }
  } else {
    await $`cd ${PAI_DIR} && git add -A`.quiet();
  }

  // Commit
  await $`cd ${PAI_DIR} && git commit -m ${commitMessage}`.quiet();

  // Get commit hash for state update
  const commitHash = await getCurrentCommitHash();

  // Update state with commit information
  await updateStateForVCOperation('commit', {
    commitHash: commitHash || undefined,
    commitMessage,
    filesChanged: changedFiles,
  });

  console.log(`✓ Committed ${changedFiles.length} file(s)`);
  console.log(`  Message: ${commitMessage}`);
  if (commitHash) {
    console.log(`  Commit: ${commitHash}`);
  }
}

async function main() {
  try {
    const args = process.argv.slice(2);
    const messageIndex = args.indexOf("--message");
    const filesIndex = args.indexOf("--files");
    const noAutoMessage = args.includes("--no-auto-message");

    const options: CommitOptions = {
      autoMessage: !noAutoMessage,
    };

    if (messageIndex !== -1) {
      options.message = args[messageIndex + 1];
    }

    if (filesIndex !== -1) {
      const filesArg = args[filesIndex + 1];
      options.files = filesArg.split(",").map((f) => f.trim());
    }

    await commitChanges(options);
  } catch (error) {
    console.error("Failed to commit changes:", error);
    process.exit(1);
  }
}

if (import.meta.main) {
  main();
}
