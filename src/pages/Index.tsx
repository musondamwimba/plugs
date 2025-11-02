import { useState } from "react";
import SearchBar from "@/components/SearchBar";
import Slideshow from "@/components/Slideshow";
import ProductCard from "@/components/ProductCard";
import { useProducts } from "@/hooks/useProducts";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";

const Index = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [productType, setProductType] = useState<string>("both");
  const [sortBy, setSortBy] = useState<string>("default");
  const { products, isLoading } = useProducts();

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  let filteredProducts = searchQuery && products
    ? products.filter(p => {
        const matchesQuery = p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.description?.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesType = productType === "both" || p.product_type === productType;
        return matchesQuery && matchesType;
      })
    : products?.filter(p => productType === "both" || p.product_type === productType);

  // Sort products
  if (filteredProducts && sortBy !== "default") {
    filteredProducts = [...filteredProducts].sort((a, b) => {
      if (sortBy === "price_low") return a.price - b.price;
      if (sortBy === "price_high") return b.price - a.price;
      return 0;
    });
  }

  const showResults = searchQuery.length > 0;

  // Featured products algorithm: mix recent, random, and user's own products
  const getFeaturedProducts = () => {
    if (!products || products.length === 0) return [];
    
    // Shuffle products for variety
    const shuffled = [...products].sort(() => Math.random() - 0.5);
    
    // Take top 12 for featured section
    return shuffled.slice(0, 12);
  };

  const featuredProducts = !showResults ? getFeaturedProducts() : filteredProducts;

  return (
    <div className="space-y-8">
      {/* Welcome Title */}
      {!showResults && (
        <div className="text-center pt-4">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-primary via-accent to-warning bg-clip-text text-transparent mb-2">
            Welcome to PluGS
          </h1>
          <p className="text-muted-foreground text-lg">Your marketplace for everything</p>
        </div>
      )}

      {/* Search Bar */}
      <SearchBar onSearch={handleSearch} />

      {/* Filters - Show when searching */}
      {showResults && (
        <div className="flex gap-4 items-center flex-wrap">
          <Select value={productType} onValueChange={setProductType}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Product Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="both">Goods & Services</SelectItem>
              <SelectItem value="product">Goods Only</SelectItem>
              <SelectItem value="service">Services Only</SelectItem>
            </SelectContent>
          </Select>

          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Sort By" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="default">Default</SelectItem>
              <SelectItem value="price_low">Price: Low to High</SelectItem>
              <SelectItem value="price_high">Price: High to Low</SelectItem>
            </SelectContent>
          </Select>

          <Button variant="outline" onClick={() => {
            setSearchQuery("");
            setProductType("both");
            setSortBy("default");
          }}>
            Clear Filters
          </Button>
        </div>
      )}

      {/* Slideshow - Only show when not searching */}
      {!showResults && <Slideshow />}

      {/* Products */}
      <div>
        <h2 className="text-3xl font-bold mb-6">
          {showResults ? `Search Results (${filteredProducts?.length || 0})` : "Featured Products"}
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {isLoading ? (
            Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-80 rounded-lg" />
            ))
          ) : featuredProducts && featuredProducts.length > 0 ? (
            featuredProducts.map((product) => (
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
              <p className="text-muted-foreground">
                {showResults ? "No products found matching your search" : "No products available yet"}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Index;
