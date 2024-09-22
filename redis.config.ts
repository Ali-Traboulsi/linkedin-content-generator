import { createClient } from "redis";

export const connectAndPushToRedis = async (articleURL: string) => {
  const client = createClient();

  client.on("error", (error) => {
    console.error("Redis Client Error:", error);
  });
  try {
    await client.connect(); // Awaiting connection to Redis
    // Example usage: Storing article URLs for background scraping
    await client.sAdd("articleQueueSet", articleURL);
    console.log("Article URL pushed to Redis:", articleURL);
  } catch (error) {
    console.error("Error interacting with Redis:", error);
  } finally {
    await client.disconnect(); // Ensure disconnection after the operation is done
  }
};
