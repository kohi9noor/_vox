import { db } from "@/db/index.js";
import { voiceGeneration } from "@/db/schema.js";
import { desc } from "drizzle-orm";
import { Context } from "hono";

export async function allJobController(c: Context) {
  const jobs = await db
    .select()
    .from(voiceGeneration)
    .orderBy(desc(voiceGeneration.createdAt));

  return c.json({
    success: true,
    data: {
      count: jobs.length,
      jobs: jobs.map((job) => ({
        ...job,
        outputUrl: job.status === "completed" ? `/api/audio/${job.id}` : null,
      })),
    },
  });
}
