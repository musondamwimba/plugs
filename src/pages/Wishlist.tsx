import ProductCard from "@/components/ProductCard";
import { Heart } from "lucide-react";

const Wishlist = () => {
  const wishlist = [
    { id: 1, name: "Phone Case", price: 19.99, description: "Durable protective case" },
    { id: 2, name: "Laptop Stand", price: 49.99, description: "Ergonomic aluminum stand" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Heart className="w-8 h-8 text-icon-wishlist" />
        <h1 className="text-3xl font-bold">Wishlist</h1>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {wishlist.map((product) => (
          <ProductCard key={product.id} {...product} />
        ))}
      </div>
    </div>
  );
};

export default Wishlist;
