import { createApp } from "./app";
import { env } from "./config/env";
import { logger } from "./middlewares/logger";
import { connectMongo } from "./db/mongo";
import { initCache } from "./utils/cache";

const app = createApp();
const port = Number(process.env.PORT) || env.PORT || 4000;


const start = async () => {
  try {
    await connectMongo();
    await initCache(env.REDIS_URL);

    logger.info("Database connected successfully");

    app.listen(port, () => {
      logger.info({ port }, "Server listening");
    });

    // Keep process alive
    setInterval(() => { }, 1000 * 60 * 60);
  } catch (err) {
    logger.error({ err }, "Failed to start server");
    process.exit(1);
  }
};

start();
