import ProductCard from "@/components/ProductCard";
import { Star } from "lucide-react";

const Favorites = () => {
  const favorites = [
    { id: 1, name: "Wireless Mouse", price: 29.99, description: "Precision gaming mouse" },
    { id: 2, name: "USB-C Hub", price: 79.99, description: "7-in-1 connectivity solution" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Star className="w-8 h-8 text-icon-favorites" />
        <h1 className="text-3xl font-bold">Favorites</h1>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {favorites.map((product) => (
          <ProductCard key={product.id} {...product} />
        ))}
      </div>
    </div>
  );
};

export default Favorites;
