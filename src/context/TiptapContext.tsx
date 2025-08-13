"use client";
import { EditorContext, useEditor } from "@tiptap/react";
import { useMemo } from "react";
import { Extensions } from "~/components/editor/extensions/extensions";
import { ImageUploadNode } from "~/components/tiptap-node/image-upload-node";
import { useUploadThing } from "~/util/uploadthing";

export default function TiptapContext({
  children,
}: {
  children: React.ReactNode;
}) {
  const { startUpload } = useUploadThing("imageUploader");
  const editor = useEditor({
    // Extensions
    extensions: [
      ...Extensions,
      ImageUploadNode.configure({
        accept: "image/*",
        maxSize: import.meta.env.VITE_MAX_IMAGE_SIZE,
        limit: 3,
        onError: (error) => console.error("Upload failed:", error),
        upload: async (file: File) => {
          const res = await startUpload([file]);
          if (!res || res.length === 0) {
            throw new Error("No file uploaded");
          }
          return res[0].ufsUrl;
        },
      }),
    ],
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
