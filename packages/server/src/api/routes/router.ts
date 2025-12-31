import { Hono } from "hono";
import { textToSpeechController } from "../controllers/text-to-speech.js";
import { voiceConversionController } from "../controllers/voice-cloning.js";
import { makeAnAudioController } from "../controllers/make-an-audio.js";
import { jobStatusController } from "../controllers/job-status.js";
import { allJobController } from "../controllers/all-jobs.js";
import { audioStreamingController } from "../controllers/audio-streaming.js";
import {
  allTargetAudioController,
  targetAudioController,
} from "../controllers/target.js";

const router = new Hono();

router.post("/text-to-speech", textToSpeechController);
router.post("/voice-conversion", voiceConversionController);
router.post("/make-an-audio", makeAnAudioController);
router.get("/job-status/:jobId", jobStatusController);
router.get("/all-jobs", allJobController);
router.get("/audio/:jobId", audioStreamingController);
router.get("/target/:id", targetAudioController);
router.get("/voices", allTargetAudioController);

export { router };
