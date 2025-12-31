import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";

export const voiceGeneration = sqliteTable("voice_generation", {
  id: text("id").primaryKey(), // We'll generate UUIDs in JS
  type: text("type", {
    enum: ["tts", "voice_conversion", "make_an_audio"],
  }).notNull(),

  /* TTS/SFX input */
  text: text("text"),
  error: text("error"),

  /* VC input */
  sourceAudioPath: text("source_audio_path"),

  /* Common */
  targetVoiceId: text("target_voice_id"),
  outputAudioPath: text("output_audio_path"),

  /* SFX specific */
  duration: integer("duration"),
  scale: integer("scale"),

  status: text("status", {
    enum: ["queued", "processing", "completed", "failed"],
  })
    .default("queued")
    .notNull(),

  createdAt: text("created_at")
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
});
