"use client";

import { Editor } from "~/components/ui/editor";
import { useEditorState } from "~/util/editor/editorState";

export function PlateEditor() {
  const { editor } = useEditorState();
  if (!editor) return <div>Loading...</div>;

  return (
    <div className="relative">
      <Editor variant="demo" style={{ height: "calc(100% - 6rem)" }} />
    </div>
  );
}
