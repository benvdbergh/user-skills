#!/usr/bin/env bun
/**
 * GrepSymbol.ts
 *
 * Search for function/class names globally using AST parsing.
 * Prevents code duplication by finding existing symbols.
 *
 * Usage:
 *   bun run $PAI_DIR/skills/MinimalistCoding/Tools/GrepSymbol.ts --symbol <name> --type <function|class>
 *   bun run $PAI_DIR/skills/MinimalistCoding/Tools/GrepSymbol.ts --symbol validateUser
 */

import { readdir, readFile } from 'fs/promises';
import { join, extname } from 'path';
import { existsSync } from 'fs';
import * as ts from 'typescript';

interface SymbolResult {
  name: string;
  file: string;
  signature: string;
  line: number;
  type: 'function' | 'class' | 'interface' | 'type';
}

const PAI_DIR = process.env.PAI_DIR || process.env.PAI_HOME || join(process.env.HOME || '', '.claude');

function findSymbolsInSourceFile(sourceFile: ts.SourceFile, symbolName: string): SymbolResult[] {
  const results: SymbolResult[] = [];

  function visit(node: ts.Node) {
    // Check for function declarations
    if (ts.isFunctionDeclaration(node) && node.name) {
      if (node.name.text.toLowerCase().includes(symbolName.toLowerCase())) {
        const signature = node.name.text + (node.typeParameters ? `<${node.typeParameters.map(t => t.getText()).join(', ')}>` : '') +
          '(' + (node.parameters.map(p => p.getText()).join(', ')) + ')';
        results.push({
          name: node.name.text,
          file: sourceFile.fileName,
          signature,
          line: sourceFile.getLineAndCharacterOfPosition(node.getStart()).line + 1,
          type: 'function'
        });
      }
    }

    // Check for class declarations
    if (ts.isClassDeclaration(node) && node.name) {
      if (node.name.text.toLowerCase().includes(symbolName.toLowerCase())) {
        results.push({
          name: node.name.text,
          file: sourceFile.fileName,
          signature: node.name.text,
          line: sourceFile.getLineAndCharacterOfPosition(node.getStart()).line + 1,
          type: 'class'
        });
      }
    }

    // Check for interface declarations
    if (ts.isInterfaceDeclaration(node) && node.name) {
      if (node.name.text.toLowerCase().includes(symbolName.toLowerCase())) {
        results.push({
          name: node.name.text,
          file: sourceFile.fileName,
          signature: node.name.text,
          line: sourceFile.getLineAndCharacterOfPosition(node.getStart()).line + 1,
          type: 'interface'
        });
      }
    }

    // Check for type aliases
    if (ts.isTypeAliasDeclaration(node) && node.name) {
      if (node.name.text.toLowerCase().includes(symbolName.toLowerCase())) {
        results.push({
          name: node.name.text,
          file: sourceFile.fileName,
          signature: node.name.text,
          line: sourceFile.getLineAndCharacterOfPosition(node.getStart()).line + 1,
          type: 'type'
        });
      }
    }

    ts.forEachChild(node, visit);
  }

  visit(sourceFile);
  return results;
}

async function findTypeScriptFiles(dir: string, fileList: string[] = []): Promise<string[]> {
  const files = await readdir(dir, { withFileTypes: true });
  
  for (const file of files) {
    const filePath = join(dir, file.name);
    
    // Skip node_modules, .git, and other common exclusions
    if (file.name.startsWith('.') || file.name === 'node_modules' || file.name === 'dist' || file.name === 'build') {
      continue;
    }
    
    if (file.isDirectory()) {
      await findTypeScriptFiles(filePath, fileList);
    } else if (extname(file.name) === '.ts' || extname(file.name) === '.tsx') {
      fileList.push(filePath);
    }
  }
  
  return fileList;
}

async function main() {
  const args = process.argv.slice(2);
  const symbolIndex = args.indexOf('--symbol');
  const typeIndex = args.indexOf('--type');
  const dirIndex = args.indexOf('--dir');

  if (symbolIndex === -1 || !args[symbolIndex + 1]) {
    console.error('❌ Usage: --symbol <name> [--type <function|class>] [--dir <directory>]');
    process.exit(1);
  }

  const symbolName = args[symbolIndex + 1];
  const symbolType = typeIndex !== -1 ? args[typeIndex + 1] : undefined;
  const searchDir = dirIndex !== -1 ? args[dirIndex + 1] : process.cwd();

  if (!existsSync(searchDir)) {
    console.error(`❌ Directory not found: ${searchDir}`);
    process.exit(1);
  }

  console.log(`🔍 Searching for "${symbolName}" in ${searchDir}...\n`);

  const tsFiles = await findTypeScriptFiles(searchDir);
  const allResults: SymbolResult[] = [];

  for (const filePath of tsFiles) {
    try {
      const content = await readFile(filePath, 'utf-8');
      const sourceFile = ts.createSourceFile(
        filePath,
        content,
        ts.ScriptTarget.Latest,
        true
      );

      const results = findSymbolsInSourceFile(sourceFile, symbolName);
      allResults.push(...results);
    } catch (error) {
      // Skip files with parse errors
      continue;
    }
  }

  // Filter by type if specified
  const filteredResults = symbolType
    ? allResults.filter(r => r.type === symbolType)
    : allResults;

  if (filteredResults.length === 0) {
    console.log(`❌ No symbols found matching "${symbolName}"`);
    process.exit(1);
  }

  console.log(`✅ Found ${filteredResults.length} symbol(s):\n`);
  for (const result of filteredResults) {
    console.log(`${result.type.toUpperCase().padEnd(10)} ${result.name}`);
    console.log(`           ${result.file}:${result.line}`);
    console.log(`           ${result.signature}\n`);
  }

  // Output JSON for programmatic use
  if (args.includes('--json')) {
    console.log(JSON.stringify(filteredResults, null, 2));
  }
}

main().catch(console.error);
