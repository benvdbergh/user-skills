import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { E2E_R04_LAYOUT_PATHS } from "./e2e-r04-layout.manifest.js";

describe("R0.4 layout manifest (BEN-75)", () => {
  const packageRoot = path.resolve(".");

  it("required R0.4 artifacts exist", () => {
    for (const rel of E2E_R04_LAYOUT_PATHS) {
      expect(fs.existsSync(path.join(packageRoot, rel))).toBe(true);
    }
  });
});
