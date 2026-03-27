#!/usr/bin/env bun

/**
 * View git history for PAI repository
 * Displays commits, file changes, and statistics
 */

import { $ } from "bun";
import { existsSync } from "fs";
import { join } from "path";

const PAI_DIR = process.env.PAI_DIR || "/home/ben/.claude";

interface HistoryOptions {
  limit?: number;
  file?: string;
  since?: string;
  format?: "short" | "full" | "stat";
}

async function viewHistory(options: HistoryOptions = {}): Promise<void> {
  const gitDir = join(PAI_DIR, ".git");
  
  if (!existsSync(gitDir)) {
    console.error("Git repository not initialized. Run InitializeGit.ts first.");
    process.exit(1);
  }

  const limit = options.limit || 10;
  const format = options.format || "short";

  let gitCommand = `cd ${PAI_DIR} && git log --oneline -${limit}`;

  if (options.file) {
    gitCommand += ` -- ${options.file}`;
  }

  if (options.since) {
    gitCommand += ` --since="${options.since}"`;
  }

  if (format === "stat") {
    gitCommand = gitCommand.replace("--oneline", "--stat");
  } else if (format === "full") {
    gitCommand = gitCommand.replace("--oneline", "");
  }

  try {
    const output = await $`${gitCommand}`.text();
    console.log(output);
  } catch (error) {
    console.error("Failed to view history:", error);
    process.exit(1);
  }
}

async function main() {
  try {
    const args = process.argv.slice(2);
    const limitIndex = args.indexOf("--limit");
    const fileIndex = args.indexOf("--file");
    const sinceIndex = args.indexOf("--since");
    const formatIndex = args.indexOf("--format");

    const options: HistoryOptions = {};

    if (limitIndex !== -1) {
      options.limit = parseInt(args[limitIndex + 1], 10);
    }

    if (fileIndex !== -1) {
      options.file = args[fileIndex + 1];
    }

    if (sinceIndex !== -1) {
      options.since = args[sinceIndex + 1];
    }

    if (formatIndex !== -1) {
      const formatArg = args[formatIndex + 1];
      if (["short", "full", "stat"].includes(formatArg)) {
        options.format = formatArg as HistoryOptions["format"];
      }
    }

    await viewHistory(options);
  } catch (error) {
    console.error("Failed to view history:", error);
    process.exit(1);
  }
}

if (import.meta.main) {
  main();
}
