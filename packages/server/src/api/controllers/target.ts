import { config } from "@/config/index.js";
import { Context } from "hono";
import path from "path";
import fs from "fs";
export function targetAudioController(c: Context) {
  const id = c.req.param("id");

  const targetDir = config.storage.targetDir;
  const filePath = path.join(targetDir, id.endsWith(".wav") ? id : `${id}.wav`);

  if (!fs.existsSync(filePath)) {
    return c.json({ error: "Voice not found" }, 404);
  }

  const audioData = fs.readFileSync(filePath);
  return c.body(audioData, 200, {
    "Content-Type": "audio/wav",
  });
}

export async function allTargetAudioController(c: Context) {
  const targetDir = config.storage.targetDir;
  const files = fs
    .readdirSync(targetDir)
    .filter((f) => f.endsWith(".wav") || f.endsWith(".mp3"));
  return c.json(
    files.map((f) => ({ id: f, name: f.replace(/\.[^/.]+$/, "") }))
  );
}
