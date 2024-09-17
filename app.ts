import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import routes from "./src/routes";
import { connectToDB } from "./src/db/db";

require("dotenv").config(); // Load the .env file

const app = express();

const port = process.env.PORT || 5000;

app.use(cors());
app.use(bodyParser.json());
app.use("/api/v1", routes);
app.listen(port, () => {
  connectToDB();
  console.log(`Server running on http://localhost:${port}`);
});
