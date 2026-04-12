import { homedir } from "os";
import { join } from "path";

export function getPaiDir(): string {
  return process.env.PAI_DIR || join(homedir(), ".claude");
}
