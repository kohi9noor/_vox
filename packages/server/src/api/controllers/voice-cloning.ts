import { config } from "@/config/index.js";
import { MODEL } from "@/types/index.js";
import { Context } from "hono";
import path from "path";
import * as uuid from "uuid";
import fs from "fs";
import { db } from "@/db/index.js";
import { voiceGeneration } from "@/db/schema.js";
import { addJobToQueue } from "@/services/queue.js";
export async function voiceConversionController(c: Context) {
  const formData = await c.req.parseBody();
  const file = formData.audio as File;
  const targetedVoiceId = formData.targetedVoiceId as string;

  if (!file) return c.json({ success: false, error: "No file uploaded" }, 400);

  const jobId = uuid.v4();
  const uploadName = `upload_${jobId}${path.extname(file.name)}`;
  const uploadPath = path.join(config.storage.uploadsDir, uploadName);

  const arrayBuffer = await file.arrayBuffer();
  fs.writeFileSync(uploadPath, Buffer.from(arrayBuffer));

  const outputFileName = `vc_${jobId}.wav`;
  const outputPath = path.join(config.storage.outputDir, outputFileName);

  await db.insert(voiceGeneration).values({
    id: jobId,
    type: MODEL.SEEDVC,
    sourceAudioPath: uploadPath,
    targetVoiceId: targetedVoiceId,
    outputAudioPath: outputPath,
    status: "queued",
  });

  addJobToQueue(jobId);

  return c.json({ success: true, data: { jobId } });
}
