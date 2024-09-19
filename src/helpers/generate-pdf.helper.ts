import * as fs from "fs";
import pdfMakePrinter from "pdfmake";
import path from "path";
import {
  Content,
  ContentStack,
  ContentText,
  ContextPageSize,
  DynamicBackground,
  DynamicContent,
  Node,
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
    footer?: DynamicContent | Content;
    background?: DynamicBackground | Content;
    pageBreakBefore?: (currentNode: Node) => boolean;
  } = {
    content: [],
    styles: {
      header: {
        fontSize: 20,
        bold: true,
        color: "#000000",
        margin: [0, 10, 0, 10],
      },
      subheader: {
        fontSize: 16,
        bold: true,
        color: "#333333",
        margin: [0, 8, 0, 8],
      },
      paragraph: { fontSize: 12, color: "#666666", margin: [0, 6, 0, 6] },
      listItem: { fontSize: 12, margin: [0, 5, 0, 5], color: "#444444" },
    },
    footer: function (
      currentPage: number,
      pageCount: number,
      pageSize: ContextPageSize
    ): Content {
      return {
        text: `Page ${currentPage} of ${pageCount}`,
        fontSize: 14,
        margin: [0, 10, 0, 0],
        alignment: "center",
        bold: true,
        color: "#666666",
      };
    },
    background: function (
      currentPage: number,
      pageSize: ContextPageSize
    ): Content | null | undefined {
      return {
        canvas: [
          {
            type: "rect",
            x: 0,
            y: 0,
            w: pageSize.width,
            h: pageSize.height,
            color: "#F5F5F5",
          }, // Light grey background
        ],
      };
    },
    pageBreakBefore: function (currentNode: Node) {
      return currentNode.style === "listItem"; // This will add a page break before each list item
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
      section.items.forEach((item, itemIndex) => {
        docDefinition.content.push({
          text: item,
          style: "listItem",
        });
      });
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
