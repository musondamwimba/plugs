import { useState } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface SearchBarProps {
  onSearch?: (query: string) => void;
}

const SearchBar = ({ onSearch }: SearchBarProps) => {
  const [query, setQuery] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSearch) {
      onSearch(query);
    }
  };

  return (
    <form onSubmit={handleSearch} className="w-full max-w-2xl mx-auto">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Search products, services..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="pl-10 pr-24 h-12 rounded-full border-2 focus-visible:ring-primary"
        />
        <Button
          type="submit"
          className="absolute right-1 top-1/2 -translate-y-1/2 rounded-full px-6"
        >
          Search
        </Button>
      </div>
    </form>
  );
};

export default SearchBar;
