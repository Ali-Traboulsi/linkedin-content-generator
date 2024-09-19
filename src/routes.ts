import { Router } from "express";
import { decodeToken, createLinkedinPost } from "./linkedin/linkedin";
import {
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
router.get("/fcc/articles/main", scrapMainArticlesFromFcc);
router.get("/fcc/articlee/random", scrapRandomArticleFromFCC);

router.post("/generate-content", generateContentUsingGroq);
router.post("/generate-pdf", generatePDFFromContent);
router.post("post-on-linkedin", createLinkedinPost);

export default router;
