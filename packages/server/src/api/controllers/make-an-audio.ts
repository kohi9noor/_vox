import { config } from "@/config/index.js";
import { db } from "@/db/index.js";
import { voiceGeneration } from "@/db/schema.js";
import { MODEL } from "@/types/index.js";
import { Context } from "hono";
import path from "path";
import * as uuid from "uuid";
import { addJobToQueue } from "@/services/queue.js";

export async function makeAnAudioController(c: Context) {
  const body = await c.req.json();
  const { prompt, duration, scale } = body;

  const jobId = uuid.v4();
  const outputFileName = `sfx_${jobId}.wav`;
  const outputPath = path.join(config.storage.outputDir, outputFileName);

  await db.insert(voiceGeneration).values({
    id: jobId,
    type: MODEL.MAKE_AN_AUDIO,
    text: prompt,
    duration: duration || 10,
    scale: scale ?? 3.0,
    outputAudioPath: outputPath,
    status: "queued",
  });

  addJobToQueue(jobId);

  return c.json({ success: true, data: { jobId } });
}
