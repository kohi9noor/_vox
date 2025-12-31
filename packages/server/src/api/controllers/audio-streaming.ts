import { db } from "@/db/index.js";
import { voiceGeneration } from "@/db/schema.js";
import { eq } from "drizzle-orm";
import { Context } from "hono";
import fs from "fs";
export async function audioStreamingController(c: Context) {
  const jobId = c.req.param("jobId");
  const [job] = await db
    .select()
    .from(voiceGeneration)
    .where(eq(voiceGeneration.id, jobId));

  if (!job || !job.outputAudioPath || !fs.existsSync(job.outputAudioPath)) {
    return c.json({ error: "Audio not found" }, 404);
  }

  const audioData = fs.readFileSync(job.outputAudioPath);
  return c.body(audioData, 200, {
    "Content-Type": "audio/wav",
    "Content-Disposition": `attachment; filename="output.wav"`,
  });
}
