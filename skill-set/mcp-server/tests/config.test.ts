import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { loadConfig, loadEnvironments } from "../src/config/loadConfig.js";
import { assertPathUnderRoots, PathAccessError } from "../src/config/pathGuard.js";
import { toPosixPath } from "../src/config/pathModel.js";

const FIXTURE_ROOT = path.resolve("tests/fixtures/minimal-skill");

describe("pathModel", () => {
  it("normalizes Windows paths to posix", () => {
    expect(toPosixPath("a\\b\\c")).toBe("a/b/c");
  });
});

describe("pathGuard", () => {
  it("allows paths under configured roots", () => {
    const root = path.resolve(FIXTURE_ROOT);
    const target = path.join(root, "skill-index.json");
    expect(assertPathUnderRoots(target, [root])).toBe(path.resolve(target));
  });

  it("rejects paths outside roots", () => {
    expect(() =>
      assertPathUnderRoots("C:\\Windows\\System32", [FIXTURE_ROOT]),
    ).toThrow(PathAccessError);
  });
});

describe("loadConfig", () => {
  const tempDirs: string[] = [];

  afterEach(() => {
    for (const d of tempDirs) {
      fs.rmSync(d, { recursive: true, force: true });
    }
  });

  it("loads fixture skills root via config file", () => {
    const pkg = fs.mkdtempSync(path.join(os.tmpdir(), "skill-lab-pkg-"));
    tempDirs.push(pkg);
    fs.writeFileSync(
      path.join(pkg, "skill-lab.config.json"),
      JSON.stringify({
        skillsRoot: FIXTURE_ROOT,
        environmentMapRelativePath:
          "skill-set/catalog/environment-skill-index-map.json",
      }),
    );

    const config = loadConfig(pkg);
    expect(config.skillsRoot).toBe(path.resolve(FIXTURE_ROOT));
    const envs = loadEnvironments(config);
    expect(envs).toHaveLength(1);
    expect(envs[0].id).toBe("user");
  });
});
