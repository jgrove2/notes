"use client";

import { AppSidebar } from "./components/app-sidebar";
import { SidebarProvider } from "./components/ui/sidebar";
import { MainNavigation } from "./components/main-navigation";
import { ThemeProvider } from "./util/theme/useTheme";
import { KindeProvider, useKindeAuth } from "@kinde-oss/kinde-auth-react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import TiptapContext from "./context/TiptapContext";
import "./index.css";

import { Loader2 } from "lucide-react";
import { AppSidebarProvider } from "./hooks/use-app-sidebar";

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

function AuthenticatedLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useKindeAuth();

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  // If not authenticated, render children without sidebar and navigation
  if (!isAuthenticated) {
    return <>{children}</>;
  }

  // If authenticated, render with sidebar and navigation
  return (
    <SidebarProvider>
      <AppSidebarProvider>
        <AppSidebar />
        <div className="flex-1 flex flex-col w-full overflow-hidden">
          <MainNavigation />
          <main
            className="overflow-auto"
            style={{ height: "calc(100vh - 4rem)" }}
          >
            {children}
          </main>
        </div>
      </AppSidebarProvider>
    </SidebarProvider>
  );
}

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // const { editor, setEditor } = useEditorState();
  // const editorComponent = usePlateEditor({
  //   plugins: EditorKit,
  //   value: (editor) =>
  //     editor.getApi(MarkdownPlugin).markdown.deserialize("", {
  //       remarkPlugins: [
  //         remarkMath,
  //         remarkGfm,
  //         remarkMdx,
  //         remarkMention,
  //         remarkEmoji as any,
  //       ],
  //     }),
  // });
  // const [html, setHtml] = useState<string>("");
  // const [gettingHtml, setGettingHtml] = useState<boolean>(false);
  // useEffect(() => {
  //   setEditor(editorComponent as any);
  // }, [editor]);

  // useEffect(() => {
  //   if (editor && gettingHtml) {
  //     serializeHtml(editorComponent).then((html) => {
  //       setHtml(html);
  //       setGettingHtml(false);
  //     });
  //   }
  // }, [editor, gettingHtml]);

  return (
    <KindeProvider
      clientId={import.meta.env.VITE_KINDE_CLIENT_ID}
      domain={import.meta.env.VITE_KINDE_DOMAIN}
      redirectUri={import.meta.env.VITE_KINDE_REDIRECT_URI}
      logoutUri={import.meta.env.VITE_KINDE_LOGOUT_URI}
    >
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <TiptapContext>
            <AuthenticatedLayout>{children}</AuthenticatedLayout>
          </TiptapContext>
        </ThemeProvider>
      </QueryClientProvider>
    </KindeProvider>
  );
}
