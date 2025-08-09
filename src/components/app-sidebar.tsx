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
import { File, Plus, RefreshCw } from "lucide-react";
import { useKindeAuth } from "@kinde-oss/kinde-auth-react";
import { useEffect } from "react";
import { useEditorState } from "~/util/editor/editorState";
import { Editor } from "./ui/editor";
import { PlateEditor } from "platejs/react";

export function AppSidebar() {
  const { isMobile } = useSidebar();

  const {
    files,
    currentFile,
    isLoading,
    error,
    loadFileStructure,
    loadFileContent,
    createNewFile,
  } = useFileSystemState();

  const { isAuthenticated, getToken } = useKindeAuth();

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

  const handleRefreshFiles = async () => {
    const token = await getToken();
    if (token) {
      await loadFileStructure(token);
    }
  };

  const handleFileSelect = async (fileName: string) => {
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

  const handleCreateNewFile = async () => {
    const fileName = prompt("Enter File Name (without extension):");
    if (fileName && !files[fileName]) {
      const token = await getToken();
      if (token) {
        const initialContent = "<h1>New Document</h1><p>Start writing...</p>";
        await createNewFile(fileName, initialContent, token);
        const { loadHtmlToEditor, editor } = useEditorState.getState();
        if (editor) {
          const slateValue = editor.api.html.deserialize(initialContent);
          console.log("slateValue", slateValue);
          editor.tf.setValue(slateValue as any);
          console.log(initialContent);
        }
      }
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
                onClick={handleRefreshFiles}
                disabled={isLoading || !isAuthenticated}
                className="w-full justify-start"
                variant="outline"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh Files
              </Button>

              {isAuthenticated && (
                <Button
                  onClick={handleCreateNewFile}
                  disabled={isLoading}
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
        {!isAuthenticated && (
          <div className="text-xs text-muted-foreground">
            Please login to access your notes
          </div>
        )}
        {isAuthenticated && Object.keys(files).length > 0 && (
          <div className="text-xs text-muted-foreground">
            {Object.keys(files).length} notes available
          </div>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}
