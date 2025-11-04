import { Button } from "@/components/ui/button";
import ProductCard from "@/components/ProductCard";
import { Plus, Trash2 } from "lucide-react";
import { useMyProducts } from "@/hooks/useProducts";
import { Skeleton } from "@/components/ui/skeleton";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

const MyProducts = () => {
  const { products, isLoading } = useMyProducts();
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const handleProductClick = (productId: string) => {
    navigate(`/product/edit/${productId}`);
  };

  const handleDeleteProduct = async (productId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    
    try {
      // First delete related subscriptions
      await supabase
        .from('subscriptions')
        .delete()
        .eq('product_id', productId);

      // Then delete the product
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', productId);

      if (error) throw error;

      queryClient.invalidateQueries({ queryKey: ['my-products'] });
      queryClient.invalidateQueries({ queryKey: ['subscriptions'] });
      toast({
        title: "Product deleted",
        description: "Your product and its subscription have been deleted successfully.",
      });
    } catch (error: any) {
      toast({
        title: "Error deleting product",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">My Products</h1>
      <p className="text-muted-foreground">All products uploaded in the Uploads page will appear here. Click to edit.</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-80 rounded-lg" />
          ))
        ) : products && products.length > 0 ? (
          products.map((product) => (
            <div key={product.id} className="relative group">
              <div onClick={() => handleProductClick(product.id)} className="cursor-pointer">
                <ProductCard 
                  id={product.id}
                  name={product.name}
                  price={product.price}
                  description={product.description || ''}
                  image={product.product_images?.[0]?.image_url}
                />
              </div>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button 
                    variant="destructive" 
                    size="icon" 
                    className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete Product</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to delete "{product.name}"? This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={(e) => handleDeleteProduct(product.id, e)}>
                      Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          ))
        ) : (
          <div className="col-span-full text-center py-12">
            <p className="text-muted-foreground">You haven't listed any products yet</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyProducts;
