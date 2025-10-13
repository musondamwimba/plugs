import { Home, MapPin, MessageSquare, Upload, Package, User, Shield, LogOut } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface AppSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  isAdmin?: boolean;
}

const AppSidebar = ({ isOpen, onClose, isAdmin = false }: AppSidebarProps) => {
  const location = useLocation();
  
  const navItems = [
    { path: "/", label: "Home", icon: Home, color: "text-icon-home" },
    { path: "/map", label: "Map", icon: MapPin, color: "text-icon-map" },
    { path: "/messages", label: "Messages", icon: MessageSquare, color: "text-icon-messages" },
    { path: "/uploads", label: "Uploads", icon: Upload, color: "text-icon-uploads" },
    { path: "/my-products", label: "My Products", icon: Package, color: "text-icon-products" },
    { path: "/profile", label: "Profile", icon: User, color: "text-icon-profile" },
  ];

  if (isAdmin) {
    navItems.push({ path: "/admin", label: "Admin", icon: Shield, color: "text-icon-admin" });
  }

  const isActive = (path: string) => location.pathname === path;

  return (
    <>
      {/* Backdrop with blur */}
      <div
        className={cn(
          "fixed inset-0 bg-black/20 backdrop-blur-sm transition-opacity duration-300 z-40",
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
        onClick={onClose}
      />

      {/* Sidebar */}
      <div
        className={cn(
          "fixed left-0 top-0 h-full w-[25%] min-w-[250px] bg-sidebar border-r border-sidebar-border shadow-2xl z-50 transition-transform duration-300 ease-in-out",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex flex-col h-full p-6">
          {/* Close Button */}
          <Button
            onClick={onClose}
            variant="destructive"
            className="mb-6 w-full"
          >
            Close Sidebar
          </Button>

          {/* Navigation Items */}
          <nav className="flex-1 space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path);
              
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={onClose}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200",
                    active
                      ? "bg-sidebar-active text-sidebar-active-foreground font-semibold shadow-md"
                      : "hover:bg-secondary text-sidebar-foreground"
                  )}
                >
                  <Icon className={cn("w-5 h-5", !active && item.color)} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Logout Button */}
          <Button
            variant="destructive"
            className="w-full mt-auto flex items-center gap-2"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </Button>
        </div>
      </div>
    </>
  );
};

export default AppSidebar;
