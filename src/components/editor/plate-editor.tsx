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
import { useKindeAuth } from "@kinde-oss/kinde-auth-react";

export function PlateEditor() {
  const [editorValue, setEditorValue] = React.useState<any>({});
  const [loadingContent, setLoadingContent] = React.useState(false);
  const { files, currentFile, isLoading, saveFile, lastSaved } =
    useFileSystemState();
  const { setMarkdownText } = useEditorState();
  const { getToken } = useKindeAuth();

  const editor = usePlateEditor({
    plugins: EditorKit,
    value: (editor) =>
      editor
        .getApi(MarkdownPlugin)
        .markdown.deserialize(
          typeof editorValue === "string"
            ? editorValue
            : JSON.stringify(editorValue, null, 2),
          {
            remarkPlugins: [
              remarkMath,
              remarkGfm,
              remarkMdx,
              remarkMention,
              remarkEmoji as any,
            ],
          }
        ),
  });

  // Load file content when currentFile changes
  useEffect(() => {
    if (currentFile && files[currentFile]?.content) {
      const content = files[currentFile].content;
      setLoadingContent(true);
      setEditorValue(content);
      editor.tf.reset();
      editor.tf.setValue(
        editor
          .getApi(MarkdownPlugin)
          .markdown.deserialize(
            typeof content === "string"
              ? content
              : JSON.stringify(content, null, 2),
            {
              remarkPlugins: [
                remarkMath,
                remarkGfm,
                remarkMdx,
                remarkMention,
                remarkEmoji as any,
              ],
            }
          )
      );
      setLoadingContent(false);
    }
  }, [currentFile, files, editor]);

  // Handle Ctrl+S keyboard shortcut
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key === "s") {
        event.preventDefault();
        handleSave();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleSave = async () => {
    if (!currentFile) return;

    try {
      const token = await getToken();
      if (token) {
        const serializedContent = editor
          .getApi(MarkdownPlugin)
          .markdown.serialize();
        const contentToSave = {
          content: serializedContent,
          lastModified: new Date().toISOString(),
        };
        await saveFile(currentFile, contentToSave, token);
        console.log("Saved:", currentFile);
      }
    } catch (error) {
      console.error("Error saving:", error);
    }
  };

  // Update editor value when content changes
  useEffect(() => {
    const serializedMarkdown = editor
      .getApi(MarkdownPlugin)
      .markdown.serialize();
    setMarkdownText(serializedMarkdown);
    setEditorValue(serializedMarkdown);
  }, [editor.tf.value, setMarkdownText]);

  return (
    <div className="relative">
      <Plate editor={editor}>
        <EditorContainer>
          <Editor variant="demo" style={{ height: "calc(100% - 6rem)" }} />
        </EditorContainer>
      </Plate>

      {/* Save indicator */}
      {currentFile && (
        <div className="absolute bottom-4 right-4 text-xs text-muted-foreground">
          {lastSaved ? (
            <span>Last saved: {lastSaved.toLocaleTimeString()}</span>
          ) : (
            <span>Not saved yet</span>
          )}
        </div>
      )}
    </div>
  );
}
