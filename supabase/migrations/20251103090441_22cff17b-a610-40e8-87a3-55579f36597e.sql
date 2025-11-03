-- Add payment deadline tracking for winning bids
ALTER TABLE bids ADD COLUMN is_winning_bid boolean DEFAULT false;
ALTER TABLE bids ADD COLUMN payment_deadline timestamp with time zone;
ALTER TABLE bids ADD COLUMN payment_status text DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'failed', 'declined'));

-- Add subscription payment tracking
ALTER TABLE subscriptions ADD COLUMN is_paid boolean DEFAULT false;
ALTER TABLE subscriptions ADD COLUMN last_payment_date timestamp with time zone;

-- Update products to track if they should be visible based on subscription
ALTER TABLE products ADD COLUMN subscription_paid boolean DEFAULT true;

-- Add function to check and hide products with unpaid subscriptions
CREATE OR REPLACE FUNCTION check_subscription_status()
RETURNS trigger AS $$
BEGIN
  -- If subscription is not paid, hide the product
  IF NEW.is_paid = false THEN
    UPDATE products 
    SET subscription_paid = false 
    WHERE id = NEW.product_id;
  ELSE
    UPDATE products 
    SET subscription_paid = true 
    WHERE id = NEW.product_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger for subscription status updates
CREATE TRIGGER on_subscription_status_change
  AFTER INSERT OR UPDATE ON subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION check_subscription_status();

-- Add admin payment account info
CREATE TABLE IF NOT EXISTS admin_payment_accounts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  account_type text NOT NULL CHECK (account_type IN ('mobile_money', 'bank_transfer')),
  provider text NOT NULL,
  account_number text NOT NULL,
  account_name text NOT NULL,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now()
);

ALTER TABLE admin_payment_accounts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active admin payment accounts"
  ON admin_payment_accounts FOR SELECT
  USING (is_active = true);

CREATE POLICY "Only admins can manage payment accounts"
  ON admin_payment_accounts FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));