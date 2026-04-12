#!/usr/bin/env bun

/**
 * ShardPRD.ts — Backward-compatible entry for ShardFromSources.
 */

import { main } from "./ShardFromSources";

if (import.meta.main) {
  main();
}
