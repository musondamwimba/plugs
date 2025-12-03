import ProductCard from "@/components/ProductCard";
import { Star } from "lucide-react";
import { useFavorites } from "@/hooks/useFavorites";
import { Skeleton } from "@/components/ui/skeleton";

const Favorites = () => {
  const { favorites, isLoading } = useFavorites();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Star className="w-8 h-8 text-icon-favorites" />
          <h1 className="text-3xl font-bold">Favorites</h1>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-64" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Star className="w-8 h-8 text-icon-favorites" />
        <h1 className="text-3xl font-bold">Favorites</h1>
      </div>
      {!favorites || favorites.length === 0 ? (
        <div className="text-center py-12">
          <Star className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2">No favorites yet</h3>
          <p className="text-muted-foreground">
            Start adding products to your favorites!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {favorites.map((fav: any) => (
            <ProductCard
              key={fav.id}
              id={fav.products.id}
              name={fav.products.name}
              price={fav.products.price}
              description={fav.products.description}
              image={fav.products.product_images?.[0]?.image_url}
              vendor_id={fav.products.vendor_id}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default Favorites;
