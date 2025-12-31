import { MODEL } from "../types/index.js";

import { executePython, PythonConfig } from "./python.js";
import { config } from "../config/index.js";
import path from "path";
import { logger } from "@/utils/logger.js";

interface ProcessorContext<T> {
  jobId: string;
  jobData: T;
  timeout: number;
}

export async function processTextToSpeech<T>(
  context: ProcessorContext<T>
): Promise<string> {
  logger.info(`[XTTS] Processing job: ${context.jobId}`);

  const pythonConfig: PythonConfig = {
    pythonBin: config.models.xtts.pythonBin,
    pythonScript: config.models.xtts.pythonScript,
    cwd: path.dirname(config.models.xtts.pythonScript),
  };

  return await executePython(context.jobData, pythonConfig, context.timeout);
}

export async function processVoiceConversion<T>(
  context: ProcessorContext<T>
): Promise<string> {
  logger.info(`[SEEDVC] Processing job: ${context.jobId}`);

  const pythonConfig: PythonConfig = {
    pythonBin: config.models.seedvc.pythonBin,
    pythonScript: config.models.seedvc.pythonScript,
    cwd: path.dirname(config.models.seedvc.pythonScript),
  };

  return await executePython(context.jobData, pythonConfig, context.timeout);
}

export async function processMakeAnAudio<T>(
  context: ProcessorContext<T>
): Promise<string> {
  logger.info(`[MAKEANAUDIO] Processing job: ${context.jobId}`);

  const pythonConfig: PythonConfig = {
    pythonBin: config.models.makeanaudio.pythonBin,
    pythonScript: config.models.makeanaudio.pythonScript,
    cwd: path.dirname(config.models.makeanaudio.pythonScript),
  };

  return await executePython(context.jobData, pythonConfig, context.timeout);
}

export async function processJobByModel<T>(
  modelType: string,
  context: ProcessorContext<T>
): Promise<string> {
  switch (modelType) {
    case MODEL.XTTS:
      return processTextToSpeech(context);

    case MODEL.SEEDVC:
      return processVoiceConversion(context);

    case MODEL.MAKE_AN_AUDIO:
      return processMakeAnAudio(context);

    default:
      throw new Error(`Unknown model type: ${modelType}`);
  }
}
