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
import { useRoles } from "@/hooks/useRoles";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Map from "./pages/Map";
import Messages from "./pages/Messages";
import Uploads from "./pages/Uploads";
import MyProducts from "./pages/MyProducts";
import Admin from "./pages/Admin";
import ProfileMenu from "./pages/ProfileMenu";
import ProductEdit from "./pages/ProductEdit";
import ProductDetails from "./pages/ProductDetails";
import PersonalInfo from "./pages/PersonalInfo";
import Deposit from "./pages/Deposit";
import Withdraw from "./pages/Withdraw";
import TransactionHistory from "./pages/TransactionHistory";
import Subscriptions from "./pages/Subscriptions";
import Cart from "./pages/Cart";
import Favorites from "./pages/Favorites";
import Checkout from "./pages/Checkout";
import ResetPassword from "./pages/ResetPassword";
import NotFound from "./pages/NotFound";

const AdminGuard = ({ children }: { children: React.ReactNode }) => {
  const { isAdmin, isLoading } = useRoles();

  if (isLoading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  if (!isAdmin) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Access Denied</h1>
          <p className="text-muted-foreground">You do not have permission to access this page.</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

const AppLayout = ({ children }: { children: React.ReactNode }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      <AppSidebar 
        isOpen={sidebarOpen} 
        onClose={() => setSidebarOpen(false)}
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
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/" element={<ProtectedRoute><AppLayout><Index /></AppLayout></ProtectedRoute>} />
        <Route path="/map" element={<ProtectedRoute><AppLayout><Map /></AppLayout></ProtectedRoute>} />
        <Route path="/messages" element={<ProtectedRoute><AppLayout><Messages /></AppLayout></ProtectedRoute>} />
        <Route path="/uploads" element={<ProtectedRoute><AppLayout><Uploads /></AppLayout></ProtectedRoute>} />
        <Route path="/my-products" element={<ProtectedRoute><AppLayout><MyProducts /></AppLayout></ProtectedRoute>} />
        <Route path="/product/edit/:id" element={<ProtectedRoute><AppLayout><ProductEdit /></AppLayout></ProtectedRoute>} />
        <Route path="/product/:id" element={<ProtectedRoute><AppLayout><ProductDetails /></AppLayout></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><AppLayout><ProfileMenu /></AppLayout></ProtectedRoute>} />
        <Route path="/profile/personal-info" element={<ProtectedRoute><AppLayout><PersonalInfo /></AppLayout></ProtectedRoute>} />
        <Route path="/profile/deposit" element={<ProtectedRoute><AppLayout><Deposit /></AppLayout></ProtectedRoute>} />
        <Route path="/profile/withdraw" element={<ProtectedRoute><AppLayout><Withdraw /></AppLayout></ProtectedRoute>} />
        <Route path="/profile/transactions" element={<ProtectedRoute><AppLayout><TransactionHistory /></AppLayout></ProtectedRoute>} />
        <Route path="/profile/subscriptions" element={<ProtectedRoute><AppLayout><Subscriptions /></AppLayout></ProtectedRoute>} />
        <Route path="/admin" element={
          <ProtectedRoute>
            <AppLayout>
              <AdminGuard>
                <Admin />
              </AdminGuard>
            </AppLayout>
          </ProtectedRoute>
        } />
        <Route path="/cart" element={<ProtectedRoute><AppLayout><Cart /></AppLayout></ProtectedRoute>} />
        <Route path="/checkout" element={<ProtectedRoute><AppLayout><Checkout /></AppLayout></ProtectedRoute>} />
        <Route path="/favorites" element={<ProtectedRoute><AppLayout><Favorites /></AppLayout></ProtectedRoute>} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  </TooltipProvider>
);

export default App;
