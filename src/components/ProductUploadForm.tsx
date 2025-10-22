import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";

const ProductUploadForm = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [images, setImages] = useState<File[]>([]);
  const [documents, setDocuments] = useState<File[]>([]);
  const [locations, setLocations] = useState<Array<{ lat: number; lng: number }>>([]);
  const [useProfilePic, setUseProfilePic] = useState(false);
  const [primaryImageIndex, setPrimaryImageIndex] = useState(0);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    product_type: "product",
    condition: "new",
    location_address: "",
    is_bid: false,
    starting_bid: "",
    bid_end_time: "",
    cash_only: false,
    mobile_location: false,
  });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setImages(Array.from(e.target.files));
    }
  };

  const handleDocumentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setDocuments(Array.from(e.target.files));
      toast({
        title: "Document visibility",
        description: "These documents will be visible to all users viewing your product.",
      });
    }
  };

  const handleAddLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocations([...locations, { 
            lat: position.coords.latitude, 
            lng: position.coords.longitude 
          }]);
          if (locations.length > 0) {
            toast({
              title: "Additional location charge",
              description: "Multiple locations will incur additional charges.",
            });
          }
        },
        () => {
          toast({
            title: "Location access denied",
            description: "Please enable location services to add your location.",
            variant: "destructive",
          });
        }
      );
    }
  };

  const handleRemoveLocation = (index: number) => {
    setLocations(locations.filter((_, i) => i !== index));
  };

  const uploadImages = async (productId: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const uploadPromises = images.map(async (image, index) => {
      const fileExt = image.name.split('.').pop();
      const fileName = `${user.id}/${productId}/${Date.now()}_${index}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('product-images')
        .upload(fileName, image);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('product-images')
        .getPublicUrl(fileName);

      const { error: dbError } = await supabase
        .from('product_images')
        .insert({
          product_id: productId,
          image_url: publicUrl,
          is_primary: index === primaryImageIndex,
          display_order: index,
        });

      if (dbError) throw dbError;
    });

    await Promise.all(uploadPromises);
  };

  const uploadDocuments = async (productId: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const uploadPromises = documents.map(async (document) => {
      const fileExt = document.name.split('.').pop();
      const fileName = `${user.id}/${productId}/${Date.now()}_${document.name}`;
      
      const { error: uploadError } = await supabase.storage
        .from('product-documents')
        .upload(fileName, document);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('product-documents')
        .getPublicUrl(fileName);

      const { error: dbError } = await supabase
        .from('product_documents')
        .insert({
          product_id: productId,
          document_url: publicUrl,
          document_type: fileExt,
        });

      if (dbError) throw dbError;
    });

    await Promise.all(uploadPromises);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const productData: any = {
        vendor_id: user.id,
        name: formData.name,
        description: formData.description,
        price: parseFloat(formData.price),
        product_type: formData.product_type,
        condition: formData.condition,
        location_address: formData.location_address,
        cash_only: formData.cash_only,
        is_bid: formData.is_bid,
        mobile_location: formData.mobile_location,
        use_profile_picture: useProfilePic,
        location_lat: locations[0]?.lat,
        location_lng: locations[0]?.lng,
      };

      if (formData.is_bid) {
        productData.starting_bid = parseFloat(formData.starting_bid);
        productData.bid_end_time = formData.bid_end_time;
      }

      const { data: product, error: productError } = await supabase
        .from('products')
        .insert(productData)
        .select()
        .single();

      if (productError) throw productError;

      if (images.length > 0) {
        await uploadImages(product.id);
      }

      if (documents.length > 0) {
        await uploadDocuments(product.id);
      }

      queryClient.invalidateQueries({ queryKey: ['my-products'] });
      
      toast({
        title: "Product uploaded",
        description: "Your product has been listed successfully.",
      });

      // Reset form
      setFormData({
        name: "",
        description: "",
        price: "",
        product_type: "product",
        condition: "new",
        location_address: "",
        is_bid: false,
        starting_bid: "",
        bid_end_time: "",
        cash_only: false,
        mobile_location: false,
      });
      setImages([]);
      setDocuments([]);
      setLocations([]);
      setUseProfilePic(false);
      setPrimaryImageIndex(0);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <Label htmlFor="name">Product Name</Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          required
        />
      </div>

      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          rows={4}
        />
      </div>

      <div>
        <Label htmlFor="price">Price (MMK)</Label>
        <Input
          id="price"
          type="number"
          step="0.01"
          value={formData.price}
          onChange={(e) => setFormData({ ...formData, price: e.target.value })}
          required
        />
      </div>

      <div>
        <Label htmlFor="product_type">Product Type</Label>
        <Select
          value={formData.product_type}
          onValueChange={(value) => setFormData({ ...formData, product_type: value })}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="product">Product</SelectItem>
            <SelectItem value="service">Service</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="condition">Condition</Label>
        <Select
          value={formData.condition}
          onValueChange={(value) => setFormData({ ...formData, condition: value })}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="new">New</SelectItem>
            <SelectItem value="used">Used</SelectItem>
            <SelectItem value="refurbished">Refurbished</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="location">Location Address</Label>
        <Input
          id="location"
          value={formData.location_address}
          onChange={(e) => setFormData({ ...formData, location_address: e.target.value })}
        />
      </div>

      <div className="space-y-3">
        <Label>Location on Map</Label>
        <div className="flex gap-2">
          <Button type="button" onClick={handleAddLocation}>
            Add Current Location
          </Button>
          {formData.product_type === "service" && (
            <div className="flex items-center space-x-2">
              <Switch
                id="mobile_location"
                checked={formData.mobile_location}
                onCheckedChange={(checked) => setFormData({ ...formData, mobile_location: checked })}
              />
              <Label htmlFor="mobile_location">Mobile Service</Label>
            </div>
          )}
        </div>
        {locations.length > 0 && (
          <div className="space-y-2">
            {locations.map((loc, index) => (
              <div key={index} className="flex items-center justify-between bg-accent p-2 rounded">
                <span className="text-sm">Location {index + 1}: {loc.lat.toFixed(4)}, {loc.lng.toFixed(4)}</span>
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  onClick={() => handleRemoveLocation(index)}
                >
                  Remove
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="flex items-center space-x-2">
        <Switch
          id="is_bid"
          checked={formData.is_bid}
          onCheckedChange={(checked) => setFormData({ ...formData, is_bid: checked })}
        />
        <Label htmlFor="is_bid">Enable Bidding</Label>
      </div>

      {formData.is_bid && (
        <>
          <div>
            <Label htmlFor="starting_bid">Starting Bid (MMK)</Label>
            <Input
              id="starting_bid"
              type="number"
              step="0.01"
              value={formData.starting_bid}
              onChange={(e) => setFormData({ ...formData, starting_bid: e.target.value })}
            />
          </div>

          <div>
            <Label htmlFor="bid_end_time">Bid End Time</Label>
            <Input
              id="bid_end_time"
              type="datetime-local"
              value={formData.bid_end_time}
              onChange={(e) => setFormData({ ...formData, bid_end_time: e.target.value })}
            />
          </div>
        </>
      )}

      <div className="flex items-center space-x-2">
        <Switch
          id="cash_only"
          checked={formData.cash_only}
          onCheckedChange={(checked) => setFormData({ ...formData, cash_only: checked })}
        />
        <Label htmlFor="cash_only">Cash Only</Label>
      </div>

      <div className="space-y-3">
        <div className="flex items-center space-x-2">
          <Switch
            id="use_profile_pic"
            checked={useProfilePic}
            onCheckedChange={setUseProfilePic}
          />
          <Label htmlFor="use_profile_pic">Use Profile Picture</Label>
        </div>

        {!useProfilePic && (
          <>
            <Label htmlFor="images">Product Images</Label>
            <Input
              id="images"
              type="file"
              accept="image/*"
              multiple
              onChange={handleImageChange}
            />
            {images.length > 0 && (
              <div className="space-y-2 mt-2">
                <p className="text-sm text-muted-foreground">
                  {images.length} image(s) selected
                </p>
                <div>
                  <Label>Select Primary Image</Label>
                  <Select
                    value={primaryImageIndex.toString()}
                    onValueChange={(value) => setPrimaryImageIndex(parseInt(value))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {images.map((_, index) => (
                        <SelectItem key={index} value={index.toString()}>
                          Image {index + 1}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      <div>
        <Label htmlFor="documents">Supporting Documents (Optional)</Label>
        <Input
          id="documents"
          type="file"
          accept=".pdf,.doc,.docx,image/*"
          multiple
          onChange={handleDocumentChange}
        />
        {documents.length > 0 && (
          <p className="text-sm text-muted-foreground mt-2">
            {documents.length} document(s) selected
          </p>
        )}
      </div>

      <Button type="submit" disabled={isSubmitting} className="w-full">
        {isSubmitting ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Uploading...
          </>
        ) : (
          "Upload Product"
        )}
      </Button>
    </form>
  );
};

export default ProductUploadForm;
