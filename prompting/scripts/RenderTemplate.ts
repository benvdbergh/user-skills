#!/usr/bin/env bun
/**
 * RenderTemplate.ts - Template Rendering Engine
 *
 * Renders Handlebars templates with YAML data sources.
 * Template paths resolve relative to the skill's assets/ directory.
 * Data and output paths resolve relative to the current working directory.
 *
 * Usage:
 *   bun run RenderTemplate.ts --template <path> --data <path> [--output <path>] [--preview]
 *
 * Examples:
 *   bun run RenderTemplate.ts --template Primitives/Roster.hbs --data ./data/Agents.yaml
 *   bun run RenderTemplate.ts -t Primitives/Gate.hbs -d ./data/Gates.yaml --preview
 */

import Handlebars from 'handlebars';
import { parse as parseYaml } from 'yaml';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { resolve, dirname, basename, isAbsolute } from 'path';
import { parseArgs } from 'util';

// ============================================================================
// Path Resolution
// ============================================================================

function getAssetsDir(): string {
  const skillDir = dirname(dirname(import.meta.path));
  return resolve(skillDir, 'assets');
}

function resolveAssetPath(path: string): string {
  if (isAbsolute(path)) return path;
  return resolve(getAssetsDir(), path);
}

function resolveWorkingPath(path: string): string {
  if (isAbsolute(path)) return path;
  return resolve(process.cwd(), path);
}

// ============================================================================
// Custom Handlebars Helpers
// ============================================================================

Handlebars.registerHelper('uppercase', (str: string) => {
  return str?.toUpperCase() ?? '';
});

Handlebars.registerHelper('lowercase', (str: string) => {
  return str?.toLowerCase() ?? '';
});

Handlebars.registerHelper('titlecase', (str: string) => {
  return str?.replace(/\w\S*/g, (txt) =>
    txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
  ) ?? '';
});

Handlebars.registerHelper('indent', (str: string, spaces: number) => {
  if (!str) return '';
  const indent = ' '.repeat(typeof spaces === 'number' ? spaces : 2);
  return str.split('\n').map(line => indent + line).join('\n');
});

Handlebars.registerHelper('join', (arr: string[], separator: string) => {
  if (!Array.isArray(arr)) return '';
  return arr.join(typeof separator === 'string' ? separator : ', ');
});

Handlebars.registerHelper('eq', (a: unknown, b: unknown) => a === b);

Handlebars.registerHelper('gt', (a: number, b: number) => a > b);

Handlebars.registerHelper('lt', (a: number, b: number) => a < b);

Handlebars.registerHelper('includes', (arr: unknown[], value: unknown) => {
  return Array.isArray(arr) && arr.includes(value);
});

Handlebars.registerHelper('now', (format?: string) => {
  const now = new Date();
  if (format === 'date') return now.toISOString().split('T')[0];
  if (format === 'time') return now.toTimeString().split(' ')[0];
  return now.toISOString();
});

Handlebars.registerHelper('pluralize', (count: number, singular: string, plural?: string) => {
  const pluralForm = typeof plural === 'string' ? plural : `${singular}s`;
  return count === 1 ? singular : pluralForm;
});

Handlebars.registerHelper('formatNumber', (num: number) => {
  return num?.toLocaleString() ?? '';
});

Handlebars.registerHelper('percent', (value: number, total: number, decimals = 0) => {
  if (!total) return '0';
  return ((value / total) * 100).toFixed(typeof decimals === 'number' ? decimals : 0);
});

Handlebars.registerHelper('truncate', (str: string, length: number) => {
  if (!str) return '';
  const maxLen = typeof length === 'number' ? length : 100;
  return str.length > maxLen ? str.substring(0, maxLen) + '...' : str;
});

Handlebars.registerHelper('default', (value: unknown, defaultValue: unknown) => {
  return value ?? defaultValue;
});

Handlebars.registerHelper('json', (obj: unknown, pretty = false) => {
  return JSON.stringify(obj, null, pretty ? 2 : undefined);
});

Handlebars.registerHelper('codeblock', (code: string, language?: string) => {
  const lang = typeof language === 'string' ? language : '';
  return `\`\`\`${lang}\n${code}\n\`\`\``;
});

Handlebars.registerHelper('repeat', (count: number, options: Handlebars.HelperOptions) => {
  let result = '';
  for (let i = 0; i < count; i++) {
    result += options.fn({ index: i, first: i === 0, last: i === count - 1 });
  }
  return result;
});

