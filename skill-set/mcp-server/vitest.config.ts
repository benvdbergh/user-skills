import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    include: ["tests/**/*.test.ts"],
    environment: "node",
    // Avoid tinypool IPC crashes on Windows when e2e tests spawn web builds.
    pool: "forks",
    fileParallelism: false,
  },
});
