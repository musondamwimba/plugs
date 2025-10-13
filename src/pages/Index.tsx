import { useState } from "react";
import SearchBar from "@/components/SearchBar";
import Slideshow from "@/components/Slideshow";
import ProductCard from "@/components/ProductCard";

const Index = () => {
  const [searchQuery, setSearchQuery] = useState("");

  // Sample products
  const products = [
    { id: 1, name: "Premium Headphones", price: 299.99, description: "High-quality wireless headphones" },
    { id: 2, name: "Smart Watch", price: 199.99, description: "Track your fitness goals" },
    { id: 3, name: "Laptop Stand", price: 49.99, description: "Ergonomic aluminum stand" },
    { id: 4, name: "Wireless Mouse", price: 29.99, description: "Precision gaming mouse" },
    { id: 5, name: "USB-C Hub", price: 79.99, description: "7-in-1 connectivity solution" },
    { id: 6, name: "Phone Case", price: 19.99, description: "Durable protective case" },
  ];

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const filteredProducts = searchQuery
    ? products.filter(p => 
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.description?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : products;

  return (
    <div className="space-y-8">
      {/* Welcome Title */}
      <div className="text-center pt-4">
        <h1 className="text-5xl font-bold bg-gradient-to-r from-primary via-accent to-warning bg-clip-text text-transparent mb-2">
          Welcome to PluGS
        </h1>
        <p className="text-muted-foreground text-lg">Your marketplace for everything</p>
      </div>

      {/* Search Bar */}
      <SearchBar onSearch={handleSearch} />

      {/* Slideshow */}
      <Slideshow />

      {/* Featured Products */}
      <div>
        <h2 className="text-3xl font-bold mb-6">Featured Products</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} {...product} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Index;
