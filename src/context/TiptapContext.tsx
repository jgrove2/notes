"use client";
import { EditorContext, useEditor } from "@tiptap/react";
import { useMemo } from "react";
import { Extensions } from "~/components/editor/extensions/extensions";

export default function TiptapContext({
  children,
}: {
  children: React.ReactNode;
}) {
  const editor = useEditor({
    // Extensions
    extensions: Extensions,
    // Autofocus on mount
    autofocus: true,
    // Initial content
    content: "<p>Hello World!</p>",
  });

  const providerValue = useMemo(
    () => ({
      editor,
    }),
    [editor]
  );
  return (
    <EditorContext.Provider value={providerValue}>
      {children}
    </EditorContext.Provider>
  );
}
