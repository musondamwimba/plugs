-- Create admin_settings table for fee configuration
CREATE TABLE IF NOT EXISTS public.admin_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  setting_key text UNIQUE NOT NULL,
  setting_value jsonb NOT NULL,
  updated_at timestamp with time zone DEFAULT now(),
  updated_by uuid REFERENCES auth.users(id)
);

ALTER TABLE public.admin_settings ENABLE ROW LEVEL SECURITY;

-- Everyone can read settings
CREATE POLICY "Anyone can view admin settings"
  ON public.admin_settings
  FOR SELECT
  USING (true);

-- Only admins can update settings
CREATE POLICY "Admins can update settings"
  ON public.admin_settings
  FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Insert default settings
INSERT INTO public.admin_settings (setting_key, setting_value) VALUES
  ('deposit_fee', '{"type": "percentage", "value": 5}'::jsonb),
  ('admin_fee', '{"type": "percentage", "value": 10}'::jsonb),
  ('subscription_fee', '{"type": "fixed", "value": 50}'::jsonb)
ON CONFLICT (setting_key) DO NOTHING;

-- Add deleted_at column to profiles for soft delete
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS deleted_at timestamp with time zone,
ADD COLUMN IF NOT EXISTS deletion_scheduled_for timestamp with time zone;

-- Update profile RLS policies to exclude deleted accounts
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
CREATE POLICY "Users can view their own profile"
  ON public.profiles
  FOR SELECT
  USING (auth.uid() = id AND deleted_at IS NULL);