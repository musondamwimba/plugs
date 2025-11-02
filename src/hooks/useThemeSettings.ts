import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useEffect } from 'react';

export function useThemeSettings() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: theme, isLoading } = useQuery({
    queryKey: ['theme-settings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('theme_settings')
        .select('*')
        .single();

      if (error) throw error;
      return data;
    },
  });

  // Apply theme to document root
  useEffect(() => {
    if (theme) {
      const root = document.documentElement;
      root.style.setProperty('--primary', theme.primary_color);
      root.style.setProperty('--accent', theme.accent_color);
      root.style.setProperty('--background', theme.background_color);
      root.style.setProperty('--foreground', theme.foreground_color);
      root.style.setProperty('--radius', theme.border_radius);
    }
  }, [theme]);

  const updateTheme = useMutation({
    mutationFn: async (updates: {
      primary_color?: string;
      accent_color?: string;
      background_color?: string;
      foreground_color?: string;
      border_radius?: string;
      wallpaper_url?: string;
      logo_url?: string;
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('theme_settings')
        .update({
          ...updates,
          updated_by: user.id,
        })
        .eq('id', '00000000-0000-0000-0000-000000000001')
        .select()
        .single();

      if (error) throw error;

      // Log admin action
      await supabase.from('admin_actions').insert({
        admin_id: user.id,
        action_type: 'theme_update',
        details: updates
      });

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['theme-settings'] });
      toast({
        title: "Theme updated",
        description: "Theme settings have been applied to all users.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return {
    theme,
    isLoading,
    updateTheme: updateTheme.mutate,
  };
}
