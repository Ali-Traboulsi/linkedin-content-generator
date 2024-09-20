import * as fs from "fs";
import pdfMakePrinter from "pdfmake";
import path from "path";
import {
  Content,
  ContextPageSize,
  Node,
  TDocumentDefinitions,
} from "pdfmake/interfaces";
import { PDFContent, Section } from "./types";
import * as puppeteer from "puppeteer";

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

// const createDocDefinintion = (content: string): TDocumentDefinitions => {
//   const structuredData = parseStructuredContent(content);

//   const docDefinition: {
//     content: PDFContent[];
//     styles: StyleDictionary;
//     footer?: DynamicContent | Content;
//     background?: DynamicBackground | Content;
//     pageBreakBefore?: (currentNode: Node) => boolean;
//   } = {
//     content: [],
//     styles: {
//       header: {
//         fontSize: 20,
//         bold: true,
//         color: "#000000",
//         margin: [0, 10, 0, 10],
//       },
//       subheader: {
//         fontSize: 16,
//         bold: true,
//         color: "#333333",
//         margin: [0, 8, 0, 8],
//       },
//       paragraph: { fontSize: 12, color: "#666666", margin: [0, 6, 0, 6] },
//       listItem: { fontSize: 12, margin: [0, 5, 0, 5], color: "#444444" },
//     },
//     footer: function (
//       currentPage: number,
//       pageCount: number,
//       pageSize: ContextPageSize
//     ): Content {
//       return {
//         text: `Page ${currentPage} of ${pageCount}`,
//         fontSize: 14,
//         margin: [0, 10, 0, 0],
//         alignment: "center",
//         bold: true,
//         color: "#666666",
//       };
//     },
//     background: function (
//       currentPage: number,
//       pageSize: ContextPageSize
//     ): Content | null | undefined {
//       return {
//         canvas: [
//           {
//             type: "rect",
//             x: 0,
//             y: 0,
//             w: pageSize.width,
//             h: pageSize.height,
//             color: "#F5F5F5",
//           }, // Light grey background
//         ],
//       };
//     },
//     pageBreakBefore: function (currentNode: Node) {
//       return currentNode.style === "listItem"; // This will add a page break before each list item
//     },
//   };

//   structuredData.forEach((section) => {
//     if (section.type === "heading") {
//       docDefinition.content.push({ text: section.text, style: "header" });
//     } else if (section.type === "subheading") {
//       docDefinition.content.push({ text: section.text, style: "subheader" });
//     } else if (section.type === "paragraph") {
//       docDefinition.content.push({ text: section.text, style: "paragraph" });
//     } else if (section.type === "list") {
//       section.items.forEach((item, itemIndex) => {
//         docDefinition.content.push({
//           text: item,
//           style: "listItem",
//         });
//       });
//     }
//   });

//   return docDefinition;
// };

// const createDocDefinintion = (content: string): TDocumentDefinitions => {
//   const structuredData = parseStructuredContent(content);

//   const docDefinition: TDocumentDefinitions = {
//     content: structuredData.map((section: Section) => {
//       switch (section.type) {
//         case "heading":
//           return { text: section.text, style: "header" };
//         case "subheading":
//           return { text: section.text, style: "subheader" };
//         case "paragraph":
//           return { text: section.text, style: "paragraph" };
//         case "list":
//           return {
//             ul: section.items.map((item) => ({
//               text: item,
//               style: "listItem",
//             })),
//             margin: [0, 5, 0, 15],
//           };
//       }
//     }),
//     styles: {
//       header: {
//         fontSize: 24,
//         bold: true,
//         color: "#1D3557",
//         margin: [0, 20, 0, 10],
//         alignment: "center",
//       },
//       subheader: {
//         fontSize: 18,
//         bold: true,
//         color: "#457B9D",
//         margin: [0, 10, 0, 5],
//         alignment: "center",
//       },
//       paragraph: {
//         fontSize: 14,
//         color: "#333333",
//         margin: [0, 5, 0, 5],
//         alignment: "justify",
//       },
//       listItem: {
//         fontSize: 12,
//         margin: [0, 5, 0, 5],
//         color: "#444444",
//       },
//     },
//     footer: (currentPage: number, pageCount: number): Content => ({
//       text: `Page ${currentPage} of ${pageCount}`,
//       fontSize: 12,
//       margin: [0, 10, 0, 0],
//       alignment: "center",
//       color: "#666666",
//     }),
//     background: (currentPage: number, pageSize: ContextPageSize): Content => {
//       return {
//         canvas: [
//           {
//             type: "rect",
//             x: 0,
//             y: 0,
//             w: pageSize.width,
//             h: pageSize.height,
//             color: currentPage % 2 === 0 ? "#F0F8FF" : "#FAF3DD", // Alternating background colors
//           },
//         ],
//       };
//     },
//     pageBreakBefore: (currentNode: Node) => currentNode.style === "listItem",
//   };

