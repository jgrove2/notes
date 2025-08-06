import { AppSidebar } from "./components/app-sidebar";
import { SidebarProvider } from "./components/ui/sidebar";
import { MainNavigation } from "./components/main-navigation";
import { ThemeProvider } from "./util/theme/useTheme";
import { KindeProvider, useKindeAuth } from "@kinde-oss/kinde-auth-react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

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
        <MainNavigation />
        <main
          className="overflow-hidden"
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
  return (
    <KindeProvider
      clientId={import.meta.env.VITE_KINDE_CLIENT_ID}
      domain={import.meta.env.VITE_KINDE_DOMAIN}
      redirectUri={import.meta.env.VITE_KINDE_REDIRECT_URI}
      logoutUri={import.meta.env.VITE_KINDE_LOGOUT_URI}
    >
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <AuthenticatedLayout>{children}</AuthenticatedLayout>
        </ThemeProvider>
      </QueryClientProvider>
    </KindeProvider>
  );
}
