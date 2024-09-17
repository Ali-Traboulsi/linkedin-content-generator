export const cleanArticleContent = (rawContent: string) => {
  // Remove unwanted HTML tags and excessive whitespace
  let cleanedContent = rawContent
    .replace(/\s*\n\s*/g, "\n") // Remove newlines and excessive whitespace
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "") // Remove script tags
    .replace(/<\/?[^>]+>/gi, "") // Remove all HTML tags
    .replace(/(\r\n|\n|\r)/gm, "\n") // Normalize line breaks
    .trim(); // Trim leading and trailing whitespace

  // Further processing can be done here if needed
  return cleanedContent;
};