//   return docDefinition;
// };

const createDocDefinintion = (content: string): TDocumentDefinitions => {
  const structuredData = parseStructuredContent(content);

  const docDefinition: TDocumentDefinitions = {
    content: structuredData.map((section: Section) => {
      switch (section.type) {
        case "heading":
          return {
            text: section.text,
            style: "mainTitle",
            margin: [0, 30, 0, 10], // Adjust for large spacing above and below
          };
        case "subheading":
          return {
            text: section.text,
            style: "sectionTitle",
            margin: [0, 20, 0, 10],
          };
        case "paragraph":
          return {
            text: section.text,
            style: "paragraph",
            margin: [0, 10, 0, 10], // Adjust for spacing between paragraphs
          };
        case "list":
          return {
            ul: section.items.map((item) => ({
              text: item,
              style: "listItem",
            })),
            margin: [0, 5, 0, 15],
          };
      }
    }),
    styles: {
      mainTitle: {
        fontSize: 26,
        bold: true,
        color: "#1D3557", // Dark blue similar to the PDF
        alignment: "center",
      },
      sectionTitle: {
        fontSize: 20,
        bold: true,
        color: "#457B9D", // Light blue for section headings
        alignment: "center",
      },
      paragraph: {
        fontSize: 14,
        color: "#333333",
        alignment: "justify",
      },
      listItem: {
        fontSize: 12,
        margin: [0, 5, 0, 5],
        color: "#444444",
      },
    },
    footer: (currentPage: number, pageCount: number): Content => ({
      text: `Page ${currentPage} of ${pageCount}`,
      fontSize: 12,
      margin: [0, 10, 0, 0],
      alignment: "center",
      color: "#666666",
    }),
    background: (currentPage: number, pageSize: ContextPageSize): Content => {
      return {
        canvas: [
          {
            type: "rect",
            x: 0,
            y: 0,
            w: pageSize.width,
            h: pageSize.height,
            color: currentPage % 2 === 0 ? "#F0F8FF" : "#FAF3DD", // Alternating background colors
          },
        ],
      };
    },
    pageBreakBefore: (currentNode: Node) => currentNode.style === "listItem",
  };

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

import { Shape, SlidesApi } from "asposeslidescloud";
import { Readable, Stream } from "stream";

const slidesApi = new SlidesApi(
  process.env.ASPOSE_API_CLIENT_ID!,
  process.env.ASPOSE_API_CLIENT_SECRET!
);

async function uploadPresentation(fileName: string) {
  try {
    const filePath = `../templates/${fileName}`;
    const fileData = fs.readFileSync(filePath);
    const readableFileData = new Readable();
    readableFileData.push(fileData);
    readableFileData.push(null); // Signifies the end of the stream
    await slidesApi.uploadFile(fileName, readableFileData);
    console.log("Presentation uploaded successfully.");
  } catch (error) {
    console.error("Error uploading presentation:", error);
  }
}

// uploadPresentation("../backend/src/helpers/Linkedin_content_template.pptx");

async function modifySlide(presentationName: string, slideIndex: number) {
  try {
    // Example: Add a new shape to the slide
    const mockName = "Linkedin_content_template.pptx";
    const mockLayoutAlias = "titleSlide";
    const mockPosition = 2;
    const mockFolder = "documents";
    const mockStorage = "localStorage";

    const result = await slidesApi.createSlide(
      mockName,
      mockLayoutAlias,
      mockPosition,
      mockFolder,
      mockStorage
    );
    console.log("Shape added to slide successfully.");
  } catch (error) {
    console.error("Error modifying slide:", error);
  }
}

const fileName = "Linkedin_content_template.pptx";
const slideIndex = 1; // First slide

// modifySlide(fileName, slideIndex);
