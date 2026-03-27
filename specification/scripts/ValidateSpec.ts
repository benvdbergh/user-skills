#!/usr/bin/env bun

/**
 * ValidateSpec.ts - Validate specification completeness
 *
 * Usage:
 *   bun run ValidateSpec.ts --spec <path-to-spec.md>
 */

import { parseArgs } from "util";
import { existsSync, readFileSync } from "fs";

interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

const REQUIRED_SECTIONS = {
  spec: ["Project Overview", "Goals & Objectives", "Functional Requirements", "Technical Constraints", "Success Criteria"],
  prd: ["Executive Summary", "Product Vision", "User Stories", "Functional Requirements", "Success Metrics"],
  plan: ["Architecture Overview", "Technology Stack", "Implementation Phases", "Dependencies"],
  constitution: ["Technology Stack", "Architectural Patterns", "Code Standards", "Security Requirements"],
};

function detectDocumentType(content: string): string {
  if (content.includes("# Product Requirements Document")) return "prd";
  if (content.includes("# Technical Implementation Plan")) return "plan";
  if (content.includes("# Project Constitution")) return "constitution";
  return "spec";
}

function hasSection(content: string, sectionName: string): boolean {
  const patterns = [
    new RegExp(`^##+\\s+${sectionName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}`, "m"),
    new RegExp(`^##+\\s+.*${sectionName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}`, "m"),
  ];
  return patterns.some((p) => p.test(content));
}

function hasContent(sectionContent: string): boolean {
  const cleaned = sectionContent.replace(/<!--.*?-->/gs, "").replace(/\{\{.*?\}\}/g, "").trim();
  return cleaned.length > 20;
}

function hasPlaceholders(content: string): boolean {
  return /\{\{\w+\}\}/.test(content) || /<!--\s*TODO:/.test(content);
}

function validateSpec(specPath: string): ValidationResult {
  if (!existsSync(specPath)) {
    return { valid: false, errors: [`Spec file not found: ${specPath}`], warnings: [] };
  }
  const content = readFileSync(specPath, "utf-8");
  const docType = detectDocumentType(content);
  const requiredSections = REQUIRED_SECTIONS[docType as keyof typeof REQUIRED_SECTIONS] || [];
  const errors: string[] = [];
  const warnings: string[] = [];
  for (const section of requiredSections) {
    if (!hasSection(content, section)) errors.push(`Missing required section: ${section}`);
  }
  if (hasPlaceholders(content)) warnings.push("Document contains TODO placeholders that need to be filled in");
  const sectionRegex = /^##\s+(.+)$/gm;
  const sections: Array<{ name: string; content: string }> = [];
  let lastIndex = 0;
  let match;
  while ((match = sectionRegex.exec(content)) !== null) {
    if (sections.length > 0) sections[sections.length - 1].content = content.substring(lastIndex, match.index);
    sections.push({ name: match[1], content: "" });
    lastIndex = match.index;
  }
  if (sections.length > 0) sections[sections.length - 1].content = content.substring(lastIndex);
  for (const section of sections) {
    if (!hasContent(section.content)) warnings.push(`Section "${section.name}" appears to be empty or incomplete`);
  }
  return { valid: errors.length === 0, errors, warnings };
}

function main(): void {
  const { values } = parseArgs({
    args: Bun.argv.slice(2),
    options: { spec: { type: "string", short: "s" }, help: { type: "boolean", short: "h" } },
    strict: true,
    allowPositionals: false,
  });
  if (values.help || !values.spec) {
    console.log(`ValidateSpec - Validate Specification Completeness\nUsage: bun run ValidateSpec.ts --spec <path-to-spec.md>`);
    process.exit(values.help ? 0 : 1);
  }
  const result = validateSpec(values.spec as string);
  console.log(`\nValidation Results for: ${values.spec}`);
  console.log("=".repeat(50));
  if (result.valid && result.warnings.length === 0) {
    console.log("✓ Specification is valid and complete");
  } else {
    if (result.errors.length > 0) { console.log("\n❌ Errors:"); result.errors.forEach((e) => console.log(`  - ${e}`)); }
    if (result.warnings.length > 0) { console.log("\n⚠️  Warnings:"); result.warnings.forEach((w) => console.log(`  - ${w}`)); }
  }
  process.exit(result.valid ? 0 : 1);
}

if (import.meta.main) main();
