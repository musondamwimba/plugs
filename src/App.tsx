import { useState } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";
import AppSidebar from "@/components/AppSidebar";
import TopButtons from "@/components/TopButtons";
import Index from "./pages/Index";
import Map from "./pages/Map";
import Messages from "./pages/Messages";
import Uploads from "./pages/Uploads";
import MyProducts from "./pages/MyProducts";
import Profile from "./pages/Profile";
import Admin from "./pages/Admin";
import Cart from "./pages/Cart";
import Favorites from "./pages/Favorites";
import Wishlist from "./pages/Wishlist";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const AppLayout = ({ children }: { children: React.ReactNode }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const isAdmin = true; // TODO: Replace with actual auth logic

  return (
    <div className="min-h-screen bg-background">
      <AppSidebar 
        isOpen={sidebarOpen} 
        onClose={() => setSidebarOpen(false)} 
        isAdmin={isAdmin}
      />
      
      {/* Main Content */}
      <div className="min-h-screen flex flex-col">
        {/* Top Bar */}
        <header className="sticky top-0 z-30 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
          <div className="flex items-center justify-between px-6 py-4">
            <Button
              onClick={() => setSidebarOpen(true)}
              className="gap-2"
            >
              <Menu className="w-4 h-4" />
              Open Sidebar
            </Button>
            <TopButtons />
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 px-6 py-8 max-w-7xl mx-auto w-full">
          {children}
        </main>
      </div>
    </div>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<AppLayout><Index /></AppLayout>} />
          <Route path="/map" element={<AppLayout><Map /></AppLayout>} />
          <Route path="/messages" element={<AppLayout><Messages /></AppLayout>} />
          <Route path="/uploads" element={<AppLayout><Uploads /></AppLayout>} />
          <Route path="/my-products" element={<AppLayout><MyProducts /></AppLayout>} />
          <Route path="/profile" element={<AppLayout><Profile /></AppLayout>} />
          <Route path="/admin" element={<AppLayout><Admin /></AppLayout>} />
          <Route path="/cart" element={<AppLayout><Cart /></AppLayout>} />
          <Route path="/favorites" element={<AppLayout><Favorites /></AppLayout>} />
          <Route path="/wishlist" element={<AppLayout><Wishlist /></AppLayout>} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
