import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import routes from "./src/routes";
import { connectToDB } from "./src/db/db";
import multer from "multer";
import { createLinkedinPost } from "./src/linkedin/linkedin";

require("dotenv").config(); // Load the .env file

const upload = multer();

const app = express();

const port = process.env.PORT || 5000;

app.use(cors());
app.use(bodyParser.json());
app.post("/api/v1/create-post", upload.single("pdfFile"), createLinkedinPost);
app.use("/api/v1", routes);
app.listen(port, () => {
  connectToDB();
  console.log(`Server running on http://localhost:${port}`);
});
