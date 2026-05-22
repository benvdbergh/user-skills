import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

describe("web production build (R0.4 smoke)", () => {
  const packageRoot = path.resolve(".");

  it(
    "web production build succeeds",
    () => {
      execSync("npm run web:build", {
        cwd: packageRoot,
        stdio: "pipe",
        env: process.env,
      });
      expect(
        fs.existsSync(path.join(packageRoot, "web/dist/index.html")),
      ).toBe(true);
    },
    120_000,
  );
});
