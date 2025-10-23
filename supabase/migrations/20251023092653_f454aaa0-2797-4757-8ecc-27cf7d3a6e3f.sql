-- Add location_address to products if not exists
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS location_address TEXT;

-- Add balance to profiles if not exists
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS balance NUMERIC DEFAULT 0;

-- Update deposits table to include more payment methods
ALTER TABLE public.deposits ADD COLUMN IF NOT EXISTS account_number TEXT;
ALTER TABLE public.deposits ADD COLUMN IF NOT EXISTS phone_number TEXT;

-- Update withdrawals table
ALTER TABLE public.withdrawals ADD COLUMN IF NOT EXISTS account_number TEXT;
ALTER TABLE public.withdrawals ADD COLUMN IF NOT EXISTS phone_number TEXT;
ALTER TABLE public.withdrawals ADD COLUMN IF NOT EXISTS payment_method TEXT;

-- Add admin_fee to transactions
ALTER TABLE public.transactions ADD COLUMN IF NOT EXISTS admin_fee NUMERIC DEFAULT 0;

-- Add cash_payment_requested to cart_items
ALTER TABLE public.cart_items ADD COLUMN IF NOT EXISTS cash_payment_requested BOOLEAN DEFAULT false;