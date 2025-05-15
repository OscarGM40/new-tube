import { SidebarProvider } from "@/components/ui/sidebar";
import { StudioNavbar } from "../components/studio-navbar";
import { StudioSidebar } from "../components/studio-sidebar";

interface StudioLayoutProps {
  children: React.ReactNode;
}

// ?Fijate que con el approach que tomó de sacar a modules todo lo posible usaremos named exports
export const StudioLayout = ({ children }: StudioLayoutProps) => {
  return (
    <SidebarProvider>
      <div className="w-full">
        <StudioNavbar />
        <div className="flex min-h-screen pt-[4rem]">
          <StudioSidebar />
          <main className="flex-1 overflow-y-auto">{children}</main>
        </div>
      </div>
    </SidebarProvider>
  );
};
