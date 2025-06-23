import { createFileRoute } from '@tanstack/react-router'
import { format } from 'path';
import { useEffect } from 'react';
import Editor from '~/components/ui/editor/editor';
import { useEditorState } from '~/util/editor/editorState';
export const Route = createFileRoute('/')({
  component: Home,
})

function Home() {
  const { setMarkdownText, formatMarkdownToHtml, setHtmlText } = useEditorState();
  useEffect(() => {
const sampleMarkdown = `# My Markdown Document

This is a **bold** paragraph with *italic* text and \`inline code\`.

## Section 2

Here's a list:
- First item
- Second item with **bold** text
- Third item

### Subsection

> This is a blockquote with some important information.

Some more text with [a link](https://example.com) and more content.

#### Code Example

\`\`\`javascript
const hello = "world";
console.log(hello);
\`\`\`

1. Numbered list item
2. Another numbered item
3. Final item`;
    setMarkdownText(sampleMarkdown);
    formatMarkdownToHtml(sampleMarkdown).then((html) => {
      setHtmlText(html);
    });
  }, [])
  

  return (
    <div className="w-full min-h-screen flex">
      <Editor />
    </div>
  )
}
