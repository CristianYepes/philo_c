import { execSync } from "child_process";
import { writeFileSync, unlinkSync, mkdtempSync, rmSync } from "fs";
import { join } from "path";
import { tmpdir } from "os";

export interface CompileResult {
  success: boolean;
  output?: string;
  error?: string;
  exitCode: number;
}

export function compileProject(projectDir: string, timeout = 10000): CompileResult {
  try {
    execSync("make re", { cwd: projectDir, timeout, encoding: "utf-8", stdio: "pipe" });
    return { success: true, exitCode: 0 };
  } catch (err: any) {
    return {
      success: false,
      error: err.stderr?.toString() || err.message,
      exitCode: err.status || 1,
    };
  }
}

export function compileWithFlags(
  projectDir: string,
  extraFlags: string[],
  timeout = 10000
): CompileResult {
  try {
    execSync("make fclean", { cwd: projectDir, timeout, stdio: "pipe" });
    const flagStr = extraFlags.join(" ");
    const cmd = `make CFLAGS="-Wall -Wextra -Werror -pthread ${flagStr}"`;
    execSync(cmd, { cwd: projectDir, timeout, encoding: "utf-8", stdio: "pipe" });
    return { success: true, exitCode: 0 };
  } catch (err: any) {
    return {
      success: false,
      error: err.stderr?.toString() || err.message,
      exitCode: err.status || 1,
    };
  }
}

export function runBinary(
  projectDir: string,
  args: string[],
  timeout = 10000
): CompileResult {
  try {
    const cmd = `./philo ${args.join(" ")}`;
    const output = execSync(cmd, {
      cwd: projectDir,
      timeout,
      encoding: "utf-8",
      stdio: ["pipe", "pipe", "pipe"],
    });
    return { success: true, output, exitCode: 0 };
  } catch (err: any) {
    return {
      success: false,
      output: err.stdout?.toString() || "",
      error: err.stderr?.toString() || err.message,
      exitCode: err.status || 1,
    };
  }
}

export function runBinaryWithStderr(
  projectDir: string,
  args: string[],
  timeout = 10000
): { stdout: string; stderr: string; exitCode: number } {
  try {
    const result = execSync(`./philo ${args.join(" ")}`, {
      cwd: projectDir,
      timeout,
      encoding: "utf-8",
      stdio: ["pipe", "pipe", "pipe"],
    });
    return { stdout: result, stderr: "", exitCode: 0 };
  } catch (err: any) {
    return {
      stdout: err.stdout?.toString() || "",
      stderr: err.stderr?.toString() || "",
      exitCode: err.status || 1,
    };
  }
}
