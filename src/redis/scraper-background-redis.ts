import { createClient } from "redis";
import axios from "axios";
import * as cheerio from "cheerio";
import puppeteer from "puppeteer";
import { cleanArticleContent } from "../../utils/article-cleaner";
import { Article } from "../db/models/article";
import { connectAndPushToRedis } from "../../redis.config";
import mongoose from "mongoose";
import dotenv from "dotenv";
import Grid from "gridfs-stream";
import { Db, GridFSBucket, ObjectId } from "mongodb";
import mongodb from "mongodb";

dotenv.config();

// Initialize Redis client
const client = createClient();
client.on("error", (err) => console.log("Redis Client Error", err));

mongoose.connect(process.env.MONGODB_URI!);

let gfsBucket: GridFSBucket;
let gfsInitialized: Promise<void> = new Promise((resolve, reject) => {
  mongoose.connection.once("open", () => {
    console.log("Connected to MongoDB");
    gfsBucket = new GridFSBucket(mongoose.connection.db as Db, {
      bucketName: "articles",
    });
    console.log("GridFS initialized");
    resolve(); // Resolve the promise once GridFS is initialized
  });

  mongoose.connection.on("error", (err) => {
    console.error("MongoDB connection error:", err);
    reject(err); // Reject the promise if there's a connection error
  });
});

// background scraper function
const scrapArticle = async (url: string) => {
  try {
    await gfsInitialized;

    if (!gfs) {
      throw new Error("GridFS not initialized.");
    }

    const browser = await puppeteer.launch();

    const page = await browser.newPage();

    console.log("Scraping article:", `${process.env.FCC_BASE_LINK}${url}`);

    await page.goto(`${process.env.FCC_BASE_LINK}${url}`, {
      waitUntil: "domcontentloaded",
      timeout: 30000, // Timeout after 30 seconds
    });

    const content = await page.content();

    const $ = cheerio.load(content);

    const articleTitle = $("h1.post-full-title").text().trim();
    const articleContent = $("section.post-content").text().trim();
    const articleAuthor = $("span.author-card-name").text();
    const articleFeatureImage = $('img[data-test-label="feature-image"]').attr(
      "src"
    );
    const articlePublishedDate = $("time.post-full-meta-date").text().trim();

    const writeStream = gfs.createWriteStream({
      filename: `${articleTitle}-content.txt`,
      content_type: "text/plain",
    });

    console.log("Writing article content to GridFS...");
    console.log("Article content:", articleContent.substring(0, 200));

    writeStream.write(articleContent);

    await new Promise((resolve, reject) => {
      writeStream.on("finish", resolve);
      writeStream.on("error", reject);
      writeStream.end();
    });

    const article = {
      contentFileId: writeStream.id,
      author: articleAuthor,
      title: articleTitle,
      image: articleFeatureImage,
      published: articlePublishedDate,
    };

    console.log("Article scraped successfully:", article);
    return article;
  } catch (error) {
    console.error("Error scraping article:", error);
    return null;
  }
};

// process the article queue
// const processArticleQueue = async () => {
//   try {
//     await client.connect();
//     const numWorkers = 5; // Number of parallel workers

//     console.log(`Starting ${numWorkers} parallel workers...`);

//     const worker = async () => {
//       while (true) {
//         const result = await client.sPop("articleQueueSet");
//         const url = Array.isArray(result) ? result[0] : result; // Ensure it's a string

//         if (!url) {
//           console.log("No more articles to process.");
//           await new Promise((resolve) => setTimeout(resolve, 5000)); // Wait for new items in queue
//           continue;
//         }

//         console.log("Scraping article:", url);
//         const article = await scrapArticle(url, gfs);
//         // save the content of article to the database

//         if (!article) {
//           console.log("Error scraping article:", url);
//           await client.sAdd("articleQueueSet", url);
//           continue;
//         }

//         await Article.updateOne(
//           { url },
//           {
//             $set: {
//               title: article.title,
//               contentFileId: article.contentFileId,
//               author: article.author,
//               image: article.image,
//               published: article.published,
//             },
//           }
//         );
//       }
//     };

//     const workers = Array.from({ length: numWorkers }).map(() => worker());
//     await Promise.all(workers); // to run all 5 workers in parallel
//   } catch (error) {
//     console.error("Error processing article queue:", error);
//   } finally {
//     await client.disconnect();
//   }
// };

// export const fetchArticleUrls = async () => {
//   try {
//     console.log("Connecting to MongoDB...");
//     console.log(process.env.MONGODB_URI);
//     await mongoose.connect(process.env.MONGODB_URI as string, {
//       serverSelectionTimeoutMS: 30000, // 30 seconds
//     });

//     console.log("Connected to MongoDB");

//     const articles = await Article.find();

//     const articleUrls = articles.map((article) => article.url);

//     if (articleUrls.length > 0) {
//       articleUrls.forEach(async (url) => {
//         await connectAndPushToRedis(url);
//       });

//       console.log(
//         `Successfully pushed ${articleUrls.length} URLs to the Redis queue.`
//       );
//     } else {
//       console.log("No articles found in the database.");
//     }
//   } catch (error) {
//     console.log("Error fetching article URLs:", error);
//   } finally {
//     await mongoose.disconnect();
//     // await client.disconnect();
//   }
// };

// Start the worker
// processArticleQueue();
// fetchArticleUrls();

// Ensure you connect to MongoDB before processing the article queue

scrapArticle(
  "/news/api-testing-with-postman-a-step-by-step-guide-using-the-spotify-api"
);
