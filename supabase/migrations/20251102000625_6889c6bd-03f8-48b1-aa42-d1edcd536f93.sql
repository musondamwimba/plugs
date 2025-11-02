-- Add wallpaper support to theme_settings
ALTER TABLE public.theme_settings
ADD COLUMN wallpaper_url text,
ADD COLUMN logo_url text;

-- Create outlets table for retail shops
CREATE TABLE public.outlets (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  vendor_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  location_lat numeric,
  location_lng numeric,
  location_address text,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

ALTER TABLE public.outlets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Vendors can view their own outlets"
ON public.outlets FOR SELECT
USING (auth.uid() = vendor_id);

CREATE POLICY "Vendors can create outlets"
ON public.outlets FOR INSERT
WITH CHECK (auth.uid() = vendor_id);

CREATE POLICY "Vendors can update their outlets"
ON public.outlets FOR UPDATE
USING (auth.uid() = vendor_id);

CREATE POLICY "Vendors can delete their outlets"
ON public.outlets FOR DELETE
USING (auth.uid() = vendor_id);

-- Create brochures table for retail shop marketing materials
CREATE TABLE public.brochures (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  outlet_id uuid NOT NULL REFERENCES public.outlets(id) ON DELETE CASCADE,
  vendor_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  brochure_url text NOT NULL,
  brochure_type text CHECK (brochure_type IN ('brochure', 'catalog', 'magazine', 'product_images')),
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

ALTER TABLE public.brochures ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active brochures"
ON public.brochures FOR SELECT
USING (is_active = true);

CREATE POLICY "Vendors can create brochures"
ON public.brochures FOR INSERT
WITH CHECK (auth.uid() = vendor_id);

CREATE POLICY "Vendors can update their brochures"
ON public.brochures FOR UPDATE
USING (auth.uid() = vendor_id);

CREATE POLICY "Vendors can delete their brochures"
ON public.brochures FOR DELETE
USING (auth.uid() = vendor_id);

-- Add retail shop support to products
ALTER TABLE public.products
ADD COLUMN is_retail_shop boolean DEFAULT false,
ADD COLUMN outlet_id uuid REFERENCES public.outlets(id) ON DELETE SET NULL;

-- Update subscriptions to support per-location charging
ALTER TABLE public.subscriptions
ADD COLUMN subscription_type text CHECK (subscription_type IN ('per_product', 'per_location')) DEFAULT 'per_product',
ADD COLUMN outlet_id uuid REFERENCES public.outlets(id) ON DELETE SET NULL;

-- Create payment processing table for secure transaction tracking
CREATE TABLE public.payment_transactions (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  transaction_type text NOT NULL CHECK (transaction_type IN ('deposit', 'withdrawal')),
  amount numeric NOT NULL,
  fee numeric NOT NULL DEFAULT 0,
  payment_method text NOT NULL,
  payment_provider text,
  external_transaction_id text,
  phone_number text,
  account_number text,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'cancelled')),
  verification_code text,
  verified_at timestamp with time zone,
  completed_at timestamp with time zone,
  failed_reason text,
  metadata jsonb,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

ALTER TABLE public.payment_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own transactions"
ON public.payment_transactions FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create transactions"
ON public.payment_transactions FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Admins can view all transactions
CREATE POLICY "Admins can view all transactions"
ON public.payment_transactions FOR SELECT
USING (has_role(auth.uid(), 'admin'));

-- Admins can update transaction status
CREATE POLICY "Admins can update transactions"
ON public.payment_transactions FOR UPDATE
USING (has_role(auth.uid(), 'admin'));

-- Create trigger for updated_at
CREATE TRIGGER update_outlets_updated_at
  BEFORE UPDATE ON public.outlets
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_brochures_updated_at
  BEFORE UPDATE ON public.brochures
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_payment_transactions_updated_at
  BEFORE UPDATE ON public.payment_transactions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();