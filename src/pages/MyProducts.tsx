import { Button } from "@/components/ui/button";
import ProductCard from "@/components/ProductCard";
import { Plus } from "lucide-react";
import { useMyProducts } from "@/hooks/useProducts";
import { Skeleton } from "@/components/ui/skeleton";
import { useNavigate } from "react-router-dom";

const MyProducts = () => {
  const { products, isLoading } = useMyProducts();
  const navigate = useNavigate();

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
            <ProductCard 
              key={product.id}
              id={product.id}
              name={product.name}
              price={product.price}
              description={product.description || ''}
              image={product.product_images?.[0]?.image_url}
            />
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
