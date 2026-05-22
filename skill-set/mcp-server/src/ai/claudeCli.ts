import { spawn } from "node:child_process";

export interface CommandResult {
  stdout: string;
  stderr: string;
  code: number | null;
}

export function runCommand(
  command: string,
  args: string[],
  options?: { cwd?: string; input?: string; timeoutMs?: number },
): Promise<CommandResult> {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      cwd: options?.cwd,
      shell: process.platform === "win32",
      env: process.env,
    });
    let stdout = "";
    let stderr = "";
    const timeout = options?.timeoutMs
      ? setTimeout(() => {
          child.kill();
          reject(new Error(`Command timed out: ${command}`));
        }, options.timeoutMs)
      : undefined;

    child.stdout?.on("data", (chunk: Buffer) => {
      stdout += chunk.toString("utf8");
    });
    child.stderr?.on("data", (chunk: Buffer) => {
      stderr += chunk.toString("utf8");
    });
    child.on("error", (err) => {
      if (timeout) clearTimeout(timeout);
      reject(err);
    });
    child.on("close", (code) => {
      if (timeout) clearTimeout(timeout);
      resolve({ stdout, stderr, code });
    });

    if (options?.input && child.stdin) {
      child.stdin.write(options.input);
      child.stdin.end();
    }
  });
}

export async function claudeAvailable(): Promise<boolean> {
  try {
    const probe =
      process.platform === "win32"
        ? await runCommand("where", ["claude"], { timeoutMs: 3000 })
        : await runCommand("which", ["claude"], { timeoutMs: 3000 });
    return probe.code === 0;
  } catch {
    return false;
  }
}

/** Parse `claude auth status` stdout/stderr (JSON or legacy prose). */
export function parseClaudeAuthStatus(
  stdout: string,
  stderr: string,
  exitCode: number | null,
): boolean {
  if (exitCode !== 0) return false;

  const combined = `${stdout}\n${stderr}`.trim();
  if (!combined) return false;

  try {
    const json = JSON.parse(combined) as { loggedIn?: boolean };
    if (typeof json.loggedIn === "boolean") {
      return json.loggedIn;
    }
  } catch {
    // not JSON — fall through to legacy heuristics
  }

  const lower = combined.toLowerCase();
  return (
    lower.includes("logged in") ||
    lower.includes('"loggedin":true') ||
    lower.includes('"loggedin": true') ||
    lower.includes("authenticated") ||
    lower.includes("signed in")
  );
}
