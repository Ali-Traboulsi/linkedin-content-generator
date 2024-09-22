import { Router } from "express";
import { decodeToken, createLinkedinPost } from "./linkedin/linkedin";
import {
  getScrapedArticlesFromDB,
  saveDataToMongoDB,
  scrapArticleByLink,
  scrapMainArticlesFromFcc,
  scrapRandomArticleFromFCC,
} from "./tech-scraping/scraper";
import {
  generateContentUsingGroq,
  generateLinkedinContent,
  generatePDFFromContent,
} from "./ai/post-generator";

const router = Router();
router.get("/", (_, res) => {
  res.send("Hello World");
});
router.post("/decode-token", decodeToken);

// TECH SCRAPING ROUTES FROM FREECODECAMP
router.get("/fcc/articles/main", scrapMainArticlesFromFcc);
router.get("/fcc/articles/random", scrapRandomArticleFromFCC);
router.get("/fcc/articles/by-link/:link", scrapArticleByLink);

router.post("/generate-content", generateContentUsingGroq);
router.post("/generate-pdf", generatePDFFromContent);
router.post("post-on-linkedin", createLinkedinPost);

router.post("/save-to-db", saveDataToMongoDB);
router.get("/articles", getScrapedArticlesFromDB);

export default router;
