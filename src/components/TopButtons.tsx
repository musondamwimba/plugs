import { ShoppingCart, Heart, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const TopButtons = () => {
  return (
    <div className="flex items-center gap-3">
      <Link to="/cart">
        <Button variant="outline" size="sm" className="flex items-center gap-2">
          <ShoppingCart className="w-4 h-4 text-icon-cart" />
          <span className="hidden sm:inline">Cart</span>
        </Button>
      </Link>
      <Link to="/favorites">
        <Button variant="outline" size="sm" className="flex items-center gap-2">
          <Star className="w-4 h-4 text-icon-favorites" />
          <span className="hidden sm:inline">Favorites</span>
        </Button>
      </Link>
      <Link to="/wishlist">
        <Button variant="outline" size="sm" className="flex items-center gap-2">
          <Heart className="w-4 h-4 text-icon-wishlist" />
          <span className="hidden sm:inline">Wishlist</span>
        </Button>
      </Link>
    </div>
  );
};

export default TopButtons;
