const mongoose = require("mongoose");

// Define the schema for a tech article
const articleSchema = new mongoose.Schema({
  title: { type: String, required: true },
  url: { type: String, required: true },
  summary: String,
  created: { type: Date, default: Date.now },
  updated: { type: Date, default: Date.now },
});

const Article = mongoose.model("Article", articleSchema);
module.exports = Article;
