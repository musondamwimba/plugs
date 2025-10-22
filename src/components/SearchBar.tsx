import { useState, useRef, useEffect } from "react";
import { Search, Mic } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface SearchBarProps {
  onSearch?: (query: string) => void;
}

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
  }, [toast]);

  useEffect(() => {
    if (query.length > 2) {
      const commonSearches = ["electronics", "furniture", "clothing", "vehicles", "phones"];
      const filtered = commonSearches.filter(item => item.toLowerCase().includes(query.toLowerCase()));
      setSuggestions(filtered);
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
          className="pl-10 pr-32 h-12 rounded-full border-2"
        />
        <div className="absolute right-1 top-1/2 -translate-y-1/2 flex gap-2">
          <Button type="button" variant="ghost" size="icon" className={`rounded-full ${isRecording ? 'bg-red-500' : ''}`} onClick={startRecording}>
            <Mic className="w-4 h-4" />
          </Button>
          <Button type="submit" className="rounded-full px-6">Search</Button>
        </div>
      </div>
      {showSuggestions && (
        <div className="absolute top-full mt-2 w-full bg-background border rounded-lg shadow-lg z-50">
          {suggestions.map((suggestion, index) => (
            <button key={index} type="button" className="w-full text-left px-4 py-2 hover:bg-accent" onClick={() => { setQuery(suggestion); if (onSearch) onSearch(suggestion); setShowSuggestions(false); }}>
              {suggestion}
            </button>
          ))}
        </div>
      )}
    </form>
  );
};

export default SearchBar;