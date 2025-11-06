-- Create trigger to automatically create subscriptions when products are uploaded
DROP TRIGGER IF EXISTS on_product_created ON products;

CREATE TRIGGER on_product_created
  AFTER INSERT ON products
  FOR EACH ROW
  EXECUTE FUNCTION create_product_subscription();

-- Create trigger to update product visibility when subscription status changes
DROP TRIGGER IF EXISTS on_subscription_updated ON subscriptions;

CREATE TRIGGER on_subscription_updated
  AFTER UPDATE OF is_paid ON subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION check_subscription_status();