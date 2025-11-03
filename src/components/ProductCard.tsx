import { useState } from "react";
import { Card, CardContent, CardHeader, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Heart, MapPin, ShoppingCart, Eye, Gavel } from "lucide-react";
import { useCart } from "@/hooks/useCart";
import { useFavorites } from "@/hooks/useFavorites";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { useBids } from "@/hooks/useBids";
import { formatDistanceToNow } from "date-fns";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

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
  bids?: Array<{ amount: number }>;
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
  currentHighestBid,
  bids
}: ProductCardProps) => {
  const { addToCart } = useCart();
  const { addFavorite, removeFavorite, favorites } = useFavorites();
  const { placeBid } = useBids(id || '');
  const { user } = useAuth();
  const navigate = useNavigate();
  const [bidAmount, setBidAmount] = useState("");
  const [showBidDialog, setShowBidDialog] = useState(false);
  
  const isFavorite = favorites?.some((fav: any) => fav.product_id === id);
  const isExpired = bid_end_time ? new Date(bid_end_time) < new Date() : false;
  
  const currentBid = bids && bids.length > 0 
    ? Math.max(...bids.map(b => b.amount))
    : (currentHighestBid || starting_bid || 0);
    
  const minBid = currentBid + 1;

  const handleViewDetails = () => {
    if (id) navigate(`/product/${id}`);
  };

  const handlePlaceBid = () => {
    if (!user) {
      navigate('/auth');
      return;
    }
    if (!bidAmount || parseFloat(bidAmount) < minBid || !id) return;
    placeBid({ productId: id, amount: parseFloat(bidAmount) });
    setBidAmount("");
    setShowBidDialog(false);
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
                {currentBid.toLocaleString()}
              </span>
              <span className="text-sm text-muted-foreground">ZMK</span>
            </div>
            {bid_end_time && !isExpired && (
              <p className="text-xs text-muted-foreground">
                Ends {formatDistanceToNow(new Date(bid_end_time), { addSuffix: true })}
              </p>
            )}
            {isExpired && (
              <p className="text-xs text-destructive">Bidding ended</p>
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
        {is_bid && !isExpired ? (
          <Dialog open={showBidDialog} onOpenChange={setShowBidDialog}>
            <DialogTrigger asChild>
              <Button 
                variant="default" 
                className="flex-1"
                onClick={(e) => e.stopPropagation()}
              >
                <Gavel className="w-4 h-4 mr-1" />
                Place a Bid
              </Button>
            </DialogTrigger>
            <DialogContent onClick={(e) => e.stopPropagation()}>
              <DialogHeader>
                <DialogTitle>Place Your Bid</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Current Bid:</span>
                    <span className="font-semibold">ZMK {currentBid.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Minimum Bid:</span>
                    <span className="font-semibold text-primary">ZMK {minBid.toLocaleString()}</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <Input
                    type="number"
                    placeholder={`Min: ${minBid} ZMK`}
                    value={bidAmount}
                    onChange={(e) => setBidAmount(e.target.value)}
                    min={minBid}
                  />
                </div>
                <Button onClick={handlePlaceBid} className="w-full" disabled={!bidAmount || parseFloat(bidAmount) < minBid}>
                  Place Bid
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        ) : is_bid && isExpired ? (
          <Button variant="outline" className="flex-1" disabled>
            Bidding Ended
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
