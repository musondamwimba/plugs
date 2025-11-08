-- Fix RLS policies for products table to allow vendors to see and manage their own products
-- regardless of subscription payment status

-- Drop existing policies
DROP POLICY IF EXISTS "Vendors can insert their own products" ON products;
DROP POLICY IF EXISTS "Vendors can update their own products" ON products;
DROP POLICY IF EXISTS "Vendors can delete their own products" ON products;
DROP POLICY IF EXISTS "Anyone can view active products with paid subscriptions" ON products;

-- Recreate policies with correct logic
-- Vendors can always insert their own products
CREATE POLICY "Vendors can insert their own products"
ON products
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = vendor_id);

-- Vendors can always view, update, and delete their own products (regardless of subscription status)
CREATE POLICY "Vendors can view their own products"
ON products
FOR SELECT
TO authenticated
USING (auth.uid() = vendor_id);

CREATE POLICY "Vendors can update their own products"
ON products
FOR UPDATE
TO authenticated
USING (auth.uid() = vendor_id);

CREATE POLICY "Vendors can delete their own products"
ON products
FOR DELETE
TO authenticated
USING (auth.uid() = vendor_id);

-- Other users can only view active products with paid subscriptions
CREATE POLICY "Public can view active paid products"
ON products
FOR SELECT
TO authenticated
USING (
  auth.uid() != vendor_id 
  AND is_active = true 
  AND is_sold = false 
  AND subscription_paid = true
);

-- Allow anonymous users to view active paid products too
CREATE POLICY "Anonymous can view active paid products"
ON products
FOR SELECT
TO anon
USING (
  is_active = true 
  AND is_sold = false 
  AND subscription_paid = true
);