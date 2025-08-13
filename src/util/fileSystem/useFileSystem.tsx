import { create } from "zustand";
import { fetchFileStructure, fetchNote, saveNote, createNote } from "~/lib/api";

interface NoteItem {
  name: string;
  content?: string;
}

// Recursive file structure type
export interface FileStructureNode {
  [name: string]: null | FileStructureNode;
}

interface useFileSystemState {
  files: Record<string, NoteItem>; // keyed by full path, e.g., "src/NotesApp"
  fileTree: FileStructureNode | {};
  currentFile: string;
  isLoading: boolean;
  isSaving: boolean;
  error: string | null;
  saveError: string | null;
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

function collectFiles(structure: FileStructureNode, prefix = ""): string[] {
  const result: string[] = [];
  for (const [entryName, node] of Object.entries(structure)) {
    const fullPath = prefix ? `${prefix}/${entryName}` : entryName;
    if (node === null) {
      result.push(fullPath);
    } else if (node && typeof node === "object") {
      result.push(...collectFiles(node, fullPath));
    }
  }
  return result;
}

export const useFileSystemState = create<useFileSystemState>((set, get) => ({
  files: {},
  fileTree: {},
  currentFile: "",
  isLoading: false,
  isSaving: false,
  error: null,
  saveError: null,
  lastSaved: null,
  setFiles: (files) => set({ files }),
  setCurrentFile: (filePath) => set({ currentFile: filePath }),

  loadFileStructure: async (token: string) => {
    try {
      set({ isLoading: true, error: null });

      const response = await fetchFileStructure(token);

      const tree = response.fileStructure as FileStructureNode;

      // Flatten the structure to build our files map keyed by full path
      const paths = collectFiles(tree);
      const files: Record<string, NoteItem> = {};
      paths.forEach((fullPath) => {
        files[fullPath] = { name: fullPath };
      });

      set({
        files,
        fileTree: tree,
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
      set({ isLoading: true, error: null });

      const content = await fetchNote(fileName, token);

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
      // Do not set isLoading for saves
      set({ isSaving: true, saveError: null });

      await saveNote(fileName, content, token);
      // Update the last saved timestamp without reloading the content
      set({
        lastSaved: new Date(),
        isSaving: false,
        saveError: null,
      });
    } catch (error) {
      console.error("Error saving file:", error);
      set({
        isSaving: false,
        saveError:
          error instanceof Error ? error.message : "Failed to save file",
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
