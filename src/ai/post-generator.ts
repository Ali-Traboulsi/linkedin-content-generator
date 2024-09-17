import { OpenAI } from "openai";
import * as fs from "fs";
import * as dotenv from "dotenv";
import { exit } from "process";
import cohere, { CohereClient } from "cohere-ai";
dotenv.config({
  path: "../../.env",
});

// const openai = new OpenAI({
//   apiKey: process.env.OPENAI_API_KEY,
// });

const co = new CohereClient({
  token: process.env.COHERE_API_KEY,
});

const article = fs.readFileSync(
  "../tech-scraping/freecodecamp_random_article.json",
  "utf-8"
);

const generateLinkedinContent = async (article: string) => {
  const chunksize = 1000;
  let generatedContent: string = "";
  for (let i = 0; i < article.length; i += chunksize) {
    const generatedContentChunked = await co.generate({
      prompt: `write a cool and concise Linkedin Post with emojies based on the following article ${article.slice(
        i,
        i + chunksize
      )}`,
    });
    generatedContent += generatedContentChunked.generations[0].text;
  }

  console.log(JSON.stringify(generatedContent, null, 2));

  fs.writeFileSync(
    "generated_linkedin_content_cohere.md",
    generatedContent,
    "utf-8"
  );
};

generateLinkedinContent(article);

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
