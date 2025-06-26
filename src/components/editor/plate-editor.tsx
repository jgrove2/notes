"use client";

import React, { useEffect } from "react";

import { Plate, usePlateEditor } from "platejs/react";

import { EditorKit } from "~/components/editor/editor-kit";
import { SettingsDialog } from "~/components/editor/settings-dialog";
import { Editor, EditorContainer } from "~/components/ui/editor";
import { useFileSystemState } from "~/util/fileSystem/useFileSystem";
import { useDebounce } from "~/hooks/use-debounce";
import remarkMath from "remark-math";
import remarkEmoji from "remark-emoji";
import remarkGfm from "remark-gfm";
import { MarkdownPlugin, remarkMdx, remarkMention } from "@platejs/markdown";
import { useEditorState } from "~/util/editor/editorState";

export function PlateEditor() {
  const [markdownValue, setMarkdownValue] = React.useState("# Plate Editor");
  const [loadingMarkdown, setLoadingMarkdown] = React.useState(false);
  const debouncedMarkdownValue = useDebounce(markdownValue, 10);
  const { files, currentFile, isLoading } = useFileSystemState();
  const { setMarkdownText } = useEditorState();

  // Load file content when currentFile changes
  useEffect(() => {
    if (currentFile && files[currentFile]?.content) {
      const content = files[currentFile].content;
      setLoadingMarkdown(true);
      setMarkdownValue(content);
      editor.tf.reset();
      editor.tf.setValue(
        editor.api.markdown.deserialize(debouncedMarkdownValue, {
          remarkPlugins: [
            remarkMath,
            remarkGfm,
            remarkMdx,
            remarkMention,
            remarkEmoji as any,
          ],
        })
      );
      setLoadingMarkdown(false);
    }
  }, [currentFile, files]);

  const editor = usePlateEditor({
    plugins: EditorKit,
    value: (editor) =>
      editor.getApi(MarkdownPlugin).markdown.deserialize(markdownValue, {
        remarkPlugins: [
          remarkMath,
          remarkGfm,
          remarkMdx,
          remarkMention,
          remarkEmoji as any,
        ],
      }),
    });

    useEffect(() => {
      const serializedMarkdown = editor.getApi(MarkdownPlugin).markdown.serialize();
      setMarkdownText(serializedMarkdown);
    }, [editor.tf.value, setMarkdownText])
  return (
        <Plate editor={editor}>
          <EditorContainer>
            <Editor variant="demo" style={{ height: "calc(100% - 6rem)" }} />
          </EditorContainer>

          <SettingsDialog />
        </Plate>
  );
}
