import { Model, Schema, Document, model } from "mongoose";

export interface IArticle extends Document {
  title: string;
  content: string;
  image: string;
  url: string;
  published: Date;
  created: Date;
  updated: Date;
}

// Define the schema for a tech article
const articleSchema: Schema<IArticle> = new Schema<IArticle>({
  title: { type: String, required: true },
  url: { type: String, required: true },
  content: {
    type: String,
    required: true,
  },
  image: { type: String, required: false },
  published: { type: Date, required: true },
  created: { type: Date, default: Date.now },
  updated: { type: Date, default: Date.now },
});

export const Article: Model<IArticle> = model<IArticle>(
  "Article",
  articleSchema
);
