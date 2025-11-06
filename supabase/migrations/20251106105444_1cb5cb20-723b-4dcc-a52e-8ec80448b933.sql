-- Fix product_condition enum to have correct values (New, Used, Refurbished)

-- Step 1: Create the new enum type with correct values
CREATE TYPE product_condition_new AS ENUM ('new', 'used', 'refurbished');

-- Step 2: Add a temporary column with the new type
ALTER TABLE products ADD COLUMN condition_new product_condition_new;

-- Step 3: Map old values to new values
UPDATE products SET condition_new = 
  CASE 
    WHEN condition::text = 'new' THEN 'new'::product_condition_new
    WHEN condition::text IN ('like_new', 'good', 'fair', 'poor') THEN 'used'::product_condition_new
    ELSE 'new'::product_condition_new
  END;

-- Step 4: Drop the old column
ALTER TABLE products DROP COLUMN condition;

-- Step 5: Rename the new column to condition
ALTER TABLE products RENAME COLUMN condition_new TO condition;

-- Step 6: Drop the old enum type
DROP TYPE IF EXISTS product_condition;

-- Step 7: Rename the new enum type
ALTER TYPE product_condition_new RENAME TO product_condition;