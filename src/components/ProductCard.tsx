import { useState } from "react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ShoppingCart, Heart, Star } from "lucide-react";

interface ProductCardProps {
  name: string;
  price: number;
  image?: string;
  description?: string;
}

const ProductCard = ({ name, price, image, description }: ProductCardProps) => {
  const [isFavorite, setIsFavorite] = useState(false);
  const [isWishlist, setIsWishlist] = useState(false);
  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-300">
      <div className="aspect-square bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
        {image ? (
          <img src={image} alt={name} className="w-full h-full object-cover" />
        ) : (
          <span className="text-4xl">📦</span>
        )}
      </div>
      <CardContent className="p-4">
        <h3 className="font-semibold text-lg mb-2 line-clamp-1">{name}</h3>
        {description && (
          <p className="text-sm text-muted-foreground line-clamp-2 mb-2">{description}</p>
        )}
        <p className="text-2xl font-bold text-primary">ZMW {price.toFixed(2)}</p>
      </CardContent>
      <CardFooter className="p-4 pt-0 flex gap-2">
        <Button className="flex-1 gap-2">
          <ShoppingCart className="w-4 h-4" />
          Add to Cart
        </Button>
        <Button 
          variant="outline" 
          size="icon"
          onClick={() => setIsFavorite(!isFavorite)}
          className="transition-colors"
        >
          <Heart 
            className={`w-4 h-4 transition-colors ${
              isFavorite ? "fill-red-500 text-red-500" : "text-icon-wishlist"
            }`}
          />
        </Button>
        <Button 
          variant="outline" 
          size="icon"
          onClick={() => setIsWishlist(!isWishlist)}
          className="transition-colors"
        >
          <Star 
            className={`w-4 h-4 transition-colors ${
              isWishlist ? "fill-yellow-500 text-yellow-500" : "text-icon-favorites"
            }`}
          />
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ProductCard;
