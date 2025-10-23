import { useState } from "react";
import { ShoppingCart, Star, Wallet, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useProfile } from "@/hooks/useProfile";

const TopButtons = () => {
  const [showBalance, setShowBalance] = useState(false);
  const { profile } = useProfile();

  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center gap-2 px-3 py-2 bg-accent/50 rounded-lg">
        <Wallet className="w-4 h-4" />
        <span className="text-sm font-medium">
          {showBalance ? `ZMK ${(profile?.balance || 0).toLocaleString()}` : "****"}
        </span>
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6"
          onClick={() => setShowBalance(!showBalance)}
        >
          {showBalance ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
        </Button>
        <Link to="/profile/deposit">
          <Button size="sm" variant="outline" className="h-6 text-xs">
            Deposit
          </Button>
        </Link>
      </div>
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
    </div>
  );
};

export default TopButtons;
