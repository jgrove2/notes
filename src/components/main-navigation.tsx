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
import { Save, Cog as SettingsIcon } from "lucide-react";
import { useEditorState } from "~/util/editor/editorState";

export function MainNavigation({
  setGettingHtml,
}: {
  setGettingHtml: (gettingHtml: boolean) => void;
}) {
  const { login, logout, isAuthenticated, getToken } = useKindeAuth();
  const { createNewFile, saveFile, currentFile, files } = useFileSystemState();
  const { theme, setTheme } = useTheme();
  const [hasUnsavedChanges, setHasUnsavedChanges] = React.useState(false);

  const handleNewFile = async () => {
    const fileName = prompt("Enter file name (without extension):");
    if (fileName && !files[fileName]) {
      const token = await getToken();
      if (token) {
        await createNewFile(fileName, token);
      }
    }
  };

  const handleSaveFile = async () => {
    if (currentFile) {
      const token = await getToken();
      setGettingHtml(true);
      try {
        if (token) {
          let { getHtmlText } = useEditorState.getState();
          const html = await getHtmlText();
          console.log("Saving file:", currentFile, html);
          await saveFile(currentFile, html, token);
        }
      } finally {
        setGettingHtml(false);
      }
    }
  };

  const darkModeToggle = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  return (
    <div className="w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-12 items-center px-4">
        <div className="flex items-center gap-2">
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
                    Home
                  </NavigationMenuLink>
                </Link>
              </NavigationMenuItem>
              {currentFile && (
                <NavigationMenuItem>
                  <Button
                    onClick={handleSaveFile}
                    disabled={false}
                    variant="ghost"
                    size="sm"
                    className="inline-flex h-8 w-max items-center justify-center rounded-md bg-background px-3 py-1 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50"
                  >
                    Save
                  </Button>
                </NavigationMenuItem>
              )}
            </NavigationMenuList>
          </NavigationMenu>
        </div>

        <div className="flex-1" />

        <div className="flex items-center gap-2">
          <Toggle
            onClick={darkModeToggle}
            className="inline-flex h-8 w-max items-center justify-center rounded-md bg-background px-3 py-1 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50"
          >
            {theme === "dark" ? <MoonIcon /> : <SunIcon />}
          </Toggle>
          <Button
            variant="ghost"
            size="sm"
            className="inline-flex h-8 w-max items-center justify-center rounded-md bg-background px-3 py-1 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50"
            onClick={() => {
              isAuthenticated ? logout() : login();
            }}
          >
            {isAuthenticated ? "Logout" : "Login"}
          </Button>
        </div>
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
