import { Link } from "@tanstack/react-router";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "~/components/ui/navigation-menu";
import { cn } from "~/lib/utils";
import { useFileSystemState } from "~/util/fileSystem/useFileSystem";
import * as React from "react";
import { SidebarTrigger } from "./ui/sidebar";
import { Toggle } from "@radix-ui/react-toggle";
import { MoonIcon, SunIcon } from "@radix-ui/react-icons";
import { useTheme } from "~/util/theme/useTheme";
import { Button } from "./ui/button";
import { useKindeAuth } from "@kinde-oss/kinde-auth-react";
import { useEditor } from "./editor/editor-kit";
import { useEditorState } from "~/util/editor/editorState";
import { Save } from "lucide-react";

export function MainNavigation() {
  const { login, logout, isAuthenticated, getToken } = useKindeAuth();
  const { createNewFile, saveFile, currentFile, files, lastSaved } =
    useFileSystemState();
  const { markdownText } = useEditorState();
  const { theme, setTheme } = useTheme();
  const [hasUnsavedChanges, setHasUnsavedChanges] = React.useState(false);

  // Track changes by comparing current content with last saved content
  React.useEffect(() => {
    if (currentFile && files[currentFile]?.content) {
      const savedContent = files[currentFile].content?.content || "";
      const currentContent = markdownText;
      setHasUnsavedChanges(savedContent !== currentContent);
    } else {
      setHasUnsavedChanges(false);
    }
  }, [currentFile, files, markdownText]);

  const handleNewFile = async () => {
    const fileName = prompt("Enter file name (without extension):");
    if (fileName && !files[fileName]) {
      const token = await getToken();
      if (token) {
        const initialContent = {
          content: "# New Document\n\nStart writing...",
          lastModified: new Date().toISOString(),
          createdAt: new Date().toISOString(),
        };
        await createNewFile(fileName, initialContent, token);
      }
    }
  };

  const handleSaveFile = async () => {
    console.log("Save button clicked");
    console.log("Current file:", currentFile);
    console.log("Has unsaved changes:", hasUnsavedChanges);
    console.log("Current markdown text:", markdownText);

    if (currentFile && hasUnsavedChanges) {
      console.log("Attempting to save file:", currentFile);
      const token = await getToken();
      if (token) {
        const contentToSave = {
          content: markdownText,
          lastModified: new Date().toISOString(),
        };
        console.log("Content to save:", contentToSave);
        await saveFile(currentFile, contentToSave, token);
        setHasUnsavedChanges(false);
        console.log("Save completed");
      } else {
        console.log("No token available");
      }
    } else {
      console.log(
        "Save conditions not met - currentFile:",
        currentFile,
        "hasUnsavedChanges:",
        hasUnsavedChanges
      );
    }
  };

  const darkModeToggle = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  return (
    <div className="w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-12 items-center px-4">
        <NavigationMenu>
          <NavigationMenuList>
            <NavigationMenuItem>
              <SidebarTrigger />
            </NavigationMenuItem>
            <NavigationMenuItem>
              <Link to="/settings">
                <NavigationMenuLink className="group inline-flex h-8 w-max items-center justify-center rounded-md bg-background px-3 py-1 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50">
                  Settings
                </NavigationMenuLink>
              </Link>
            </NavigationMenuItem>

            <NavigationMenuItem>
              <Link to="/">
                <NavigationMenuLink className="group inline-flex h-8 w-max items-center justify-center rounded-md bg-background px-3 py-1 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50">
                  Help
                </NavigationMenuLink>
              </Link>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <Toggle
                onClick={darkModeToggle}
                className="inline-flex h-8 w-max items-center justify-center rounded-md bg-background px-3 py-1 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50"
              >
                {theme === "dark" ? <MoonIcon /> : <SunIcon />}
              </Toggle>
            </NavigationMenuItem>
            {currentFile && (
              <NavigationMenuItem>
                <Button
                  onClick={handleSaveFile}
                  disabled={!hasUnsavedChanges}
                  variant="ghost"
                  size="sm"
                  className="inline-flex h-8 w-max items-center justify-center rounded-md bg-background px-3 py-1 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50"
                >
                  <Save className="w-4 h-4 mr-1" />
                  Save
                </Button>
              </NavigationMenuItem>
            )}
            {isAuthenticated && (
              <NavigationMenuItem>
                <NavigationMenuLink
                  onClick={handleNewFile}
                  className="group inline-flex h-8 w-max items-center justify-center rounded-md bg-background px-3 py-1 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50"
                >
                  New File
                </NavigationMenuLink>
              </NavigationMenuItem>
            )}
            <NavigationMenuItem>
              <NavigationMenuLink
                onClick={() => {
                  isAuthenticated ? logout() : login();
                }}
                className="group inline-flex h-8 w-max items-center justify-center rounded-md bg-background px-3 py-1 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50"
              >
                {isAuthenticated ? "Logout" : "Login"}
              </NavigationMenuLink>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>
      </div>
    </div>
  );
}

const ActionItem = React.forwardRef<
  React.ElementRef<"button">,
  React.ComponentPropsWithoutRef<"button"> & {
    title: string;
    children: React.ReactNode;
    action?: () => void;
    disabled?: boolean;
  }
>(({ className, title, children, action, disabled, ...props }, ref) => {
  return (
    <li>
      <NavigationMenuLink asChild>
        <button
          ref={ref}
          onClick={action}
          disabled={disabled}
          className={cn(
            "block w-full text-left select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground disabled:opacity-50 disabled:cursor-not-allowed",
            className
          )}
          {...props}
        >
          <div className="text-sm font-medium leading-none">{title}</div>
          <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
            {children}
          </p>
        </button>
      </NavigationMenuLink>
    </li>
  );
});
ActionItem.displayName = "ActionItem";

const LinkItem = React.forwardRef<
  React.ElementRef<"a">,
  React.ComponentPropsWithoutRef<"a"> & {
    title: string;
    href: string;
    children: React.ReactNode;
  }
>(({ className, title, children, href, ...props }, ref) => {
  return (
    <li>
      <NavigationMenuLink asChild>
        <Link
          to={href || "/"}
          ref={ref}
          className={cn(
            "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
            className
          )}
          {...props}
        >
          <div className="text-sm font-medium leading-none">{title}</div>
          <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
            {children}
          </p>
        </Link>
      </NavigationMenuLink>
    </li>
  );
});
LinkItem.displayName = "LinkItem";
