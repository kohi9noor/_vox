import PQueue from 'p-queue';
import { db } from '../db/index.js';
import { voiceGeneration } from '../db/schema.js';
import { eq } from 'drizzle-orm';
import { processJobByModel } from './model-processor.js';
import { config } from '../config/index.js';
import path from 'path';
import { logger } from '@/utils/logger.js';

export const queue: PQueue = new PQueue({ concurrency: 1 });

export async function addJobToQueue(jobId: string) {
  queue.add(async () => {
    logger.info(`[Queue] Starting job: ${jobId}`);

    try {
      const [job] = await db
        .select()
        .from(voiceGeneration)
        .where(eq(voiceGeneration.id, jobId));

      if (!job) {
        logger.error(`[Queue] Job ${jobId} not found`);
        return;
      }

      await db
        .update(voiceGeneration)
        .set({ status: 'processing' })
        .where(eq(voiceGeneration.id, jobId));

      let payload = {};
      if (job.type === 'tts') {
        payload = {
          text: job.text,
          voice_id: job.targetVoiceId,
          targetedVoicePath: path.join(
            config.storage.targetDir,
            job.targetVoiceId?.endsWith('.wav')
              ? job.targetVoiceId
              : `${job.targetVoiceId}.wav`
          ),
          output_path: job.outputAudioPath,
        };
      } else if (job.type === 'voice_conversion') {
        payload = {
          source_path: job.sourceAudioPath,
          target_id: job.targetVoiceId,
          targetedVoicePath: path.join(
            config.storage.targetDir,
            job.targetVoiceId?.endsWith('.wav')
              ? job.targetVoiceId
              : `${job.targetVoiceId}.wav`
          ),
          output_path: job.outputAudioPath,
        };
      } else if (job.type === 'make_an_audio') {
        payload = {
          prompt: job.text,
          duration: job.duration,
          scale: job.scale,
          output_path: job.outputAudioPath,
        };
      }

      const result = await processJobByModel(job.type, {
        jobId: job.id,
        jobData: payload,
        timeout: config.python.timeout,
      });

      if (result.startsWith('__ERROR__')) {
        throw new Error(result.replace('__ERROR__:', ''));
      }

      await db
        .update(voiceGeneration)
        .set({
          status: 'completed',
          outputAudioPath: result,
        })
        .where(eq(voiceGeneration.id, jobId));

      logger.info(`[Queue] Job ${jobId} completed successfully`);
    } catch (error: any) {
      logger.error(`[Queue] Job ${jobId} failed: ${error.message}`);

      await db
        .update(voiceGeneration)
        .set({
          status: 'failed',
          error: error.message,
          outputAudioPath: null,
        })
        .where(eq(voiceGeneration.id, jobId));
    }
  });
}
