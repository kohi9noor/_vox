import { db } from "@/db/index.js";
import { voiceGeneration } from "@/db/schema.js";
import { eq } from "drizzle-orm";
import { Context } from "hono";

export async function jobStatusController(c: Context) {
  const jobId = c.req.param("jobId");
  const [job] = await db
    .select()
    .from(voiceGeneration)
    .where(eq(voiceGeneration.id, jobId));

  if (!job) return c.json({ success: false, error: "Job not found" }, 404);

  return c.json({
    success: true,
    data: {
      status: job.status,
      error: job.error,
      result:
        job.status === "completed"
          ? { audioId: job.id, targetedVoiceId: job.targetVoiceId }
          : null,
    },
  });
}
