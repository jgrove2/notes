import { create } from "zustand";
import { fetchFileStructure, fetchNote, saveNote, createNote } from "~/lib/api";
import { useKindeAuth } from "@kinde-oss/kinde-auth-react";

interface NoteItem {
  name: string;
  content?: any;
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
  loadFileContent: (fileName: string, token: string) => Promise<void>;
  saveFile: (fileName: string, content: any, token: string) => Promise<void>;
  createNewFile: (
    fileName: string,
    content?: any,
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

  loadFileContent: async (fileName: string, token: string) => {
    try {
      set({ isLoading: true, error: null });

      const content = await fetchNote(fileName, token);

      // Update the file with content
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
      console.error("Error loading file:", error);
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : "Failed to load file",
      });
    }
  },

  saveFile: async (fileName: string, content: any, token: string) => {
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
    content: any = {},
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
