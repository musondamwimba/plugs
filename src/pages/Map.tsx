import { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from "react-leaflet";
import { Icon, LatLng } from "leaflet";
import "leaflet/dist/leaflet.css";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, SlidersHorizontal } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useProducts } from "@/hooks/useProducts";
import { useCart } from "@/hooks/useCart";
import { useFavorites } from "@/hooks/useFavorites";
import { useToast } from "@/hooks/use-toast";

// Fix for default marker icon
delete (Icon.Default.prototype as any)._getIconUrl;
Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

function MapController({ center }: { center: LatLng }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, 13);
  }, [center, map]);
  return null;
}

const Map = () => {
  const [userLocation, setUserLocation] = useState<LatLng | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [searchRadius, setSearchRadius] = useState<number>(10);
  const [productType, setProductType] = useState<string>("both");
  const [searchWholeZambia, setSearchWholeZambia] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  
  const { products } = useProducts();
  const { addToCart } = useCart();
  const { addFavorite } = useFavorites();
  const { toast } = useToast();

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
    
    // Filter by product type
    if (productType !== "both" && product.product_type !== productType) return false;
    
    // Filter by search query
    if (searchQuery && !product.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    
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
  };

  const handleAddToFavorites = (productId: string) => {
    addFavorite({ product_id: productId });
  };

  if (!userLocation) {
    return <div className="flex items-center justify-center h-screen">Loading map...</div>;
  }

  return (
    <div className="relative h-screen w-full">
      {/* Search bar and filters */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[1000] w-full max-w-2xl px-4">
        <div className="bg-background rounded-lg shadow-lg p-4 space-y-4">
          <div className="relative flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search on map..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setShowFilters(!showFilters)}
            >
              <SlidersHorizontal className="w-4 h-4" />
            </Button>
          </div>

          {showFilters && (
            <div className="space-y-4 pt-4 border-t">
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
                    <SelectItem value="product">Goods Only</SelectItem>
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
      >
        <MapController center={userLocation} />
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
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
            eventHandlers={{
              click: () => setSelectedProduct(product),
            }}
          >
            <Popup>
              <div className="w-48">
                <h3 className="font-bold">{product.name}</h3>
                <p className="text-sm text-muted-foreground">MMK {product.price}</p>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      {/* Selected product card */}
      {selectedProduct && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-[1000] w-full max-w-md px-4">
          <Card>
            <CardContent className="p-4">
              {selectedProduct.product_images?.[0] && (
                <img
                  src={selectedProduct.product_images[0].image_url}
                  alt={selectedProduct.name}
                  className="w-full h-40 object-cover rounded-lg mb-3"
                />
              )}
              <h3 className="font-bold text-lg">{selectedProduct.name}</h3>
              <p className="text-muted-foreground mb-3">MMK {selectedProduct.price}</p>
              <div className="flex gap-2">
                <Button
                  onClick={() => handleAddToCart(selectedProduct.id)}
                  className="flex-1"
                >
                  Add to Cart
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handleAddToFavorites(selectedProduct.id)}
                >
                  Favorite
                </Button>
                <Button
                  variant="outline"
                  onClick={() => window.open(`/products/${selectedProduct.id}`, '_blank')}
                >
                  View Details
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