// ============================================================================
// Template Engine
// ============================================================================

interface RenderOptions {
  templatePath: string;
  dataPath: string;
  outputPath?: string;
  preview?: boolean;
}

function loadTemplate(templatePath: string): HandlebarsTemplateDelegate {
  const fullPath = resolveAssetPath(templatePath);
  if (!existsSync(fullPath)) {
    throw new Error(`Template not found: ${fullPath}`);
  }
  const templateSource = readFileSync(fullPath, 'utf-8');
  return Handlebars.compile(templateSource);
}

function loadData(dataPath: string): Record<string, unknown> {
  const fullPath = resolveWorkingPath(dataPath);
  if (!existsSync(fullPath)) {
    throw new Error(`Data file not found: ${fullPath}`);
  }
  const dataSource = readFileSync(fullPath, 'utf-8');
  if (dataPath.endsWith('.json')) {
    return JSON.parse(dataSource);
  }
  return parseYaml(dataSource) as Record<string, unknown>;
}

function registerPartials(assetsDir: string): void {
  const partialsDir = resolve(assetsDir, 'Partials');
  if (!existsSync(partialsDir)) return;

  const files = Bun.spawnSync(['ls', partialsDir]).stdout.toString().trim().split('\n');
  for (const file of files) {
    if (file.endsWith('.hbs')) {
      const partialName = basename(file, '.hbs');
      const partialPath = resolve(partialsDir, file);
      const partialSource = readFileSync(partialPath, 'utf-8');
      Handlebars.registerPartial(partialName, partialSource);
    }
  }
}

export function renderTemplate(options: RenderOptions): string {
  const assetsDir = getAssetsDir();
  registerPartials(assetsDir);

  const template = loadTemplate(options.templatePath);
  const data = loadData(options.dataPath);
  const rendered = template(data);

  if (options.preview) {
    console.log('\n=== PREVIEW ===\n');
    console.log(rendered);
    console.log('\n=== END PREVIEW ===\n');
  }

  if (options.outputPath) {
    const outputFullPath = resolveWorkingPath(options.outputPath);
    writeFileSync(outputFullPath, rendered);
    console.log(`✓ Rendered to: ${outputFullPath}`);
  }

  return rendered;
}

// ============================================================================
// CLI Interface
// ============================================================================

function main(): void {
  const { values } = parseArgs({
    args: Bun.argv.slice(2),
    options: {
      template: { type: 'string', short: 't' },
      data: { type: 'string', short: 'd' },
      output: { type: 'string', short: 'o' },
      preview: { type: 'boolean', short: 'p' },
      help: { type: 'boolean', short: 'h' },
    },
    strict: true,
    allowPositionals: false,
  });

  if (values.help || !values.template || !values.data) {
    console.log(`
Template Renderer

Usage:
  bun run RenderTemplate.ts --template <path> --data <path> [options]

Options:
  -t, --template <path>  Template file (.hbs) relative to assets/
  -d, --data <path>      Data file (.yaml or .json) relative to CWD
  -o, --output <path>    Output file relative to CWD (optional)
  -p, --preview          Show preview in console
  -h, --help             Show this help

Available Helpers:
  {{uppercase str}}           - Convert to uppercase
  {{lowercase str}}           - Convert to lowercase
  {{titlecase str}}           - Convert to title case
  {{indent str spaces}}       - Indent text
  {{join arr separator}}      - Join array
  {{eq a b}}                  - Check equality
  {{gt a b}} / {{lt a b}}     - Greater/less than
  {{now format}}              - Current date/time
  {{pluralize count word}}    - Pluralize
  {{formatNumber num}}        - Format with commas
  {{percent value total}}     - Calculate percentage
  {{truncate str length}}     - Truncate to length
  {{default value fallback}}  - Default value
  {{json obj pretty}}         - JSON stringify
  {{codeblock code lang}}     - Markdown code block
`);
    process.exit(values.help ? 0 : 1);
  }

  try {
    renderTemplate({
      templatePath: values.template,
      dataPath: values.data,
      outputPath: values.output,
      preview: values.preview,
    });
  } catch (error) {
    console.error(`Error: ${(error as Error).message}`);
    process.exit(1);
  }
}

if (import.meta.main) {
  main();
}
