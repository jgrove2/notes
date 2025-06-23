import { AppSidebar } from "./components/app-sidebar";
import { SidebarProvider, SidebarTrigger } from "./components/ui/sidebar";

export default function MainLayout({ children }: { children: React.ReactNode }) {
    return (
        <SidebarProvider>
            <AppSidebar />
            <main className="flex-1 flex flex-col w-full h-full overflow-hidden">
                <SidebarTrigger />
                {children}
            </main>
        </SidebarProvider>
    )
}