import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from "react-leaflet";
import { Icon, LatLng, divIcon } from "leaflet";
import "leaflet/dist/leaflet.css";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, SlidersHorizontal, ShoppingCart, Heart } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useProducts } from "@/hooks/useProducts";
import { useCart } from "@/hooks/useCart";
import { useFavorites } from "@/hooks/useFavorites";
import { useToast } from "@/hooks/use-toast";
import { fuzzyMatch } from "@/lib/fuzzySearch";

// Fix for default marker icon
delete (Icon.Default.prototype as any)._getIconUrl;
Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

function MapController({ center }: { center: LatLng }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, 13);
  }, [center, map]);
  return null;
}

const Map = () => {
  const navigate = useNavigate();
  const [userLocation, setUserLocation] = useState<LatLng | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [searchRadius, setSearchRadius] = useState<number>(10);
  const [productType, setProductType] = useState<string>("both");
  const [offeringType, setOfferingType] = useState<string>("all");
  const [searchWholeZambia, setSearchWholeZambia] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  
  const { products } = useProducts();
  const { addToCart } = useCart();
  const { favorites, addFavorite } = useFavorites();
  const { toast } = useToast();

  const isFavorite = (productId: string) => {
    return favorites?.some(fav => fav.product_id === productId) || false;
  };

  // Memoize the mobile icon to prevent recreation on every render
  const mobileIcon = useMemo(() => {
    return divIcon({
      html: `<div style="background: hsl(var(--accent)); color: white; width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold; border: 2px solid white; box-shadow: 0 2px 8px rgba(0,0,0,0.3);">M</div>`,
      className: 'custom-mobile-icon',
      iconSize: [32, 32],
      iconAnchor: [16, 32],
    });
  }, []);

  useEffect(() => {
    // Get user's current location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation(new LatLng(position.coords.latitude, position.coords.longitude));
        },
        () => {
          // Default to Lusaka, Zambia
          setUserLocation(new LatLng(-15.4167, 28.2833));
        }
      );
    } else {
      setUserLocation(new LatLng(-15.4167, 28.2833));
    }
  }, []);

  const filteredProducts = products?.filter(product => {
    if (!product.location_lat || !product.location_lng) return false;
    
    // Filter by offering type (goods vs services)
    if (offeringType === "goods" && product.product_type === "service") return false;
    if (offeringType === "services" && product.product_type !== "service") return false;
    
    // Filter by product type
    if (productType === "good" && product.product_type !== "good") return false;
    if (productType === "service" && product.product_type !== "service") return false;
    
    // Filter by search query using fuzzy matching
    if (searchQuery) {
      const matchesName = fuzzyMatch(searchQuery, product.name);
      const matchesDesc = product.description ? fuzzyMatch(searchQuery, product.description) : false;
      if (!matchesName && !matchesDesc) return false;
    }
    
    // Filter by radius unless searching whole Zambia
    if (!searchWholeZambia && userLocation) {
      const productLocation = new LatLng(Number(product.location_lat), Number(product.location_lng));
      const distance = userLocation.distanceTo(productLocation) / 1000; // Convert to km
      if (distance > searchRadius) return false;
    }
    
    return true;
  }) || [];

  const handleAddToCart = (productId: string) => {
    addToCart(productId);
    toast({
      title: "Added to cart",
      description: "Product has been added to your cart.",
    });
  };

  const handleToggleFavorite = (productId: string) => {
    addFavorite(productId);
  };

  if (!userLocation) {
    return <div className="flex items-center justify-center h-screen">Loading map...</div>;
  }

  return (
    <div className="relative h-[calc(100vh-4rem)] md:h-screen w-full">
      {/* Search bar and filters */}
      <div className="absolute top-2 sm:top-4 left-1/2 -translate-x-1/2 z-[1000] w-full max-w-2xl px-2 sm:px-4">
        <div className="bg-background rounded-lg shadow-lg p-2 sm:p-4 space-y-3 sm:space-y-4">
          <div className="relative flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-2 sm:left-3 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search on map..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 sm:pl-10 text-sm sm:text-base h-9 sm:h-10"
              />
            </div>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setShowFilters(!showFilters)}
              className="h-9 w-9 sm:h-10 sm:w-10"
            >
              <SlidersHorizontal className="w-3 h-3 sm:w-4 sm:h-4" />
            </Button>
          </div>

          {showFilters && (
            <div className="space-y-4 pt-4 border-t">
              <div className="space-y-2">
                <Label>Offering Type</Label>
                <Select value={offeringType} onValueChange={setOfferingType}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="goods">Goods Only</SelectItem>
                    <SelectItem value="services">Services Only</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Search Radius: {searchRadius} km</Label>
                <Slider
                  value={[searchRadius]}
                  onValueChange={(value) => setSearchRadius(value[0])}
                  max={50}
                  min={1}
                  step={1}
                  disabled={searchWholeZambia}
                />
              </div>

              <div className="space-y-2">
                <Label>Product Type</Label>
                <Select value={productType} onValueChange={setProductType}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="both">Goods & Services</SelectItem>
                    <SelectItem value="good">Goods Only</SelectItem>
                    <SelectItem value="service">Services Only</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="search-zambia"
                  checked={searchWholeZambia}
                  onCheckedChange={setSearchWholeZambia}
                />
                <Label htmlFor="search-zambia">Search Whole Zambia</Label>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Map */}
      <MapContainer
        center={userLocation}
        zoom={13}
        style={{ height: "100%", width: "100%" }}
        zoomControl={true}
        scrollWheelZoom={true}
        className="z-0"
      >
        <MapController center={userLocation} />
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          maxZoom={19}
        />
        
        {/* User location marker */}
        <Marker position={userLocation}>
          <Popup>Your Location</Popup>
        </Marker>

        {/* Search radius circle */}
        {!searchWholeZambia && (
          <Circle
            center={userLocation}
            radius={searchRadius * 1000}
            pathOptions={{ fillColor: "blue", fillOpacity: 0.1, color: "blue" }}
          />
        )}

        {/* Product markers */}
        {filteredProducts.map((product) => (
          <Marker
            key={product.id}
            position={[Number(product.location_lat), Number(product.location_lng)]}
            icon={product.mobile_location ? mobileIcon : undefined}
            eventHandlers={{
              click: () => setSelectedProduct(product),
            }}
          >
            <Popup>
              <div className="w-48">
                <h3 className="font-bold">{product.name}</h3>
                <p className="text-sm text-muted-foreground">ZMK {product.price}</p>
                {product.mobile_location && <p className="text-xs text-accent font-semibold mt-1">Mobile Service</p>}
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      {/* Selected product card */}
      {selectedProduct && (
        <div className="absolute bottom-2 sm:bottom-4 left-1/2 -translate-x-1/2 z-[1000] w-full max-w-md px-2 sm:px-4">
          <Card>
            <CardContent className="p-3 sm:p-4">
              {selectedProduct.product_images?.[0] && (
                <img
                  src={selectedProduct.product_images[0].image_url}
                  alt={selectedProduct.name}
                  className="w-full h-32 sm:h-40 object-cover rounded-lg mb-2 sm:mb-3"
                />
              )}
              <h3 className="font-bold text-base sm:text-lg">{selectedProduct.name}</h3>
              <p className="text-muted-foreground text-sm sm:text-base mb-2 sm:mb-3">ZMK {selectedProduct.price}</p>
              {selectedProduct.mobile_location && (
                <p className="text-xs sm:text-sm text-accent font-semibold mb-2">📍 Mobile Service</p>
              )}
              <div className="flex flex-col sm:flex-row gap-2">
                <Button
                  onClick={() => navigate(`/product/${selectedProduct.id}`)}
                  className="flex-1 text-sm sm:text-base h-9 sm:h-10"
                >
                  View More
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handleAddToCart(selectedProduct.id)}
                  className="flex-1 text-sm sm:text-base h-9 sm:h-10"
                >
                  <ShoppingCart className="w-4 h-4 mr-1" />
                  Cart
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handleToggleFavorite(selectedProduct.id)}
                  className="text-sm sm:text-base h-9 sm:h-10"
                >
                  <Heart className={`w-4 h-4 mr-1 ${isFavorite(selectedProduct.id) ? 'fill-current' : ''}`} />
                  {isFavorite(selectedProduct.id) ? 'Saved' : 'Save'}
                </Button>
              </div>
              <Button
                variant="ghost"
                className="w-full mt-2"
                onClick={() => setSelectedProduct(null)}
              >
                Close
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default Map;