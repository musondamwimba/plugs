-- Create user status enum
CREATE TYPE public.user_status AS ENUM ('active', 'suspended', 'banned', 'blocked');

-- Create user moderation table
CREATE TABLE public.user_moderation (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status public.user_status NOT NULL DEFAULT 'active',
  reason TEXT,
  fine_amount NUMERIC DEFAULT 0,
  moderated_by UUID REFERENCES auth.users(id),
  moderated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id)
);

-- Create theme settings table
CREATE TABLE public.theme_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  primary_color TEXT NOT NULL DEFAULT '217 91% 60%',
  accent_color TEXT NOT NULL DEFAULT '262 83% 58%',
  background_color TEXT NOT NULL DEFAULT '0 0% 100%',
  foreground_color TEXT NOT NULL DEFAULT '222 47% 11%',
  border_radius TEXT NOT NULL DEFAULT '0.75rem',
  updated_by UUID REFERENCES auth.users(id),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Insert default theme
INSERT INTO public.theme_settings (id) VALUES ('00000000-0000-0000-0000-000000000001');

-- Create admin actions log
CREATE TABLE public.admin_actions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID NOT NULL REFERENCES auth.users(id),
  action_type TEXT NOT NULL,
  target_user_id UUID REFERENCES auth.users(id),
  details JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.user_moderation ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.theme_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_actions ENABLE ROW LEVEL SECURITY;

-- Policies for user_moderation
CREATE POLICY "Users can view their own moderation status"
  ON public.user_moderation FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage user moderation"
  ON public.user_moderation FOR ALL
  USING (has_role(auth.uid(), 'admin'));

-- Policies for theme_settings
CREATE POLICY "Everyone can view theme settings"
  ON public.theme_settings FOR SELECT
  USING (true);

CREATE POLICY "Admins can update theme settings"
  ON public.theme_settings FOR UPDATE
  USING (has_role(auth.uid(), 'admin'));

-- Policies for admin_actions
CREATE POLICY "Admins can view all actions"
  ON public.admin_actions FOR SELECT
  USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can log actions"
  ON public.admin_actions FOR INSERT
  WITH CHECK (has_role(auth.uid(), 'admin'));

-- Trigger for updated_at
CREATE TRIGGER update_user_moderation_updated_at
  BEFORE UPDATE ON public.user_moderation
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_theme_settings_updated_at
  BEFORE UPDATE ON public.theme_settings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();