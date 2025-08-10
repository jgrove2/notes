import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  useSidebar,
} from "./ui/sidebar";
import { Button } from "./ui/button";
import {
  FileStructureNode,
  useFileSystemState,
} from "~/util/fileSystem/useFileSystem";
import {
  File,
  Plus,
  RefreshCw,
  Home as HomeIcon,
  Folder,
  FolderOpen,
  Trash2,
} from "lucide-react";
import { useKindeAuth } from "@kinde-oss/kinde-auth-react";
import { useEffect, useRef, useState } from "react";
import { useEditorState } from "~/util/editor/editorState";
import { Editor } from "./ui/editor";
import { PlateEditor } from "platejs/react";
import { useRouter } from "@tanstack/react-router";
import { deleteNote, fetchStorageSize, renameNote } from "~/lib/api";
import { useUserProfile } from "~/hooks/use-user-profile";
import { formatBytes } from "~/lib/utils";
import { Input } from "./ui/input";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
} from "./ui/context-menu";

export function AppSidebar() {
  const { isMobile } = useSidebar();

  const {
    files,
    fileTree,
    currentFile,
    isLoading,
    error,
    loadFileStructure,
    loadFileContent,
    createNewFile,
    setFiles,
    setCurrentFile,
  } = useFileSystemState();

  const { isAuthenticated, getToken } = useKindeAuth();
  const { data: profile } = useUserProfile();
  const [usedBytes, setUsedBytes] = useState<number | null>(null);
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [newFileName, setNewFileName] = useState("");
  const [newFileError, setNewFileError] = useState<string | null>(null);
  const [isSubmittingNew, setIsSubmittingNew] = useState(false);
  const newFileInputRef = useRef<HTMLInputElement | null>(null);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const router = useRouter();
  const [renamingPath, setRenamingPath] = useState<string | null>(null);
  const [renameInput, setRenameInput] = useState<string>("");

  // helper: expand folders leading to a file path
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

  // Load file structure when component mounts and user is authenticated
  useEffect(() => {
    if (isAuthenticated) {
      const loadFiles = async () => {
        const token = await getToken();
        if (token) {
          await loadFileStructure(token);
        }
      };
      loadFiles();
    }
  }, [isAuthenticated, loadFileStructure, getToken]);

  // Auto-expand folders for the currently selected file
  useEffect(() => {
    if (currentFile) {
      expandToPath(currentFile);
    }
  }, [currentFile]);

  // Fetch current storage usage for sidebar display
  useEffect(() => {
    let canceled = false;
    const run = async () => {
      try {
        const token = await getToken();
        if (!token) return;
        const size = await fetchStorageSize(token);
        if (!canceled) setUsedBytes(size);
      } catch (_e) {
        if (!canceled) setUsedBytes(null);
      }
    };
    if (isAuthenticated) run();
    return () => {
      canceled = true;
    };
  }, [isAuthenticated, getToken]);

  const handleRefreshFiles = async () => {
    const token = await getToken();
    if (token) {
      await loadFileStructure(token);
    }
  };

  const handleFileSelect = async (fileName: string) => {
    // persist selection
    try {
      sessionStorage.setItem("selectedFile", fileName);
    } catch {}
    // expand folders to this file path
    expandToPath(fileName);

    // Navigate to the editor immediately for faster UI feedback
    router.navigate({ to: "/editor" });

    const token = await getToken();
    if (token) {
      const content = await loadFileContent(fileName, token);
      const editor = useEditorState.getState().editor;
      if (editor) {
        try {
          let cleanedHtml = content ?? "";
          if (
            typeof cleanedHtml === "string" &&
            /<\s*html\b|<\s*body\b/i.test(cleanedHtml)
          ) {
            try {
              const parser = new DOMParser();
              const doc = parser.parseFromString(cleanedHtml, "text/html");
              cleanedHtml = doc.body ? doc.body.innerHTML : cleanedHtml;
            } catch (_e) {
              // keep original content on parse failure
            }
          }
          cleanedHtml =
            typeof cleanedHtml === "string" ? cleanedHtml.trim() : "";
          console.log("cleanedHtml", cleanedHtml);

          const slateValue = (editor as PlateEditor).api.html.deserialize({
            element: cleanedHtml,
          });
          editor.tf.setValue(slateValue as any);
        } catch (e) {
          console.error("Failed to deserialize HTML into editor:", e);
        }
      }
    }
  };

  const startCreateNew = () => {
    setNewFileError(null);
    setNewFileName("");
    setIsSubmittingNew(false);
    setIsCreatingNew(true);
  };

  const cancelCreateNew = () => {
    if (isSubmittingNew) return; // don't cancel mid-submit
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

  const submitCreateNew = async () => {
    if (isSubmittingNew) return;
    const errorMsg = getValidationError(newFileName);
    if (errorMsg) {
      setNewFileError(errorMsg);
      return;
    }
    setIsSubmittingNew(true);
    const trimmed = newFileName.trim();
    const token = await getToken();
    if (!token) {
      setIsSubmittingNew(false);
      return;
    }
    const initialContent = "<h1>New Document</h1><p>Start writing...</p>";
    try {
      await createNewFile(trimmed, initialContent, token);
      const { editor } = useEditorState.getState();
      if (editor) {
        const slateValue = editor.api.html.deserialize(initialContent);
        editor.tf.setValue(slateValue as any);
      }
      // persist and expand
      try {
        sessionStorage.setItem("selectedFile", trimmed);
      } catch {}
      expandToPath(trimmed);
      // Hide and blur the inline input immediately after success
      newFileInputRef.current?.blur();
      setIsCreatingNew(false);
      setNewFileName("");
      setNewFileError(null);
      setIsSubmittingNew(false);
      await router.navigate({ to: "/editor" });
    } catch (e) {
      setNewFileError(e instanceof Error ? e.message : "Failed to create file");
      setIsSubmittingNew(false);
      setIsCreatingNew(false);
    }
  };

  const usedLabel = usedBytes != null ? formatBytes(usedBytes) : "—";
  const maxLabel = profile?.maxStorage ? formatBytes(profile.maxStorage) : "—";

  const toggleFolder = (path: string) => {
    setExpanded((prev) => ({ ...prev, [path]: !prev[path] }));
  };

  const isFolder = (
    node: null | FileStructureNode
  ): node is FileStructureNode => !!node && typeof node === "object";

  const handleDeleteFile = async (fullPath: string) => {
    const token = await getToken();
    if (!token) return;
    try {
      await deleteNote(fullPath, token);
      // Refresh from backend to sync tree and files
      await loadFileStructure(token);
      // If deleting the open file
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
    const token = await getToken();
    if (!token) return;
    try {
      await renameNote(oldFullPath, newFullPath, token);
      await loadFileStructure(token);
      setRenamingPath(null);
      setRenameInput("");
      // update selection if this file was selected
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
    const token = await getToken();
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

  const renderTree = (node: FileStructureNode, prefix = "") => {
    return (
      <ul className="pl-0">
        {Object.entries(node).map(([name, child]) => {
          const fullPath = prefix ? `${prefix}/${name}` : name;
          if (child === null) {
            // file
            const isRenaming = renamingPath === fullPath;
            return (
              <SidebarMenuItem key={fullPath}>
                <ContextMenu>
                  <ContextMenuTrigger asChild>
                    <SidebarMenuButton
                      onClick={() => !isRenaming && handleFileSelect(fullPath)}
                      isActive={currentFile === fullPath}
                      className="w-full justify-start sm:text-sm text-xs select-none"
                    >
                      <File className="w-4 h-4 mr-2" />
                      {isRenaming ? (
                        <input
                          autoFocus
                          className="bg-transparent border-b border-border focus:outline-none text-xs sm:text-sm flex-1"
                          value={renameInput}
                          onChange={(e) => setRenameInput(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              void submitRename(fullPath);
                            } else if (e.key === "Escape") {
                              e.preventDefault();
                              cancelRename();
                            }
                          }}
                          onBlur={() => cancelRename()}
                        />
                      ) : (
                        name
                      )}
                    </SidebarMenuButton>
                  </ContextMenuTrigger>
                  <ContextMenuContent>
                    <ContextMenuItem onClick={() => beginRename(fullPath)}>
                      Rename
                    </ContextMenuItem>
                    <ContextMenuSub>
                      <ContextMenuSubTrigger>Move to…</ContextMenuSubTrigger>
                      <ContextMenuSubContent>
                        {collectFolders(fileTree as FileStructureNode)
                          .length === 0 ? (
                          <ContextMenuItem disabled>No folders</ContextMenuItem>
                        ) : (
                          collectFolders(fileTree as FileStructureNode).map(
                            (folder) => (
                              <ContextMenuItem
                                key={folder}
                                onClick={() =>
                                  handleMoveToFolder(fullPath, folder)
                                }
                              >
                                {folder}
                              </ContextMenuItem>
                            )
                          )
                        )}
                      </ContextMenuSubContent>
                    </ContextMenuSub>
                    <ContextMenuItem
                      variant="destructive"
                      onClick={() => handleDeleteFile(fullPath)}
                    >
                      <Trash2 className="w-4 h-4" /> Delete
                    </ContextMenuItem>
                  </ContextMenuContent>
                </ContextMenu>
              </SidebarMenuItem>
            );
          }
          // folder
          const open = !!expanded[fullPath];
          return (
            <li key={fullPath} className="list-none">
              <button
                type="button"
                onClick={() => toggleFolder(fullPath)}
                className="flex items-center w-full text-left p-2 rounded-md hover:bg-sidebar-accent hover:text-sidebar-accent-foreground text-sm select-none"
              >
                {open ? (
                  <FolderOpen className="w-4 h-4 mr-2" />
                ) : (
                  <Folder className="w-4 h-4 mr-2" />
                )}
                {name}
              </button>
              {open && child && (
                <div className="pl-4">
                  <SidebarMenu>{renderTree(child, fullPath)}</SidebarMenu>
                </div>
              )}
            </li>
          );
        })}
      </ul>
    );
  };

  return (
    <Sidebar
      side="left"
      variant={isMobile ? "floating" : "sidebar"}
      collapsible={isMobile ? "icon" : "offcanvas"}
    >
      <SidebarHeader className="p-4">
        <h2 className="text-lg font-semibold">Notes</h2>
      </SidebarHeader>

      <SidebarContent className="overflow-y-auto">
        <SidebarGroup className="">
          <SidebarGroupLabel>Workspace</SidebarGroupLabel>
          <SidebarGroupContent>
            <div className="space-y-2 p-2">
              <Button
                onClick={async () => router.navigate({ to: "/" })}
                className="w-full justify-start sm:text-sm text-xs select-none"
                variant="outline"
                size="sm"
              >
                <HomeIcon className="w-4 h-4 mr-2" />
                Home
              </Button>

              <Button
                onClick={handleRefreshFiles}
                disabled={isLoading || !isAuthenticated}
                className="w-full justify-start sm:text-sm text-xs select-none"
                variant="outline"
                size="sm"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh Files
              </Button>

              {isAuthenticated && (
                <Button
                  onClick={startCreateNew}
                  disabled={isLoading || isSubmittingNew}
                  className="w-full justify-start sm:text-sm text-xs select-none"
                  variant="outline"
                  size="sm"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  New File
                </Button>
              )}
              {isAuthenticated && (
                <div className="text-xs text-muted-foreground px-1">
                  {Object.keys(files).length} notes • {usedLabel}/{maxLabel}
                </div>
              )}
            </div>
          </SidebarGroupContent>
        </SidebarGroup>

        {((fileTree && Object.keys(fileTree as any).length > 0) ||
          isCreatingNew) && (
          <SidebarGroup>
            <SidebarGroupLabel>Files</SidebarGroupLabel>
            <SidebarGroupContent>
              <div className="pr-1">
                <SidebarMenu>
                  {renderTree(fileTree as FileStructureNode)}
                  {isCreatingNew && (
                    <div className="mt-2 space-y-1 pb-2">
                      <Input
                        ref={newFileInputRef}
                        autoFocus
                        value={newFileName}
                        disabled={isSubmittingNew}
                        aria-invalid={!!newFileError}
                        onChange={(e) => {
                          if (isSubmittingNew) return;
                          const val = e.target.value;
                          setNewFileName(val);
                          setNewFileError(getValidationError(val));
                        }}
                        onKeyDown={(e) => {
                          if (isSubmittingNew) {
                            e.preventDefault();
                            return;
                          }
                          if (e.key === "Enter") {
                            e.preventDefault();
                            // Only attempt submit if valid
                            const err = getValidationError(newFileName);
                            if (err) {
                              setNewFileError(err);
                              return;
                            }
                            void submitCreateNew();
                          } else if (e.key === "Escape") {
                            e.preventDefault();
                            cancelCreateNew();
                          }
                        }}
                        onBlur={() => {
                          // Cancel on click-away; ignore while submitting
                          if (!isSubmittingNew) cancelCreateNew();
                        }}
                        placeholder="New note title"
                      />
                      {newFileError && (
                        <div className="text-xs text-red-600">
                          {newFileError}
                        </div>
                      )}
                    </div>
                  )}
                </SidebarMenu>
              </div>
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        {error && (
          <SidebarGroup>
            <div className="p-4 text-sm text-red-600 bg-red-50 rounded-md mx-2">
              {error}
            </div>
          </SidebarGroup>
        )}
      </SidebarContent>

      <SidebarFooter className="p-4">
        {isLoading && (
          <div className="text-sm text-muted-foreground">Loading...</div>
        )}
        {!isAuthenticated && (
          <div className="text-xs text-muted-foreground">
            Please login to access your notes
          </div>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}
