import { Button } from "@/components/ui/button";
import ProductCard from "@/components/ProductCard";
import { Plus } from "lucide-react";

const MyProducts = () => {
  const myProducts = [
    { id: 1, name: "My Laptop", price: 899.99, description: "Gently used laptop" },
    { id: 2, name: "Gaming Mouse", price: 59.99, description: "RGB gaming mouse" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">My Products</h1>
        <Button className="gap-2">
          <Plus className="w-4 h-4" />
          Add Product
        </Button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {myProducts.map((product) => (
          <ProductCard key={product.id} {...product} />
        ))}
      </div>
    </div>
  );
};

export default MyProducts;
