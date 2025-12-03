import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, MapPin, Calendar, MessageCircle } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { useCart } from "@/hooks/useCart";
import { useFavorites } from "@/hooks/useFavorites";
import AskForInfoDialog from "@/components/AskForInfoDialog";

const ProductDetails = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { addToCart } = useCart();
  const { addFavorite } = useFavorites();

  const { data: productData, isLoading } = useQuery({
    queryKey: ['product-details', id],
    queryFn: async () => {
      if (!id) throw new Error('Product ID is required');
      
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          product_images(*),
          product_documents(*)
        `)
        .eq('id', id)
        .single();

      if (error) throw error;
      
      // Fetch vendor profile separately
      if (data) {
        const { data: vendorData } = await supabase
          .from('profiles')
          .select('full_name, vendor_rating, profile_picture_url')
          .eq('id', data.vendor_id)
          .single();
        
        return { ...data, vendor_profile: vendorData };
      }
      
      return data;
    },
    enabled: !!id,
  });

  const product = productData as any; // Type assertion for vendor_profile

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-12 w-64" />
        <Skeleton className="h-[600px] w-full" />
      </div>
    );
  }

  if (!product) {
    return <div>Product not found</div>;
  }

  const images = product.product_images || [];
  const displayImage = product.use_profile_picture 
    ? product.vendor_profile?.profile_picture_url 
    : images[0]?.image_url;

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <h1 className="text-3xl font-bold">Product Details</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardContent className="p-6">
            {images.length > 1 ? (
              <Carousel className="w-full">
                <CarouselContent>
                  {images.map((img, idx) => (
                    <CarouselItem key={img.id}>
                      <img
                        src={img.image_url}
                        alt={`${product.name} ${idx + 1}`}
                        className="w-full h-96 object-cover rounded-lg"
                      />
                    </CarouselItem>
                  ))}
                </CarouselContent>
                <CarouselPrevious />
                <CarouselNext />
              </Carousel>
            ) : (
              <img
                src={displayImage || '/placeholder.svg'}
                alt={product.name}
                className="w-full h-96 object-cover rounded-lg"
              />
            )}
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-2xl">{product.name}</CardTitle>
                  <p className="text-3xl font-bold text-primary mt-2">
                    ZMK {Number(product.price).toFixed(2)}
                  </p>
                </div>
                <Badge variant={product.product_type === 'good' ? 'default' : 'secondary'}>
                  {product.product_type === 'good' ? 'Good' : 'Service'}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">Description</h3>
                <p className="text-muted-foreground">{product.description || 'No description provided'}</p>
              </div>

              {product.condition && (
                <div>
                  <h3 className="font-semibold mb-2">Condition</h3>
                  <Badge variant="outline">{product.condition}</Badge>
                </div>
              )}

              {product.location_address && (
                <div className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 mt-1" />
                  <div>
                    <h3 className="font-semibold">Location</h3>
                    <p className="text-sm text-muted-foreground">{product.location_address}</p>
                    {product.mobile_location && (
                      <Badge variant="secondary" className="mt-1">Mobile Service</Badge>
                    )}
                  </div>
                </div>
              )}

              {product.is_bid && (
                <div className="flex items-start gap-2">
                  <Calendar className="w-4 h-4 mt-1" />
                  <div>
                    <h3 className="font-semibold">Bidding</h3>
                    <p className="text-sm text-muted-foreground">
                      Starting bid: ZMK {Number(product.starting_bid).toFixed(2)}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Ends: {new Date(product.bid_end_time!).toLocaleString()}
                    </p>
                  </div>
                </div>
              )}

              <div>
                <h3 className="font-semibold mb-2">Vendor Information</h3>
                <div className="flex items-center gap-2">
                  <p className="text-sm">{product.vendor_profile?.full_name || 'Vendor'}</p>
                  {product.vendor_profile?.vendor_rating && (
                    <Badge variant="outline">
                      ⭐ {Number(product.vendor_profile.vendor_rating).toFixed(1)}
                    </Badge>
                  )}
                </div>
              </div>

              {product.cash_only && (
                <Badge variant="secondary">Cash Payment Only</Badge>
              )}

              <div className="flex gap-3 pt-4">
                <Button 
                  onClick={() => addToCart(product.id)}
                  className="flex-1"
                >
                  Add to Cart
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => addFavorite(product.id)}
                >
                  Add to Favorites
                </Button>
                <AskForInfoDialog
                  productId={product.id}
                  productName={product.name}
                  vendorId={product.vendor_id}
                />
              </div>
            </CardContent>
          </Card>

          {product.product_documents && product.product_documents.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Supporting Documents</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {product.product_documents.map((doc) => (
                    <a
                      key={doc.id}
                      href={doc.document_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block p-3 border rounded-lg hover:bg-accent transition-colors"
                    >
                      <p className="text-sm font-medium">{doc.document_type || 'Document'}</p>
                      <p className="text-xs text-muted-foreground">Click to view</p>
                    </a>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;
