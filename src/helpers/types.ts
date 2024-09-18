export type Section =
  | { type: "heading"; text: string }
  | { type: "subheading"; text: string }
  | { type: "paragraph"; text: string }
  | { type: "list"; items: string[] };

// Example of initializing currentSection
let currentSection: Section | null = null;

export type PDFContent =
  | { text: string; style: string }
  | { ul: { text: string; style: string }[] };
