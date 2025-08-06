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
import { useFileSystemState } from "~/util/fileSystem/useFileSystem";
import { FolderOpen, File, Plus } from "lucide-react";
import { useKindeAuth } from "@kinde-oss/kinde-auth-react";

export function AppSidebar() {
  const { state, open, openMobile, setOpenMobile, isMobile, toggleSidebar } =
    useSidebar();

  const {
    files,
    currentFile,
    directoryHandle,
    isLoading,
    error,
    selectDirectory,
    loadFileContent,
    createNewFile,
  } = useFileSystemState();

  const handleOpenDirectory = async () => {
    await selectDirectory();
  };

  const { isAuthenticated } = useKindeAuth();

  const handleFileSelect = async (fileName: string) => {
    if (files[fileName]?.content) {
      // File content already loaded
      useFileSystemState.getState().setCurrentFile(fileName);
    } else {
      // Load file content
      await loadFileContent(fileName);
    }
  };

  const handleCreateNewFile = async () => {
    const fileName = prompt("Enter File Name:");
    if (fileName && !files[fileName]) {
      await createNewFile(fileName, `{}`);
    }
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

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Workspace</SidebarGroupLabel>
          <SidebarGroupContent>
            <div className="space-y-2 p-2">
              <Button
                onClick={handleOpenDirectory}
                disabled={isLoading || !isAuthenticated}
                className="w-full justify-start"
                variant="outline"
              >
                <FolderOpen className="w-4 h-4 mr-2" />
                {directoryHandle ? "Change Directory" : "Open Directory"}
              </Button>

              {directoryHandle && (
                <Button
                  onClick={handleCreateNewFile}
                  disabled={isLoading || !isAuthenticated}
                  className="w-full justify-start"
                  variant="outline"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  New File
                </Button>
              )}
            </div>
          </SidebarGroupContent>
        </SidebarGroup>

        {Object.keys(files).length > 0 && (
          <SidebarGroup>
            <SidebarGroupLabel>Files</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {Object.entries(files).map(([fileName, fileItem]) => (
                  <SidebarMenuItem key={fileName}>
                    <SidebarMenuButton
                      onClick={() => handleFileSelect(fileName)}
                      isActive={currentFile === fileName}
                      className="w-full justify-start"
                    >
                      <File className="w-4 h-4 mr-2" />
                      {fileName}
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
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
        {directoryHandle && (
          <div className="text-xs text-muted-foreground">
            Working in: {directoryHandle.name}
          </div>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}
