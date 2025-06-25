import { marked } from "marked";

export async function formatMarkdownToHtml(markdown: string): Promise<string> {
  return await marked.use({breaks: true}).parse(markdown);
}
