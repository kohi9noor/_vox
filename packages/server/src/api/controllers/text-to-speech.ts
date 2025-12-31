import { db } from "@/db/index.js";
import { addJobToQueue } from "@/services/queue.js";
import * as uuid from "uuid";
import path from "path";
import { Context } from "hono";
import { config } from "@/config/index.js";
import { voiceGeneration } from "@/db/schema.js";
import { MODEL } from "@/types/index.js";

export async function textToSpeechController(c: Context) {
  const body = await c.req.json();
  const { text, targetedVoiceId } = body;

  const jobId = uuid.v4();
  const outputFileName = `tts_${jobId}.wav`;
  const outputPath = path.join(config.storage.outputDir, outputFileName);

  await db.insert(voiceGeneration).values({
    id: jobId,
    type: MODEL.XTTS,
    text,
    targetVoiceId: targetedVoiceId,
    outputAudioPath: outputPath,
    status: "queued",
  });

  addJobToQueue(jobId);

  return c.json({ success: true, data: { jobId } });
}
