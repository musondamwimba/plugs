-- Fix subscription_paid default to false (products hidden until paid)
ALTER TABLE products ALTER COLUMN subscription_paid SET DEFAULT false;

-- Update existing products to require payment
UPDATE products SET subscription_paid = false WHERE subscription_paid = true;

-- Create function to auto-create subscription on product insert
CREATE OR REPLACE FUNCTION create_product_subscription()
RETURNS trigger AS $$
DECLARE
  subscription_amount numeric;
BEGIN
  -- Get subscription fee from admin settings
  SELECT (setting_value->>'value')::numeric INTO subscription_amount
  FROM admin_settings
  WHERE setting_key = 'subscription_fee';
  
  -- Default to 50 if not set
  IF subscription_amount IS NULL THEN
    subscription_amount := 50;
  END IF;
  
  -- Create subscription for the product
  INSERT INTO subscriptions (
    user_id,
    product_id,
    amount,
    subscription_type,
    due_date,
    is_paid,
    status
  ) VALUES (
    NEW.vendor_id,
    NEW.id,
    subscription_amount,
    'per_product',
    NOW() + INTERVAL '30 days',
    false,
    'active'
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger to auto-create subscriptions
DROP TRIGGER IF EXISTS create_subscription_on_product_insert ON products;
CREATE TRIGGER create_subscription_on_product_insert
  AFTER INSERT ON products
  FOR EACH ROW
  EXECUTE FUNCTION create_product_subscription();

-- Function to get all users with profiles (for admin dashboard)
CREATE OR REPLACE FUNCTION get_all_users_with_profiles()
RETURNS TABLE (
  id uuid,
  email text,
  full_name text,
  phone_number text,
  balance numeric,
  created_at timestamptz,
  deleted_at timestamptz,
  user_moderation jsonb
) 
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    au.id,
    au.email,
    COALESCE(p.full_name, '') as full_name,
    p.phone_number,
    COALESCE(p.balance, 0) as balance,
    au.created_at,
    p.deleted_at,
    (
      SELECT jsonb_agg(
        jsonb_build_object(
          'status', um.status,
          'reason', um.reason,
          'fine_amount', um.fine_amount,
          'expires_at', um.expires_at
        )
      )
      FROM user_moderation um
      WHERE um.user_id = au.id
    ) as user_moderation
  FROM auth.users au
  LEFT JOIN profiles p ON au.id = p.id
  WHERE p.deleted_at IS NULL OR p.deleted_at IS NOT NULL
  ORDER BY au.created_at DESC;
END;
$$ LANGUAGE plpgsql;