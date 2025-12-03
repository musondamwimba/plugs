import { useState, useRef, useEffect } from "react";
import { Search, Mic } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface SearchBarProps {
  onSearch?: (query: string) => void;
}

// Common search suggestions with variations for fuzzy matching
const COMMON_SEARCHES = [
  "electronics",
  "furniture", 
  "clothing",
  "vehicles",
  "phones",
  "laptops",
  "appliances",
  "shoes",
  "watches",
  "bags",
  "jewelry",
  "tools",
  "sports",
  "beauty",
  "health"
];

const SearchBar = ({ onSearch }: SearchBarProps) => {
  const [query, setQuery] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const { toast } = useToast();
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;

      recognitionRef.current.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setQuery(transcript);
        setIsRecording(false);
        // Auto-search on voice input
        if (onSearch) onSearch(transcript);
      };

      recognitionRef.current.onerror = () => {
        setIsRecording(false);
        toast({
          title: "Voice recording failed",
          variant: "destructive",
        });
      };

      recognitionRef.current.onend = () => {
        setIsRecording(false);
      };
    }
  }, [toast, onSearch]);

  // Fuzzy suggestion matching
  useEffect(() => {
    if (query.length > 1) {
      const normalizedQuery = query.toLowerCase().replace(/\s+/g, '');
      
      const filtered = COMMON_SEARCHES.filter(item => {
        const normalizedItem = item.toLowerCase();
        // Check for contains
        if (normalizedItem.includes(normalizedQuery)) return true;
        // Check for starts with
        if (normalizedItem.startsWith(normalizedQuery.slice(0, 2))) return true;
        // Simple fuzzy: check if most characters match
        let matchCount = 0;
        for (const char of normalizedQuery) {
          if (normalizedItem.includes(char)) matchCount++;
        }
        return matchCount >= normalizedQuery.length * 0.6;
      });
      
      setSuggestions(filtered.slice(0, 5));
      setShowSuggestions(filtered.length > 0);
    } else {
      setShowSuggestions(false);
    }
  }, [query]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSearch) onSearch(query);
    setShowSuggestions(false);
  };

  const handleSuggestionClick = (suggestion: string) => {
    setQuery(suggestion);
    if (onSearch) onSearch(suggestion);
    setShowSuggestions(false);
  };

  const startRecording = () => {
    if (recognitionRef.current) {
      setIsRecording(true);
      recognitionRef.current.start();
    }
  };

  return (
    <form onSubmit={handleSearch} className="w-full max-w-2xl mx-auto relative">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Search products, services..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => query.length > 1 && setShowSuggestions(suggestions.length > 0)}
          onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
          className="pl-10 pr-32 h-12 rounded-full border-2"
        />
        <div className="absolute right-1 top-1/2 -translate-y-1/2 flex gap-2">
          <Button 
            type="button" 
            variant="ghost" 
            size="icon" 
            className={`rounded-full ${isRecording ? 'bg-destructive text-destructive-foreground' : ''}`} 
            onClick={startRecording}
          >
            <Mic className="w-4 h-4" />
          </Button>
          <Button type="submit" className="rounded-full px-6">Search</Button>
        </div>
      </div>
      {showSuggestions && (
        <div className="absolute top-full mt-2 w-full bg-background border rounded-lg shadow-lg z-50">
          {suggestions.map((suggestion, index) => (
            <button 
              key={index} 
              type="button" 
              className="w-full text-left px-4 py-2 hover:bg-accent first:rounded-t-lg last:rounded-b-lg flex items-center gap-2" 
              onClick={() => handleSuggestionClick(suggestion)}
            >
              <Search className="w-4 h-4 text-muted-foreground" />
              {suggestion}
            </button>
          ))}
        </div>
      )}
    </form>
  );
};

export default SearchBar;
