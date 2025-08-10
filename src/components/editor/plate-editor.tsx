"use client";

import { Loader2 } from "lucide-react";
import { Editor } from "~/components/ui/editor";
import { useEditorState } from "~/util/editor/editorState";

export function PlateEditor() {
  const { editor } = useEditorState();
  if (!editor)
    return (
      <div className="w-full h-full flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );

  return (
    <div className="relative">
      <Editor variant="demo" style={{ height: "calc(100% - 6rem)" }} />
    </div>
  );
}
