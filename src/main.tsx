import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "./contexts/AuthContext";
import App from "./App.tsx";
import "./index.css";

const queryClient = new QueryClient();

// Apply theme on app load
const applyTheme = async () => {
  try {
    const { supabase } = await import("@/integrations/supabase/client");
    const { data: theme } = await supabase
      .from('theme_settings')
      .select('*')
      .single();
    
    if (theme) {
      const root = document.documentElement;
      root.style.setProperty('--primary', theme.primary_color);
      root.style.setProperty('--accent', theme.accent_color);
      root.style.setProperty('--background', theme.background_color);
      root.style.setProperty('--foreground', theme.foreground_color);
      root.style.setProperty('--radius', theme.border_radius);
    }
  } catch (error) {
    console.error('Error loading theme:', error);
  }
};

applyTheme();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <App />
      </AuthProvider>
    </QueryClientProvider>
  </StrictMode>,
);
