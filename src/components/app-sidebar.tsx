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
import { FileStructureNode } from "~/util/fileSystem/useFileSystem";
import {
  File,
  Plus,
  RefreshCw,
  Home as HomeIcon,
  Folder,
  FolderOpen,
  Trash2,
} from "lucide-react";
import { useRouter } from "@tanstack/react-router";
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
import { useAppSidebar, AppSidebarProvider } from "~/hooks/use-app-sidebar";

function AppSidebarInner() {
  const { isMobile } = useSidebar();
  const router = useRouter();

  const {
    files,
    fileTree,
    currentFile,
    isLoading,
    error,
    usedBytes,
    profileMaxStorage,
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
    handleDeleteFile,
    handleMoveToFolder,
    collectFolders,
    selectFile,
    setNewFileNameAndValidate,
    setRenameInput,
  } = useAppSidebar();

  const usedLabel = usedBytes != null ? formatBytes(usedBytes) : "—";
  const maxLabel = profileMaxStorage ? formatBytes(profileMaxStorage) : "—";

  const renderTree = (node: FileStructureNode, prefix = "") => {
    return (
      <ul className="pl-0">
        {Object.entries(node).map(([name, child]) => {
          const fullPath = prefix ? `${prefix}/${name}` : name;
          if (child === null) {
            const isRenaming = renamingPath === fullPath;
            return (
              <SidebarMenuItem key={fullPath}>
                <ContextMenu>
                  <ContextMenuTrigger asChild>
                    <SidebarMenuButton
                      onClick={() => !isRenaming && selectFile(fullPath)}
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
                              cancelCreateNew();
                            }
                          }}
                          onBlur={() => cancelCreateNew()}
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
                disabled={isLoading}
                className="w-full justify-start sm:text-sm text-xs select-none"
                variant="outline"
                size="sm"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh Files
              </Button>

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
              <div className="text-xs text-muted-foreground px-1">
                {Object.keys(files).length} notes • {usedLabel}/{maxLabel}
              </div>
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
                          setNewFileNameAndValidate(e.target.value);
                        }}
                        onKeyDown={(e) => {
                          if (isSubmittingNew) {
                            e.preventDefault();
                            return;
                          }
                          if (e.key === "Enter") {
                            e.preventDefault();
                            void submitCreateNew();
                          } else if (e.key === "Escape") {
                            e.preventDefault();
                            cancelCreateNew();
                          }
                        }}
                        onBlur={() => {
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
      </SidebarFooter>
    </Sidebar>
  );
}

export function AppSidebar() {
  return (
    <AppSidebarProvider>
      <AppSidebarInner />
    </AppSidebarProvider>
  );
}
