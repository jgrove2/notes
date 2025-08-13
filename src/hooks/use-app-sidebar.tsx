import * as React from "react";
import { useRouter } from "@tanstack/react-router";
import { useKindeAuth } from "@kinde-oss/kinde-auth-react";
import { useCurrentEditor } from "@tiptap/react";
import { useUserProfile } from "~/hooks/use-user-profile";
import { deleteNote, fetchStorageSize, renameNote } from "~/lib/api";
import {
  useFileSystemState,
  type FileStructureNode,
} from "~/util/fileSystem/useFileSystem";

export interface AppSidebarContextValue {
  // File system state
  files: Record<string, unknown>;
  fileTree: FileStructureNode | null;
  currentFile: string;
  isLoading: boolean;
  error: string | null;

  // Storage usage
  usedBytes: number | null;
  profileMaxStorage: number | undefined;

  // UI state
  isCreatingNew: boolean;
  newFileName: string;
  newFileError: string | null;
  isSubmittingNew: boolean;
  newFileInputRef: React.RefObject<HTMLInputElement | null>;
  expanded: Record<string, boolean>;
  renamingPath: string | null;
  renameInput: string;

  // Actions
  handleRefreshFiles: () => Promise<void>;
  startCreateNew: () => void;
  cancelCreateNew: () => void;
  submitCreateNew: () => Promise<void>;
  toggleFolder: (path: string) => void;
  beginRename: (fullPath: string) => void;
  submitRename: (oldFullPath: string) => Promise<void>;
  cancelRename: () => void;
  handleDeleteFile: (fullPath: string) => Promise<void>;
  handleMoveToFolder: (fullPath: string, targetFolder: string) => Promise<void>;
  collectFolders: (node: FileStructureNode, prefix?: string) => string[];
  selectFile: (fullPath: string) => Promise<void>;
  setNewFileNameAndValidate: (val: string) => void;
  setRenameInput: (val: string) => void;
}

const AppSidebarContext = React.createContext<
  AppSidebarContextValue | undefined
>(undefined);

