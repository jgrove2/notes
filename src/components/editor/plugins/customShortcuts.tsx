import { createPlatePlugin, Key } from "platejs/react";
import { useEditorState } from "~/util/editor/editorState";

export const CustomShortcutsPlugin = createPlatePlugin({
  key: "customShortcuts",
}).extend({
  shortcuts: {
    logEditorState: {
      keys: [[Key.Alt, "s"]], // e.g., Cmd/Ctrl + Alt + S
      handler: ({ editor, event, eventDetails }) => {
        // 'editor' is the PlateEditor instance
        // 'event' is the raw KeyboardEvent
        // 'eventDetails' provides more context from the hotkey library
        console.info("Current editor value:", editor.children);
        console.info("Pressed keys:", eventDetails.keys);

        // Log editor selection and other safe properties
        console.info("Editor selection:", editor.selection);
        console.info("Editor operations count:", editor.operations.length);

        // Safe way to get HTML using the global state (if needed)
        const { getHtmlText } = useEditorState.getState();
        getHtmlText()
          .then((html) => {
            console.info("Editor as HTML:", html);
          })
          .catch((error) => {
            console.error("Error getting HTML:", error);
          });
      },
    },
  },
});
