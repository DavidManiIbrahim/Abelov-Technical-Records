import { createApp } from "./app";
import { env } from "./config/env";
import { logger } from "./middlewares/logger";
import { connectMongo } from "./db/mongo";

const app = createApp();
const port = Number(process.env.PORT) || env.PORT || 4000;


const start = async () => {
  try {
    await connectMongo();

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
