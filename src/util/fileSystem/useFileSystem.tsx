import { create } from "zustand";
import { fetchFileStructure, fetchNote, saveNote, createNote } from "~/lib/api";
import { useEditorState } from "~/util/editor/editorState";

interface NoteItem {
  name: string;
  content?: string;
}

interface useFileSystemState {
  files: Record<string, NoteItem>;
  currentFile: string;
  isLoading: boolean;
  error: string | null;
  lastSaved: Date | null;
  setFiles: (files: Record<string, NoteItem>) => void;
  setCurrentFile: (filePath: string) => void;
  loadFileStructure: (token: string) => Promise<void>;
  loadFileContent: (fileName: string, token: string) => Promise<string>;
  saveFile: (fileName: string, content: string, token: string) => Promise<void>;
  createNewFile: (
    fileName: string,
    content?: string,
    token?: string
  ) => Promise<void>;
}

export const useFileSystemState = create<useFileSystemState>((set, get) => ({
  files: {},
  currentFile: "",
  isLoading: false,
  error: null,
  lastSaved: null,
  setFiles: (files) => set({ files }),
  setCurrentFile: (filePath) => set({ currentFile: filePath }),

  loadFileStructure: async (token: string) => {
    try {
      set({ isLoading: true, error: null });

      const response = await fetchFileStructure(token);

      // Convert the file structure to our internal format
      const files: Record<string, NoteItem> = {};
      Object.keys(response.fileStructure).forEach((filename) => {
        files[filename] = {
          name: filename,
        };
      });

      set({
        files,
        isLoading: false,
        error: null,
      });
    } catch (error) {
      console.error("Error loading file structure:", error);
      set({
        isLoading: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to load file structure",
      });
    }
  },

  loadFileContent: async (fileName: string, token: string): Promise<string> => {
    try {
      console.log("loadFileContent called with:", {
        fileName,
        token: token ? "present" : "missing",
      });
      set({ isLoading: true, error: null });

      const content = await fetchNote(fileName, token);
      console.log("Loaded HTML content:", content);

      // Store the HTML content in the files state
      set((state) => ({
        files: {
          ...state.files,
          [fileName]: {
            name: fileName,
            content,
          },
        },
        currentFile: fileName,
        isLoading: false,
      }));

      return content;
    } catch (error) {
      console.error("Error loading file:", error);
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : "Failed to load file",
      });
      return "";
    }
  },

  saveFile: async (fileName: string, content: string, token: string) => {
    try {
      console.log("saveFile called with:", {
        fileName,
        content,
        token: token ? "present" : "missing",
      });
      set({ isLoading: true, error: null });

      await saveNote(fileName, content, token);
      console.log("saveNote completed successfully");

      // Update the last saved timestamp without reloading the content
      set({
        lastSaved: new Date(),
        isLoading: false,
      });
      console.log("File system state updated");
    } catch (error) {
      console.error("Error saving file:", error);
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : "Failed to save file",
      });
    }
  },

  createNewFile: async (
    fileName: string,
    content: string = "<h1>New Document</h1><p>Start writing...</p>",
    token?: string
  ) => {
    try {
      set({ isLoading: true, error: null });

      if (!token) {
        throw new Error("No access token available");
      }

      await createNote(fileName, content, token);

      // Add to files state
      set((state) => ({
        files: {
          ...state.files,
          [fileName]: {
            name: fileName,
            content,
          },
        },
        currentFile: fileName,
        isLoading: false,
      }));
    } catch (error) {
      console.error("Error creating file:", error);
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : "Failed to create file",
      });
    }
  },
}));
