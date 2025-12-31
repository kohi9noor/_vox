import { Hono } from "hono";
import { serve } from "@hono/node-server";
import { cors } from "hono/cors";
import fs from "fs";
import { config } from "./config/index.js";
import { router } from "./api/routes/router.js";
import { logger } from "./utils/logger.js";

const app = new Hono();

[
  config.storage.targetDir,
  config.storage.uploadsDir,
  config.storage.outputDir,
].forEach((dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

app.use(
  "/*",
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  })
);

app.get("/health", (c) => c.json({ status: "ok" }));

app.route("/api", router);

logger.info(`Server is starting on port ${config.server.port}...`);

serve({
  fetch: app.fetch,
  port: config.server.port,
});
