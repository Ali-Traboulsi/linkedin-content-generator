import { Router } from "express";
import { decodeToken, createLinkedinPost } from "./linkedin";

const router = Router();

router.get("/", (_, res) => {
  res.send("Hello World");
});
router.post("/post", createLinkedinPost);
router.get("/decoded-token", decodeToken);

export default router;
