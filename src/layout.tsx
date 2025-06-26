import { AppSidebar } from "./components/app-sidebar";
import { SidebarProvider } from "./components/ui/sidebar";
import { MainNavigation } from "./components/main-navigation";
import { ThemeProvider } from "./util/theme/useTheme";
import { KindeProvider } from "@kinde-oss/kinde-auth-react";

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
      <ThemeProvider>
        <SidebarProvider>
          <AppSidebar />
          <div className="flex-1 flex flex-col w-full overflow-hidden">
            <MainNavigation />
            <main className="overflow-hidden" style={{height: "calc(100vh - 4rem)"}}>{children}</main>
          </div>
        </SidebarProvider>
      </ThemeProvider>
    </KindeProvider>
  );
}
