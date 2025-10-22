import { useState } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";
import AppSidebar from "@/components/AppSidebar";
import TopButtons from "@/components/TopButtons";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Map from "./pages/Map";
import Messages from "./pages/Messages";
import Uploads from "./pages/Uploads";
import MyProducts from "./pages/MyProducts";
import ProfileMenu from "./pages/ProfileMenu";
import PersonalInfo from "./pages/PersonalInfo";
import Deposit from "./pages/Deposit";
import Withdraw from "./pages/Withdraw";
import TransactionHistory from "./pages/TransactionHistory";
import Subscriptions from "./pages/Subscriptions";
import Admin from "./pages/Admin";
import Cart from "./pages/Cart";
import Favorites from "./pages/Favorites";
import Wishlist from "./pages/Wishlist";
import NotFound from "./pages/NotFound";

const AppLayout = ({ children }: { children: React.ReactNode }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  // You can integrate your AuthContext here: const { user } = useAuth();
  // Then set: const isAdmin = user?.role === "admin";
  const isAdmin = false; // Set to false by default - update with your auth

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
  <TooltipProvider>
    <Toaster />
    <Sonner />
    <BrowserRouter>
      <Routes>
        <Route path="/auth" element={<Auth />} />
        <Route path="/" element={<ProtectedRoute><AppLayout><Index /></AppLayout></ProtectedRoute>} />
        <Route path="/map" element={<ProtectedRoute><AppLayout><Map /></AppLayout></ProtectedRoute>} />
        <Route path="/messages" element={<ProtectedRoute><AppLayout><Messages /></AppLayout></ProtectedRoute>} />
        <Route path="/uploads" element={<ProtectedRoute><AppLayout><Uploads /></AppLayout></ProtectedRoute>} />
        <Route path="/my-products" element={<ProtectedRoute><AppLayout><MyProducts /></AppLayout></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><AppLayout><ProfileMenu /></AppLayout></ProtectedRoute>} />
        <Route path="/profile/personal-info" element={<ProtectedRoute><AppLayout><PersonalInfo /></AppLayout></ProtectedRoute>} />
        <Route path="/profile/deposit" element={<ProtectedRoute><AppLayout><Deposit /></AppLayout></ProtectedRoute>} />
        <Route path="/profile/withdraw" element={<ProtectedRoute><AppLayout><Withdraw /></AppLayout></ProtectedRoute>} />
        <Route path="/profile/transactions" element={<ProtectedRoute><AppLayout><TransactionHistory /></AppLayout></ProtectedRoute>} />
        <Route path="/profile/subscriptions" element={<ProtectedRoute><AppLayout><Subscriptions /></AppLayout></ProtectedRoute>} />
        <Route path="/admin" element={<ProtectedRoute><AppLayout><Admin /></AppLayout></ProtectedRoute>} />
        <Route path="/cart" element={<ProtectedRoute><AppLayout><Cart /></AppLayout></ProtectedRoute>} />
        <Route path="/favorites" element={<ProtectedRoute><AppLayout><Favorites /></AppLayout></ProtectedRoute>} />
        <Route path="/wishlist" element={<ProtectedRoute><AppLayout><Wishlist /></AppLayout></ProtectedRoute>} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  </TooltipProvider>
);

export default App;
