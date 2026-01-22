import fs from "fs";
import path from "path";

export async function getMarkdownContent(fileName: string): Promise<string> {
  try {
    const filePath = path.join(process.cwd(), "content", fileName);
    const content = fs.readFileSync(filePath, "utf8");
    return content;
  } catch (error) {
    console.error(`Error reading Markdown file ${fileName}:`, error);
    return "";
  }
}

export const extractTitle = (content:string) => {
  const match = content?.match(/^#+\s*(.*?)(?=\r?\n|$)/);
  const firstHeading = match ? match[1] : null;
  return firstHeading;
};
