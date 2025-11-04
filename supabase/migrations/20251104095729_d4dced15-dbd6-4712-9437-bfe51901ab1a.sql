-- Insert default admin settings if they don't exist
INSERT INTO admin_settings (setting_key, setting_value)
VALUES 
  ('deposit_fee', '{"type": "percentage", "value": 5}'::jsonb),
  ('admin_fee', '{"type": "percentage", "value": 10}'::jsonb),
  ('subscription_fee', '{"type": "fixed", "value": 50}'::jsonb)
ON CONFLICT (setting_key) DO NOTHING;