import { AppSidebar } from "./components/app-sidebar";
import { SidebarProvider } from "./components/ui/sidebar";
import { MainNavigation } from "./components/main-navigation";
import { ThemeProvider } from "./util/theme/useTheme";
import { KindeProvider, useKindeAuth } from "@kinde-oss/kinde-auth-react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { EditorContainer } from "./components/ui/editor";
import { EditorKit } from "./components/editor/editor-kit";
import { usePlateEditor } from "platejs/react";
import { useEditorState } from "./util/editor/editorState";

import { useEffect, useState } from "react";
import remarkMath from "remark-math";
import remarkEmoji from "remark-emoji";
import remarkGfm from "remark-gfm";
import { MarkdownPlugin, remarkMdx, remarkMention } from "@platejs/markdown";
import { Plate } from "platejs/react";
import { serializeHtml } from "platejs";

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

function AuthenticatedLayout({
  children,
  setGettingHtml,
}: {
  children: React.ReactNode;
  setGettingHtml: (gettingHtml: boolean) => void;
}) {
  const { isAuthenticated, isLoading } = useKindeAuth();

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
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
      <AppSidebar />
      <div className="flex-1 flex flex-col w-full overflow-hidden">
        <MainNavigation setGettingHtml={setGettingHtml} />
        <main
          className="overflow-auto"
          style={{ height: "calc(100vh - 4rem)" }}
        >
          {children}
        </main>
      </div>
    </SidebarProvider>
  );
}

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { editor, setEditor } = useEditorState();
  const editorComponent = usePlateEditor({
    plugins: EditorKit,
    value: (editor) =>
      editor.getApi(MarkdownPlugin).markdown.deserialize("", {
        remarkPlugins: [
          remarkMath,
          remarkGfm,
          remarkMdx,
          remarkMention,
          remarkEmoji as any,
        ],
      }),
  });
  const [html, setHtml] = useState<string>("");
  const [gettingHtml, setGettingHtml] = useState<boolean>(false);
  useEffect(() => {
    setEditor(editorComponent as any);
  }, [editor]);

  useEffect(() => {
    console.log("editor", editor);
    if (editor && gettingHtml) {
      console.log(editor);
      serializeHtml(editorComponent).then((html) => {
        console.log("Editor html:", html);
        setHtml(html);
        setGettingHtml(false);
      });
    }
  }, [editor, gettingHtml]);

  return (
    <KindeProvider
      clientId={import.meta.env.VITE_KINDE_CLIENT_ID}
      domain={import.meta.env.VITE_KINDE_DOMAIN}
      redirectUri={import.meta.env.VITE_KINDE_REDIRECT_URI}
      logoutUri={import.meta.env.VITE_KINDE_LOGOUT_URI}
    >
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <Plate editor={editor as any}>
            <EditorContainer>
              <AuthenticatedLayout setGettingHtml={setGettingHtml}>
                {children}
              </AuthenticatedLayout>
            </EditorContainer>
          </Plate>
        </ThemeProvider>
      </QueryClientProvider>
    </KindeProvider>
  );
}
