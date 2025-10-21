import { useState } from "react";
import SearchBar from "@/components/SearchBar";
import Slideshow from "@/components/Slideshow";
import ProductCard from "@/components/ProductCard";
import { useProducts } from "@/hooks/useProducts";
import { Skeleton } from "@/components/ui/skeleton";

const Index = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const { products, isLoading } = useProducts();

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const filteredProducts = searchQuery && products
    ? products.filter(p => 
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.description?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : products;

  return (
    <div className="space-y-8">
      {/* Welcome Title */}
      <div className="text-center pt-4">
        <h1 className="text-5xl font-bold bg-gradient-to-r from-primary via-accent to-warning bg-clip-text text-transparent mb-2">
          Welcome to PluGS
        </h1>
        <p className="text-muted-foreground text-lg">Your marketplace for everything</p>
      </div>

      {/* Search Bar */}
      <SearchBar onSearch={handleSearch} />

      {/* Slideshow */}
      <Slideshow />

      {/* Featured Products */}
      <div>
        <h2 className="text-3xl font-bold mb-6">Featured Products</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {isLoading ? (
            Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-80 rounded-lg" />
            ))
          ) : filteredProducts && filteredProducts.length > 0 ? (
            filteredProducts.map((product) => (
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
              <p className="text-muted-foreground">No products available yet</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Index;
