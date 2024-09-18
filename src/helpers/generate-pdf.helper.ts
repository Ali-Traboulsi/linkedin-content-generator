import * as fs from "fs";
import pdfMakePrinter from "pdfmake";
import path from "path";
import {
  Content,
  ContentStack,
  ContentText,
  StyleDictionary,
  TDocumentDefinitions,
} from "pdfmake/interfaces";
import { PDFContent, Section } from "./types";

export const generateSmartCarouselFromContent = async (
  content: string,
  filePath: string
): Promise<void> => {
  return new Promise<void>((resolve, reject) => {
    try {
      const docDefinition = createDocDefinintion(content);
      const printer = new pdfMakePrinter({
        Roboto: {
          normal: path.resolve(__dirname, "fonts/Roboto-Regular.ttf"),
          bold: path.resolve(__dirname, "fonts/Roboto-Medium.ttf"),
        },
      });

      const pdfDoc = printer.createPdfKitDocument(docDefinition);
      const writeStream = fs.createWriteStream(filePath);

      pdfDoc.pipe(writeStream);
      pdfDoc.end();

      writeStream.on("finish", () => {
        console.log("PDF created successfully at:", filePath);
        resolve();
      });
    } catch (error) {
      console.error("Error generating PDF from content:", error);
      reject(error);
    }
  });
};

const createDocDefinintion = (content: string): TDocumentDefinitions => {
  const structuredData = parseStructuredContent(content);

  const docDefinition: {
    content: PDFContent[];
    styles: StyleDictionary;
  } = {
    content: [],
    styles: {
      header: { fontSize: 18, bold: true },
      subheader: { fontSize: 15, bold: true },
      paragraph: { fontSize: 12 },
      listItem: { fontSize: 12, margin: [0, 5, 0, 5] },
    },
  };

  structuredData.forEach((section) => {
    if (section.type === "heading") {
      docDefinition.content.push({ text: section.text, style: "header" });
    } else if (section.type === "subheading") {
      docDefinition.content.push({ text: section.text, style: "subheader" });
    } else if (section.type === "paragraph") {
      docDefinition.content.push({ text: section.text, style: "paragraph" });
    } else if (section.type === "list") {
      const listItems: Content[] = section.items.map((item: string) => ({
        text: item,
        style: "listItem",
      }));
      docDefinition.content.push({ ul: listItems } as {
        ul: {
          text: string;
          style: string;
        }[];
      }); // Properly adding the list as 'ul'
    }
  });

  return docDefinition;
};

const parseStructuredContent = (content: string) => {
  const structuredData: Section[] = [];
  const lines = content.split("\n");

  let currentSection: Section | null = null;

  lines.forEach((line) => {
    line = line.trim();
    if (line.startsWith("# ")) {
      structuredData.push({ type: "heading", text: line.replace("# ", "") });
      currentSection = null;
    } else if (line.startsWith("## ")) {
      structuredData.push({
        type: "subheading",
        text: line.replace("## ", ""),
      });
      currentSection = null;
    } else if (line.startsWith("- ")) {
      if (!currentSection || currentSection.type !== "list") {
        currentSection = { type: "list", items: [] };
        structuredData.push(currentSection);
      }
      currentSection.items.push(line.replace("- ", ""));
    } else if (line) {
      structuredData.push({ type: "paragraph", text: line });
      currentSection = null; // Reset section
    }
  });
  return structuredData;
};
