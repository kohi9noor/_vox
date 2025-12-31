import { logger } from "@/utils/logger.js";
import { spawn } from "child_process";

export interface PythonConfig {
  pythonBin: string;
  pythonScript: string;
  cwd?: string;
}

export async function executePython<T>(
  payload: T,
  config: PythonConfig,
  timeout: number
): Promise<string> {
  return new Promise((resolve, reject) => {
    const venvPath = config.pythonBin.replace(/\/bin\/python$/, "");
    const activateCmd = `source ${venvPath}/bin/activate && python ${config.pythonScript}`;

    console.log(
      `[Python] Spawning: ${activateCmd} in ${
        config.cwd || "current directory"
      }`
    );

    const pythonProcess = spawn("/bin/bash", ["-c", activateCmd], {
      timeout,
      cwd: config.cwd,
      env: { ...process.env },
    });

    let output = "";
    let error = "";
    let isResolved = false;

    const timeoutHandle = setTimeout(() => {
      if (!isResolved) {
        isResolved = true;
        logger.error(`[Python] Process timeout after ${timeout}ms`);
        pythonProcess.kill("SIGTERM");
        reject(new Error(`Python process timeout after ${timeout}ms`));
      }
    }, timeout);

    pythonProcess.stdout?.on("data", (data) => {
      const chunk = data.toString();
      output += chunk;
    });

    pythonProcess.stderr?.on("data", (data) => {
      const chunk = data.toString();
      error += chunk;
      logger.warn(`[Python stderr] ${chunk.trim()}`);
    });

    pythonProcess.on("close", (code) => {
      if (isResolved) return;
      isResolved = true;
      clearTimeout(timeoutHandle);

      if (code !== 0) {
        reject(
          new Error(
            `Python process failed with code ${code}: ${
              error || "no error output"
            }`
          )
        );
      } else if (!output.trim()) {
        reject(new Error("Python process completed but produced no output"));
      } else {
        resolve(output.trim());
      }
    });

    pythonProcess.on("error", (err) => {
      if (isResolved) return;
      isResolved = true;
      clearTimeout(timeoutHandle);
      reject(new Error(`Failed to spawn Python process: ${err.message}`));
    });

    try {
      const jsonPayload = JSON.stringify(payload);
      pythonProcess.stdin?.write(jsonPayload);
      pythonProcess.stdin?.end();
    } catch (err) {
      if (!isResolved) {
        isResolved = true;
        clearTimeout(timeoutHandle);
        reject(err);
      }
    }
  });
}
