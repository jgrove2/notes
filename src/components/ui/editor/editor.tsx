import React, { useRef, useCallback, useEffect, useState } from "react";
import { useEditorState } from "~/util/editor/editorState";
import { useFileSystemState } from "~/util/fileSystem/useFileSystem";
import { Editable, useEditor } from "@wysimark/react";
import { useComputedTheme } from "~/util/theme/useTheme";

interface EditorProps {
  className?: string;
}

type EditorModes = "view" | "edit";

export const Editor: React.FC<EditorProps> = ({ className = "" }) => {
  const [currentEdit, setCurrentEdit] = useState<string>("");
  const theme = useComputedTheme();

  const { editor } = useEditorState();

  const { files, currentFile } = useFileSystemState();

  // Load file content when currentFile changes
  useEffect(() => {
    if (currentFile && files[currentFile]?.content) {
      const content = files[currentFile].content;
      setCurrentEdit(content);
    }
  }, [currentFile, files]);

  function handleInput(e: string) {
    // Get the text content (not innerHTML) to avoid HTML issues
    const newMarkdown = e || "";
    setCurrentEdit(newMarkdown);
  }

  return (
    <div className={`editor`}>
      {currentEdit ? (
        <Editable
          editor={editor}
          value={currentEdit}
          onChange={handleInput}
          style={{
            color: theme === "dark" ? "#ffffff" : "#000000",
            backgroundColor: theme === "dark" ? "#1e1e1e" : "#ffffff",
            fontFamily: 'Monaco, Menlo, "Ubuntu Mono", monospace',
            fontSize: "14px",
            lineHeight: "1.6",
            padding: "20px",
            border: "none",
            outline: "none",
            width: "100%",
            height: "100%",
            resize: "none",
          }}
        />
      ) : (
        <h4>No file selected</h4>
      )}
    </div>
  );
};
