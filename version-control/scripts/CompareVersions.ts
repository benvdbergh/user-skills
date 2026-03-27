#!/usr/bin/env bun

/**
 * Compare two versions or commits in PAI repository
 * Shows differences between commits, tags, or branches
 */

import { $ } from "bun";
import { existsSync } from "fs";
import { join } from "path";

const PAI_DIR = process.env.PAI_DIR || "/home/ben/.claude";

interface CompareOptions {
  from: string;
  to?: string;
  file?: string;
  stat?: boolean;
}

async function compareVersions(options: CompareOptions): Promise<void> {
  const gitDir = join(PAI_DIR, ".git");
  
  if (!existsSync(gitDir)) {
    console.error("Git repository not initialized. Run InitializeGit.ts first.");
    process.exit(1);
  }

  const to = options.to || "HEAD";
  let gitCommand = `cd ${PAI_DIR} && git diff`;

  if (options.stat) {
    gitCommand += " --stat";
  }

  gitCommand += ` ${options.from}..${to}`;

  if (options.file) {
    gitCommand += ` -- ${options.file}`;
  }

  try {
    const output = await $`${gitCommand}`.text();
    
    if (!output.trim()) {
      console.log("No differences found");
    } else {
      console.log(output);
    }
  } catch (error) {
    console.error("Failed to compare versions:", error);
    process.exit(1);
  }
}

async function main() {
  try {
    const args = process.argv.slice(2);
    const fromIndex = args.indexOf("--from");
    const toIndex = args.indexOf("--to");
    const fileIndex = args.indexOf("--file");
    const stat = args.includes("--stat");

    if (fromIndex === -1) {
      console.error("--from is required");
      process.exit(1);
    }

    const options: CompareOptions = {
      from: args[fromIndex + 1],
      stat,
    };

    if (toIndex !== -1) {
      options.to = args[toIndex + 1];
    }

    if (fileIndex !== -1) {
      options.file = args[fileIndex + 1];
    }

    await compareVersions(options);
  } catch (error) {
    console.error("Failed to compare versions:", error);
    process.exit(1);
  }
}

if (import.meta.main) {
  main();
}
