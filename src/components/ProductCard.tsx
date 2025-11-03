import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Heart, ShoppingCart } from "lucide-react";
import { useCart } from "@/hooks/useCart";
import { useFavorites } from "@/hooks/useFavorites";
import { useNavigate } from "react-router-dom";

interface ProductCardProps {
  id?: string;
  name: string;
  price: number;
  image?: string;
  description?: string;
  is_bid?: boolean;
  bid_end_time?: string;
  starting_bid?: number;
  currentHighestBid?: number;
}

const ProductCard = ({ 
  id, 
  name, 
  price, 
  image, 
  description, 
  is_bid = false,
  bid_end_time,
  starting_bid,
  currentHighestBid 
}: ProductCardProps) => {
  const { addToCart } = useCart();
  const { addFavorite, removeFavorite, favorites } = useFavorites();
  const navigate = useNavigate();
  
  const isFavorite = favorites?.some((fav: any) => fav.product_id === id);
  const isExpired = bid_end_time ? new Date(bid_end_time) < new Date() : false;

  const handleViewDetails = () => {
    if (id) navigate(`/product/${id}`);
  };

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer" onClick={handleViewDetails}>
      <div className="aspect-square bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
        {image ? (
          <img src={image} alt={name} className="w-full h-full object-cover" />
        ) : (
          <span className="text-4xl">📦</span>
        )}
      </div>
      <CardHeader className="p-4 pb-2">
        <h3 className="font-semibold text-lg line-clamp-2">{name}</h3>
        {description && (
          <p className="text-sm text-muted-foreground line-clamp-2">{description}</p>
        )}
      </CardHeader>
      <CardContent className="p-4 pt-2">
        {is_bid ? (
          <div className="space-y-2">
            <div className="flex items-baseline gap-2">
              <span className="text-sm text-muted-foreground">Current Bid:</span>
              <span className="text-xl font-bold text-primary">
                {(currentHighestBid || starting_bid || 0).toLocaleString()}
              </span>
              <span className="text-sm text-muted-foreground">ZMK</span>
            </div>
            {bid_end_time && (
              <p className="text-xs text-muted-foreground">
                {isExpired ? "Bidding ended" : `Ends: ${new Date(bid_end_time).toLocaleString()}`}
              </p>
            )}
          </div>
        ) : (
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-primary">{price.toLocaleString()}</span>
            <span className="text-sm text-muted-foreground">ZMK</span>
          </div>
        )}
      </CardContent>
      <CardFooter className="p-4 pt-0 gap-2">
        {is_bid ? (
          <Button 
            variant="default" 
            className="flex-1"
            onClick={(e) => {
              e.stopPropagation();
              if (id) navigate(`/product/${id}`);
            }}
            disabled={isExpired}
          >
            {isExpired ? "Bidding Ended" : "Place a Bid"}
          </Button>
        ) : (
          <Button 
            variant="default" 
            className="flex-1 gap-2"
            onClick={(e) => {
              e.stopPropagation();
              id && addToCart(id);
            }}
          >
            <ShoppingCart className="w-4 h-4" />
            Add to Cart
          </Button>
        )}
        <Button
          size="icon"
          variant={isFavorite ? "default" : "outline"}
          className="transition-all hover:scale-110"
          onClick={(e) => {
            e.stopPropagation();
            if (id) {
              isFavorite ? removeFavorite(id) : addFavorite(id);
            }
          }}
        >
          <Heart className={`w-4 h-4 ${isFavorite ? "fill-current" : ""}`} />
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ProductCard;
