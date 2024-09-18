import axios from "axios";
import * as cheerio from "cheerio";
// import Article from "../models/article";
import * as puppeteer from "puppeteer";
import * as fs from "fs";
import { cleanArticleContent } from "../../utils/article-cleaner";

export const scrapMainArticlesFromFcc = async () => {
  try {
    const browser = await puppeteer.launch();
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
      excerpt?: string;
      imageUrl?: string;
    }> = [];

    $(".post-card").each((i, element) => {
      const title = $(element).find(".post-card-title").text().trim();
      const link = $(element).find("a").attr("href");
      const excerpt = $(element).find(".post-card-description").text().trim();
      const imageUrl = $(element).find("img").attr("src");
      // Store each article in an object
      const articleData = {
        title,
        link,
        excerpt,
        imageUrl,
      };

      // Push the article data to the array
      articles.push(articleData);

      console.log(`Featured Article ${i + 1}:`);
      console.log(`Title: ${title}`);
      console.log(`Link: ${link}`);
      console.log(`Excerpt: ${excerpt}`);
      console.log(`Image URL: ${imageUrl}`);
    });

    // Write all article data to a file
    const fileContent = articles
      .map(
        (article) => `
          Title: ${article.title}
          Link: ${article.link}
          Excerpt: ${article.excerpt}
          Image URL: ${article.imageUrl}
        `
      )
      .join("\n\n");

    fs.writeFileSync(
      "freecodecamp_articles.json",
      JSON.stringify(articles, null, 2),
      "utf-8"
    );

    await browser.close();

    // console.log("Scraping TechCrunch", $);

    // // Select the div with the class 'is-featured'
    // const featured = $("div.is-featured");

    // // Extract the article title (h2) inside the featured div
    // const title = featured.find("h2 a").text().trim();

    // // Extract the article link from the anchor (a) tag inside the h2
    // const link = featured.find("h2 a").attr("href");

    // // Extract the article description (excerpt)
    // const excerpt = featured.find(".wp-block-post-excerpt p").text().trim();

    // // Extract the image URL from the figure
    // const imageUrl = featured.find("figure img").attr("src");

    // // Extract the author's name and link
    // const author = featured
    //   .find(".wp-block-tc23-author-card-name a")
    //   .text()
    //   .trim();
    // const authorLink = featured
    //   .find(".wp-block-tc23-author-card-name a")
    //   .attr("href");

    // // Extract the time of publication
    // const timeAgo = featured.find("time").text().trim();

    // console.log("Featured article:");
    // console.log(`Title: ${title}`);
    // console.log(`Link: ${link}`);
    // console.log(`Excerpt: ${excerpt}`);
    // console.log(`Image URL: ${imageUrl}`);
    // console.log(`Author: ${author}`);
    // console.log(`Author Link: ${authorLink}`);
    // console.log(`Published: ${timeAgo}`);

    // Close the browser
    // await browser.close();
  } catch (error) {
    console.error("Error scraping TechCrunch:", error);
  }
};

export const scrapRandomArticleFromFCC = async () => {
  try {
    const articles = JSON.parse(
      fs.readFileSync("freecodecamp_articles.json", "utf-8")
    );

    const baseLink = "https://www.freecodecamp.org";

    // Step 2: Randomly select an article
    const randomIndex = Math.floor(Math.random() * articles.length);
    const selectedArticle = articles[randomIndex];

    console.log(`Randomly selected article: ${selectedArticle.title}`);

    // Step 3: Launch Puppeteer and navigate to the selected article URL
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto(`${baseLink}${selectedArticle.link}`, {
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

    await browser.close();
  } catch (error) {
    console.error("Error scraping random article:", error);
  }
};

// export const scrapTechNews = async () => {
//   try {
//     const { data: markup } = await axios.get("https://techcrunch.com/");
//     const $ = cheerio.load(markup);
//     console.log("Scraping TechCrunch");
//     // console.log($);

//     $("article a").each((i, element) => {
//       const title = $(element).text().trim();
//       console.log(`Article ${i + 1}: ${title}`);
//     });

//     const featured = $("div.is-featured");

//     console.log("Featured article: ", featured);

//     // Extract the article title (h2) inside the featured div
//     const title = featured.find("h2 a").text().trim();

//     // Extract the article description (excerpt)
//     const excerpt = featured.find(".wp-block-post-excerpt p").text().trim();

//     // Extract the image URL from the figure
//     const imageUrl = featured.find("figure img").attr("src");

//     // Extract the article link from the anchor (a) tag inside the h2
//     const link = featured.find("h2 a").attr("href");

//     // Extract the author's name and link
//     const author = featured
//       .find(".wp-block-tc23-author-card-name a")
//       .text()
//       .trim();
//     const authorLink = featured
//       .find(".wp-block-tc23-author-card-name a")
//       .attr("href");

//     // Extract the time of publication
//     const timeAgo = featured.find("time").text().trim();

//     console.log("Featured article:");
//     console.log(`Title: ${title}`);
//     console.log(`Link: ${link}`);
//     console.log(`Excerpt: ${excerpt}`);
//     console.log(`Image URL: ${imageUrl}`);
//     console.log(`Author: ${author}`);
//     console.log(`Author Link: ${authorLink}`);
//     console.log(`Published: ${timeAgo}`);

//     console.log("Featured article: ", featured.text());
//   } catch (error) {
//     console.error("Error scraping TechCrunch:", error);
//   }
// };
