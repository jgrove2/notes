import { create } from "zustand";
import { createSlateEditor, serializeHtml } from "platejs";
import { BaseEditorKit } from "~/components/editor/editor-base-kit";
import { EditorStatic } from "~/components/ui/editor-static";

interface EditorState {
  editor: any | null;
  getHtmlText: () => Promise<string>;
  setEditor: (editor: any) => void;
  loadHtmlToEditor: (html: string) => void;
}

export const useEditorState = create<EditorState>((set, get) => ({
  editor: null,
  setEditor: (editor: any) => {
    set({ editor: editor });
  },
  getHtmlText: async () => {
    const { editor } = get();
    if (!editor) return "";
    try {
      const editorStatic = createSlateEditor({
        plugins: BaseEditorKit,
        value: editor.children,
      });
      const html = await serializeHtml(editorStatic, {
        editorComponent: EditorStatic,
      });
      return html;
    } catch (error) {
      console.error("Error serializing HTML:", error);
      return "";
    }
  },
  loadHtmlToEditor: (html: string) => {
    const { editor } = get();
    if (!editor) {
      return;
    }
    try {
      console.log("html", html);
      const slateValue = editor.api.html.deserialize(html);
      editor.tf.setValue(slateValue as any);
      console.log("slateValue", slateValue);
    } catch (error) {
      console.error("Error loading HTML to editor:", error);
      throw error;
    }
  },
}));
