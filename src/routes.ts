import { Router } from "express";
import { decodeToken, createLinkedinPost } from "./linkedin/linkedin";
import {
  scrapMainArticlesFromFcc,
  scrapRandomArticleFromFCC,
} from "./tech-scraping/scraper";
import { generateLinkedinContent } from "./ai/post-generator";

const router = Router();

router.get("/", (_, res) => {
  res.send("Hello World");
});
router.post("/decode-token", decodeToken);
router.get("/fcc/articles/main", scrapMainArticlesFromFcc);
router.get("/fcc/articlee/random", scrapRandomArticleFromFCC);

router.post("/generate-content", generateLinkedinContent);

export default router;
