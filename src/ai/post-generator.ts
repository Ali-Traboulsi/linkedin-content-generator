import { OpenAI } from "openai";
import * as fs from "fs";
import * as dotenv from "dotenv";
import { exit } from "process";
import cohere, { CohereClient } from "cohere-ai";
import { Request, Response } from "express";
import path from "path";
import { generateSmartCarouselFromContent } from "../helpers/generate-pdf.helper";
import { uploadMediaToLinekedin } from "../helpers/upload-media-to-linkedin";
import axios from "axios";
dotenv.config({
  path: "../../.env",
});

const co = new CohereClient({
  token: process.env.COHERE_API_KEY,
});

const filePath = path.join(
  __dirname,
  "..",
  "tech-scraping",
  "freecodecamp_random_article.json"
);
const article = fs.readFileSync(filePath, "utf-8");

export const generateLinkedinContent = async (req: Request, res: Response) => {
  try {
    const generatedContent = await co.generate({
      prompt: `write a cool,concise, and well-formatted Linkedin Post based on the following ARTICLE ${article}. Note: the generated content should be based on the article content and should always contain LISTINGS and EMOJIES. Include headings, subheadings, bullet points, and numbered lists where necessary`,
    });

    console.log(JSON.stringify(generatedContent, null, 2));

    const contentText = generatedContent.generations[0].text;

    fs.writeFileSync(
      "generated_linkedin_content_cohere.md",
      contentText,
      "utf-8"
    );

    // create pdf from content
    const pdfFilePath = path.join(__dirname, "generated_linkedin_content.pdf");
    await generateSmartCarouselFromContent(contentText, pdfFilePath);

    const pdfBuffer = fs.readFileSync(pdfFilePath);
    const pdfFile = {
      buffer: pdfBuffer,
      mimetype: "application/pdf",
      originalname: "generated_linkedin_content_smart.pdf",
    } as Express.Multer.File;

    // upload the file to linekedin
    const uploadResponse = await uploadMediaToLinekedin({
      file: pdfFile,
      ownerURN: req.body.authorURN,
    });

    if (!uploadResponse) {
      return res
        .status(500)
        .json({ message: "Error uploading PDF to LinkedIn" });
    }

    const postBody = {
      author: `urn:li:person:${req.body.authorURN}`, // This is where you use the LinkedIn member URN
      lifecycleState: req.body.lifecycleState || "PUBLISHED",
      specificContent: {
        "com.linkedin.ugc.ShareContent": {
          shareCommentary: { text: contentText },
          shareMediaCategory: "CAROUSEL",
          media: [
            {
              status: "READY",
              description: { text: "Generated content in PDF format" },
              media: uploadResponse.data.value.asset,
              title: { text: "PDF Carousel Item" },
            },
          ],
        },
      },
      visibility: {
        "com.linkedin.ugc.MemberNetworkVisibility":
          req.body.visibility || "PUBLIC",
      },
    };

    const response = await axios.post(
      `${process.env.LINKEDIN_BASE_URL}/ugcPosts`,
      postBody,
      {
        headers: {
          Authorization: `Bearer ${process.env.LINKEDIN_ACCESS_TOKEN}`,
          "Content-Type": "application/json",
          "X-Restli-Protocol-Version": "2.0.0",
        },
      }
    );

    res
      .status(200)
      .json({ message: "Post created with carousel", data: response.data });
  } catch (error) {
    console.error("Error generating content:", error);
    res.status(500).json({ message: "Error generating content" });
  }
};

// const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// const generateContent = async (text: string) => {
//   try {
//     let generateContentFull = "";
//     const chunksize = 50;

//     for (let i = 0; i < text.length; i += chunksize) {
//       const chunk = text.slice(i, i + 100);

//       let retry = 0;
//       let success = false;

//       while (!success && retry < 5) {
//         try {
//           const response = await openai.completions.create({
//             model: "davinci-002",
//             prompt: `write a cool and concise Linkedin Post with emojies based on the following ${chunk}`,
//             max_tokens: 100,
//             temperature: 0.7,
//           });
//           const generatedContent = response.choices[0].text.trim();
//           generateContentFull += generatedContent + " ";
//           success = true;
//           break;
//         } catch (error: any) {
//           if (
//             error.code === "insufficient_quota" ||
//             error.code === "rate_limit"
//           ) {
//             retry++;
//             const backoff = Math.pow(2, retry) * 1000; // Exponential backoff
//             console.log(
//               `Rate limit hit, retrying after ${backoff / 1000} seconds...`
//             );
//             await delay(backoff);
//           } else {
//             throw error; // For other errors, rethrow
//           }
//         }
//       }
//     }

//     console.log("Generated content:", generateContentFull);
//     return generateContentFull;
//   } catch (error) {
//     console.error("Error generating content:", error);
//   }
// };

// generateContent(article);
