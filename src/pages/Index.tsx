import { useState } from "react";
import { useNavigate } from "react-router-dom";
import SearchBar from "@/components/SearchBar";
import Slideshow from "@/components/Slideshow";
import ProductCard from "@/components/ProductCard";
import { useProducts } from "@/hooks/useProducts";
import { useWinningBids } from "@/hooks/useWinningBids";
import { useCart } from "@/hooks/useCart";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ShoppingCart } from "lucide-react";
import { fuzzySearchProducts } from "@/lib/fuzzySearch";

const Index = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [productType, setProductType] = useState<string>("both");
  const [sortBy, setSortBy] = useState<string>("default");
  const { products, isLoading } = useProducts();
  const { winningBids } = useWinningBids();
  const { addToCart } = useCart();
  const { toast } = useToast();

  const handleAddWinningBidToCart = async (productId: string, bidId: string) => {
    try {
      addToCart(productId);
      toast({
        title: "Added to cart",
        description: "Your winning bid item has been added to cart. Please complete checkout within 48 hours.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  // Apply fuzzy search and type filter
  let filteredProducts = (() => {
    if (!products) return [];
    
    // Filter by type first
    let typeFiltered = products.filter(p => productType === "both" || p.product_type === productType);
    
    // Apply fuzzy search if there's a query
    if (searchQuery) {
      return fuzzySearchProducts(typeFiltered, searchQuery);
    }
    
    return typeFiltered;
  })();

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
      {/* Winning Bids Section */}
      {winningBids && winningBids.length > 0 && (
        <Card className="border-primary/50 bg-primary/5">
          <CardContent className="p-6">
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
              🎉 Your Winning Bids
            </h2>
            <p className="text-sm text-muted-foreground mb-4">
              Congratulations! You won these auctions. Add them to cart and complete checkout within 48 hours.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {winningBids.map((bid: any) => (
                <div key={bid.id} className="border rounded-lg p-4 bg-background space-y-3">
                  <div className="flex items-start gap-3">
                    {bid.products?.product_images?.[0] && (
                      <img 
                        src={bid.products.product_images[0].image_url} 
                        alt={bid.products.name}
                        className="w-20 h-20 object-cover rounded"
                      />
                    )}
                    <div className="flex-1">
                      <h3 className="font-semibold">{bid.products?.name}</h3>
                      <p className="text-lg font-bold text-primary">ZMK {bid.amount}</p>
                      <p className="text-xs text-muted-foreground">
                        Deadline: {new Date(bid.payment_deadline).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <Button 
                    onClick={() => handleAddWinningBidToCart(bid.products.id, bid.id)}
                    className="w-full"
                    size="sm"
                  >
                    <ShoppingCart className="w-4 h-4 mr-2" />
                    Add to Cart
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

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
            featuredProducts.map((product) => {
              const highestBid = product.bids && product.bids.length > 0
                ? Math.max(...product.bids.map((b: any) => b.amount))
                : undefined;

              return (
              <ProductCard 
                  key={product.id}
                  id={product.id}
                  name={product.name}
                  price={product.price}
                  description={product.description || ''}
                  image={product.product_images?.[0]?.image_url}
                  is_bid={product.is_bid}
                  bid_end_time={product.bid_end_time}
                  starting_bid={product.starting_bid}
                  currentHighestBid={highestBid}
                  bids={product.bids}
                  vendor_id={product.vendor_id}
                />
              );
            })
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