export function AppSidebarProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { isAuthenticated, getAccessToken } = useKindeAuth();
  const { editor } = useCurrentEditor();
  const { data: profile } = useUserProfile();

  const {
    files,
    fileTree,
    currentFile,
    isLoading,
    error,
    loadFileStructure,
    loadFileContent,
    createNewFile,
    setCurrentFile,
  } = useFileSystemState();

  const [usedBytes, setUsedBytes] = React.useState<number | null>(null);
  const [isCreatingNew, setIsCreatingNew] = React.useState(false);
  const [newFileName, setNewFileName] = React.useState("");
  const [newFileError, setNewFileError] = React.useState<string | null>(null);
  const [isSubmittingNew, setIsSubmittingNew] = React.useState(false);
  const newFileInputRef = React.useRef<HTMLInputElement | null>(null);
  const [expanded, setExpanded] = React.useState<Record<string, boolean>>({});
  const [renamingPath, setRenamingPath] = React.useState<string | null>(null);
  const [renameInput, setRenameInput] = React.useState<string>("");

  const expandToPath = (filePath: string) => {
    if (!filePath) return;
    const parts = filePath.split("/");
    if (parts.length <= 1) return;
    const accum: Record<string, boolean> = {};
    let prefix = "";
    for (let i = 0; i < parts.length - 1; i++) {
      prefix = prefix ? `${prefix}/${parts[i]}` : parts[i];
      accum[prefix] = true;
    }
    setExpanded((prev) => ({ ...prev, ...accum }));
  };

  React.useEffect(() => {
    if (isAuthenticated) {
      const loadFiles = async () => {
        const token = await getAccessToken();
        if (token) {
          await loadFileStructure(token);
          const selectedFile = sessionStorage.getItem("selectedFile");
          if (selectedFile && typeof selectedFile === "string") {
            if (router.state.location.pathname !== "/editor") {
              await router.navigate({ to: "/editor" });
            } else {
              await loadFileContentToEditor(selectedFile);
            }
          } else {
            router.navigate({ to: "/" });
          }
        }
      };
      void loadFiles();
    }
  }, [isAuthenticated, loadFileStructure, getAccessToken]);

  React.useEffect(() => {
    if (currentFile) {
      expandToPath(currentFile);
    }
  }, [currentFile]);

  React.useEffect(() => {
    let canceled = false;
    const run = async () => {
      try {
        const token = await getAccessToken();
        if (!token) return;
        const size = await fetchStorageSize(token);
        if (!canceled) setUsedBytes(size);
      } catch {
        if (!canceled) setUsedBytes(null);
      }
    };
    if (isAuthenticated) void run();
    return () => {
      canceled = true;
    };
  }, [isAuthenticated, getAccessToken]);

  const handleRefreshFiles = async () => {
    const token = await getAccessToken();
    if (token) {
      await loadFileStructure(token);
    }
  };

  const startCreateNew = () => {
    setNewFileError(null);
    setNewFileName("");
    setIsSubmittingNew(false);
    setIsCreatingNew(true);
  };

  const cancelCreateNew = () => {
    if (isSubmittingNew) return;
    setIsCreatingNew(false);
    setNewFileName("");
    setNewFileError(null);
  };

  const getValidationError = (name: string): string | null => {
    const trimmed = name.trim();
    if (!trimmed) return "Title is required";
    if (files[trimmed]) return "A note with this title already exists";
    return null;
  };

  const setNewFileNameAndValidate = (val: string) => {
    setNewFileName(val);
    setNewFileError(getValidationError(val));
  };

  const submitCreateNew = async () => {
    if (isSubmittingNew) return;
    const errorMsg = getValidationError(newFileName);
    if (errorMsg) {
      setNewFileError(errorMsg);
      return;
    }
    setIsSubmittingNew(true);
    const trimmed = newFileName.trim();
    const token = await getAccessToken();
    if (!token) {
      setIsSubmittingNew(false);
      return;
    }
    const initialContent = "<h1>New Document</h1><p>Start writing...</p>";
    try {
      await createNewFile(trimmed, initialContent, token);
      try {
        sessionStorage.setItem("selectedFile", trimmed);
      } catch {}
      expandToPath(trimmed);
      newFileInputRef.current?.blur();
      editor?.commands?.setContent(initialContent);
      setIsCreatingNew(false);
      setNewFileName("");
      setNewFileError(null);
      setIsSubmittingNew(false);
      if (router.state.location.pathname !== "/editor") {
        await router.navigate({ to: "/editor" });
      }
    } catch (e) {
      setNewFileError(e instanceof Error ? e.message : "Failed to create file");
      setIsSubmittingNew(false);
      setIsCreatingNew(false);
    }
  };

  const toggleFolder = (path: string) => {
    setExpanded((prev) => ({ ...prev, [path]: !prev[path] }));
  };

  const handleDeleteFile = async (fullPath: string) => {
    const token = await getAccessToken();
    if (!token) return;
    try {
      await deleteNote(fullPath, token);
      await loadFileStructure(token);
      if (currentFile === fullPath) {
        setCurrentFile("");
        try {
          sessionStorage.removeItem("selectedFile");
        } catch {}
        await router.navigate({ to: "/" });
      }
    } catch (e) {
      console.error("Failed to delete note:", e);
    }
  };

  const beginRename = (fullPath: string) => {
    const parts = fullPath.split("/");
    const base = parts.pop() || fullPath;
    setRenamingPath(fullPath);
    setRenameInput(base);
  };

  const submitRename = async (oldFullPath: string) => {
    const parts = oldFullPath.split("/");
    const parent = parts.slice(0, -1).join("/");
    const newBase = renameInput.trim();
    if (!newBase) return;
    const newFullPath = parent ? `${parent}/${newBase}` : newBase;
    const token = await getAccessToken();
    if (!token) return;
    try {
      await renameNote(oldFullPath, newFullPath, token);
      await loadFileStructure(token);
      setRenamingPath(null);
      setRenameInput("");
      if (currentFile === oldFullPath) {
        setCurrentFile(newFullPath);
        try {
          sessionStorage.setItem("selectedFile", newFullPath);
        } catch {}
        expandToPath(newFullPath);
      }
    } catch (e) {
      console.error("Failed to rename note:", e);
    }
  };

  const cancelRename = () => {
    setRenamingPath(null);
    setRenameInput("");
  };

  const collectFolders = (node: FileStructureNode, prefix = ""): string[] => {
    const result: string[] = [];
    for (const [name, child] of Object.entries(node)) {
      const full = prefix ? `${prefix}/${name}` : name;
      if (child && typeof child === "object") {
        result.push(full);
        result.push(...collectFolders(child, full));
      }
    }
    return result;
  };

  const handleMoveToFolder = async (fullPath: string, targetFolder: string) => {
    const parts = fullPath.split("/");
    const base = parts.pop() || fullPath;
    const newFullPath = targetFolder ? `${targetFolder}/${base}` : base;
    const token = await getAccessToken();
    if (!token) return;
    try {
      await renameNote(fullPath, newFullPath, token);
      await loadFileStructure(token);
      if (currentFile === fullPath) {
        setCurrentFile(newFullPath);
        try {
          sessionStorage.setItem("selectedFile", newFullPath);
        } catch {}
        expandToPath(newFullPath);
      }
    } catch (e) {
      console.error("Failed to move note:", e);
    }
  };

  const loadFileContentToEditor = async (fileName: string) => {
    const token = await getAccessToken();
    if (!token) return;
    const content = await loadFileContent(fileName, token);
    if (editor) {
      if (!content || content.length <= 0) {
        console.warn("No content found for file:", fileName);
        editor.commands.setContent("<html><body></body></html>");
      } else {
        editor.commands.setContent(content);
      }
    }
  };

  const selectFile = async (fullPath: string) => {
    setCurrentFile(fullPath);
    try {
      sessionStorage.setItem("selectedFile", fullPath);
    } catch {}
    expandToPath(fullPath);
    if (router.state.location.pathname !== "/editor") {
      await router.navigate({ to: "/editor" });
    }
    await loadFileContentToEditor(fullPath);
  };

  const value: AppSidebarContextValue = {
    files,
    fileTree,
    currentFile,
    isLoading,
    error,
    usedBytes,
    profileMaxStorage: profile?.maxStorage,
    isCreatingNew,
    newFileName,
    newFileError,
    isSubmittingNew,
    newFileInputRef,
    expanded,
    renamingPath,
    renameInput,
    handleRefreshFiles,
    startCreateNew,
    cancelCreateNew,
    submitCreateNew,
    toggleFolder,
    beginRename,
    submitRename,
    cancelRename,
    handleDeleteFile,
    handleMoveToFolder,
    collectFolders,
    selectFile,
    setNewFileNameAndValidate,
    setRenameInput,
  };

  return (
    <AppSidebarContext.Provider value={value}>
      {children}
    </AppSidebarContext.Provider>
  );
}

export function useAppSidebar() {
  const ctx = React.useContext(AppSidebarContext);
  if (!ctx) {
    throw new Error("useAppSidebar must be used within an AppSidebarProvider");
  }
  return ctx;
}
