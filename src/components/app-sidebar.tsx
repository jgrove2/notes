import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarGroup,
  useSidebar,
} from "./ui/sidebar";

export function AppSidebar() {
  const { state, open, openMobile, setOpenMobile, isMobile, toggleSidebar } =
    useSidebar();

  return (
    <Sidebar
      side="left"
      variant={isMobile ? "floating" : "sidebar"}
      collapsible={isMobile ? "icon" : "offcanvas"}
    >
      <SidebarHeader></SidebarHeader>
      <SidebarContent>
        <SidebarGroup></SidebarGroup>
        <SidebarGroup></SidebarGroup>
      </SidebarContent>
      <SidebarFooter></SidebarFooter>
    </Sidebar>
  );
}
