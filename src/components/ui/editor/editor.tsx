import React, { useRef, useCallback, useEffect, useState, use } from "react";
import { useEditorState } from "~/util/editor/editorState";
import "~/styles/editor.css";

interface EditorProps {
  className?: string;
}

type EditorModes = "view" | "edit";

const Editor: React.FC<EditorProps> = ({ className = "" }) => {
  const editRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<HTMLDivElement>(null);
  const [editorMode, setEditorMode] = React.useState<EditorModes>("view");
  const [currentEdit, setCurrentEdit] = useState<string>("");
  const {
    markdownText,
    htmlText,
    formatMarkdownToHtml,
    setMarkdownText,
    setHtmlText,
  } = useEditorState();

  function handleBlur() {
    setEditorMode("view");
    formatMarkdownToHtml(markdownText).then((html) => {
      setHtmlText(html);
    });
  }

  function toggleToEditor() {
    setEditorMode("edit");
    setCurrentEdit(markdownText);
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLDivElement>) {
    if (e.key === "s" && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      setMarkdownText(currentEdit);
      formatMarkdownToHtml(currentEdit).then((html) => {
        setHtmlText(html);
      });
      handleBlur();
    }
  }

  function handleInput(e: React.FormEvent<HTMLDivElement>) {
    const target = e.target as HTMLDivElement;
    setCurrentEdit(target.innerText);
  }

  useEffect(() => {
    console.log(editorMode)
  }, [editorMode]);

  return (
    <div className="editor">
      <div
        ref={editRef}
        className={`editor-edit ${editorMode === "view" ? "editor-hide" : ""}`}
        contentEditable="true"
        suppressContentEditableWarning={true}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        onInput={handleInput}
      >
        {markdownText}
      </div>
      <div
        ref={viewRef}
        className={`editor-preview preview-theme ${editorMode === "edit" ? "editor-hide" : ""}`}
        onClick={toggleToEditor}
        dangerouslySetInnerHTML={{ __html: htmlText }}
      />
    </div>
  );
};

export default Editor;
