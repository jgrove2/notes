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
      clientId="0f53e84aa89845a5a5d9e02225e244b3"
      domain="https://jgrove.kinde.com"
      redirectUri="http://localhost:3000"
      logoutUri="http://localhost:3000"
    >
      <ThemeProvider>
        <SidebarProvider>
          <AppSidebar />
          <div className="flex-1 flex flex-col w-full overflow-hidden">
            <MainNavigation />
            <main className="flex-1 overflow-hidden">{children}</main>
          </div>
        </SidebarProvider>
      </ThemeProvider>
    </KindeProvider>
  );
}
