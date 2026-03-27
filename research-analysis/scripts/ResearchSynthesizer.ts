#!/usr/bin/env bun

/**
 * ResearchSynthesizer.ts - Combines multiple research sources
 *
 * Synthesizes findings from multiple research agents into a coherent document.
 *
 * Usage:
 *   bun run ResearchSynthesizer.ts --sources <source1,source2,...> --output <output-path> [--template <template-path>]
 */

import { parseArgs } from "util";
import { existsSync, readFileSync, writeFileSync, mkdirSync } from "fs";
import { join, dirname } from "path";

const PAI_DIR = process.env.PAI_DIR || "/home/ben/.claude";

interface ResearchSynthesizerOptions {
  sources: string;
  output: string;
  template?: string;
}

function loadSource(sourcePath: string): string {
  if (!existsSync(sourcePath)) {
    throw new Error(`Source file not found: ${sourcePath}`);
  }
  return readFileSync(sourcePath, "utf-8");
}

function synthesizeSources(sources: string[], template?: string): string {
  // Load all sources
  const sourceContents = sources.map((source) => ({
    path: source,
    content: loadSource(source),
  }));

  // If template provided, use it as base structure
  if (template && existsSync(template)) {
    const templateContent = readFileSync(template, "utf-8");
    // TODO: Implement template-based synthesis
    // For now, combine sources with headers
    return synthesizeWithTemplate(templateContent, sourceContents);
  }

  // Otherwise, combine sources with clear section headers
  return synthesizeWithoutTemplate(sourceContents);
}

function synthesizeWithTemplate(template: string, sources: Array<{ path: string; content: string }>): string {
  // Extract key findings from each source
  const findings: Record<string, string[]> = {};

  sources.forEach((source) => {
    const fileName = source.path.split("/").pop() || "source";
    const lines = source.content.split("\n");

    // Extract sections
    let currentSection = "";
    for (const line of lines) {
      if (line.startsWith("## ")) {
        currentSection = line.replace("## ", "").trim();
        if (!findings[currentSection]) {
          findings[currentSection] = [];
        }
      } else if (currentSection && line.trim()) {
        findings[currentSection].push(line);
      }
    }
  });

  // Replace template placeholders with synthesized content
  let synthesized = template;

  // Replace common sections
  Object.entries(findings).forEach(([section, content]) => {
    const placeholder = `{{${section.toLowerCase().replace(/\s+/g, "_")}}}}}`;
    if (synthesized.includes(placeholder)) {
      synthesized = synthesized.replace(placeholder, content.join("\n"));
    }
  });

  // Replace remaining placeholders with TODO
  synthesized = synthesized.replace(/\{\{(\w+)\}\}/g, (match, key) => {
    return `<!-- TODO: Fill in ${key} from research sources -->\n\n`;
  });

  return synthesized;
}

function synthesizeWithoutTemplate(sources: Array<{ path: string; content: string }>): string {
  const date = new Date().toISOString().split("T")[0];
  let synthesized = `# Synthesized Research

**Synthesis Date:** ${date}
**Sources:** ${sources.length}

---

`;

  sources.forEach((source, index) => {
    const fileName = source.path.split("/").pop() || `source-${index + 1}`;
    synthesized += `## Source ${index + 1}: ${fileName}\n\n`;
    synthesized += `${source.content}\n\n---\n\n`;
  });

  synthesized += `## Synthesis Notes

This document combines findings from ${sources.length} research sources.
Review and consolidate overlapping information.
Extract key findings for each section.
`;

  return synthesized;
}

async function main() {
  const { values } = parseArgs({
    args: Bun.argv.slice(2),
    options: {
      sources: { type: "string", required: true },
      output: { type: "string", required: true },
      template: { type: "string" },
    },
  });

  const options = values as unknown as ResearchSynthesizerOptions;

  if (!options.sources || !options.output) {
    console.error("Error: --sources and --output are required");
    console.error("Usage: bun run ResearchSynthesizer.ts --sources <source1,source2,...> --output <output-path> [--template <template-path>]");
    process.exit(1);
  }

  try {
    const sources = options.sources.split(",").map((s) => s.trim());
    const synthesized = synthesizeSources(sources, options.template);

    // Ensure output directory exists
    const outputDir = dirname(options.output);
    if (!existsSync(outputDir)) {
      mkdirSync(outputDir, { recursive: true });
    }

    writeFileSync(options.output, synthesized, "utf-8");
    console.log(`✓ Synthesized research saved to: ${options.output}`);
    console.log(`  Combined ${sources.length} sources`);
  } catch (error) {
    console.error(`Error: ${error instanceof Error ? error.message : String(error)}`);
    process.exit(1);
  }
}

main().catch(console.error);
