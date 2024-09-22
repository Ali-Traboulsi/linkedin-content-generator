import axios from "axios";
import * as cheerio from "cheerio";
// import Article from "../models/article";
import * as puppeteer from "puppeteer";
import * as fs from "fs";
import { cleanArticleContent } from "../../utils/article-cleaner";
import { Request, Response } from "express";
import { Article, IArticle } from "../db/models/article";
import dotenv from "dotenv";

dotenv.config();

export const scrapMainArticlesFromFcc = async (req: Request, res: Response) => {
  try {
    let browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();

    await page.goto("https://www.freecodecamp.org/news/", {
      waitUntil: "networkidle2",
    });

    // extract content from the paege
    const content = await page.content();

    // Write the content to a file called "techcrunch.html"
    fs.writeFileSync("freecodecamp.html", content, "utf-8");

    // load the content into cheerio for parsing
    const $ = cheerio.load(content);

    const articles: Array<{
      title?: string;
      link?: string;
      content?: string;
      imageUrl?: string;
      tags?: Array<string>;
    }> = [];

    $(".post-card").each((i, element) => {
      const title = $(element).find(".post-card-title").text().trim();
      let link = $(element).find("a").attr("href");
      const excerpt = $(element).find(".post-card-description").text().trim();
      let imageUrl = $(element).find("img").attr("src");
      const tags = $(element)
        .find(".post-card-tags a")
        .map((i, el) => $(el).text())
        .get();
      // Store each article in an object
      const articleData = {
        title,
        link,
        content,
        imageUrl,
        tags,
      };

      // Push the article data to the array
      articles.push(articleData);
    });

    // Write all article data to a file
    const fileContent = articles
      .map(
        (article) => `
          Title: ${article.title}
          Link: ${article.link}
          Content: ${article.content}
          Image URL: ${article.imageUrl}
          Tags: ${article.tags?.join(", ")}
        `
      )
      .join("\n\n");

    fs.writeFileSync(
      "freecodecamp_articles.json",
      JSON.stringify(articles, null, 2),
      "utf-8"
    );

    res
      .status(200)
      .send({ message: "Articles scraped successfully", data: articles });

    await browser.close();
  } catch (error) {
    console.error("Error scraping TechCrunch:", error);
    res.status(500).json({ message: "Error scraping FreeCodeCamp", error });
  } finally {
    res.end();
  }
};
export const scrapArticleByLink = async (req: Request, res: Response) => {
  const { link } = req.params;

  const browser = await puppeteer.launch();

  const page = await browser.newPage();

  await page.goto(`${process.env.FCC_BASE_LINK}${link}`, {
    waitUntil: "networkidle2",
  });

  const content = await page.content();

  const $ = cheerio.load(content);

  const articleContent = $(".post-content").text().trim();
  const articleAuthor = $(".author-card-name").text();
  const articleFeatureImage = $('[data-test-label="feature-image"');
  const articlePublishedDate = $(".post-full-meta-date").text().trim();

  const article = {
    content: cleanArticleContent(articleContent),
    author: articleAuthor,
    image: articleFeatureImage,
    date: articlePublishedDate,
  };

  return res.status(200).send({
    message: "Article scraped successfully",
    data: article,
  });
};

export const scrapRandomArticleFromFCC = async (
  req: Request,
  res: Response
) => {
  try {
    const articles = JSON.parse(
      fs.readFileSync("freecodecamp_articles.json", "utf-8")
    );

    // Step 2: Randomly select an article
    const randomIndex = Math.floor(Math.random() * articles.length);
    const selectedArticle = articles[randomIndex];

    console.log(`Randomly selected article: ${selectedArticle.title}`);

    // Step 3: Launch Puppeteer and navigate to the selected article URL
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto(`${process.env.FCC_BASE_LINK}${selectedArticle.link}`, {
      waitUntil: "networkidle2",
    });

    const content = await page.content();
    const $ = cheerio.load(content);

    console.log("Scraping article content...");

    const articleContent = $("article").text().trim();

    console.log("Article Content: ", articleContent);

    const articleTitle = $("article h1").text().trim();

    console.log("Article Title: ", articleTitle);

    const authorName = $("article .author-card-name").text().trim();
    console.log(`Author: ${authorName}`);

    const articleDate = $("article time").text().trim();

    console.log(`Published: ${articleDate}`);

    const article = {
      title: articleTitle,
      content: cleanArticleContent(articleContent),
      author: authorName,
      date: articleDate,
    };

    fs.writeFileSync(
      "freecodecamp_random_article.json",
      JSON.stringify(article, null, 2),
      "utf-8"
    );

    res
      .status(200)
      .send({ message: "Article scraped successfully", data: article });

    await browser.close();
  } catch (error) {
    console.error("Error scraping random article:", error);
    res.status(500).json({ message: "Error scraping random article", error });
  } finally {
    res.end();
  }
};

export const saveDataToMongoDB = async (req: Request, res: Response) => {
  try {
    const scrapedArticles = req.body.articles;

    console.log("Scraped articles:", scrapedArticles);

    const articlesToInsert = scrapedArticles.map((article: IArticle) => {
      return {
        title: article.title,
        content: article.content,
        image: article.image,
        url: article.url,
      };
    });

    console.log("Articles to insert:", articlesToInsert);

    await Article.insertMany(articlesToInsert);

    res
      .status(200)
      .send({ message: "Articles scraped and saved successfully." });
  } catch (error) {
    console.error("Error scraping articles:", error);
    res.status(500).json({ error: "Failed to scrape articles." });
  }
};

export const getScrapedArticlesFromDB = async (req: Request, res: Response) => {
  try {
    const articles = await Article.find();
    res
      .status(200)
      .send({ message: "Articles fetched successfully", data: articles });
  } catch (error) {
    console.error("Error fetching articles:", error);
    res.status(500).json({ message: "Error fetching articles", error });
  }
};

export const scrapArticleDetails = async (req: Request, res: Response) => {};
