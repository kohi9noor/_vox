CREATE TABLE `voice_generation` (
	`id` text PRIMARY KEY NOT NULL,
	`type` text NOT NULL,
	`text` text,
	`error` text,
	`source_audio_path` text,
	`target_voice_id` text,
	`output_audio_path` text,
	`duration` integer,
	`scale` integer,
	`status` text DEFAULT 'queued' NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
