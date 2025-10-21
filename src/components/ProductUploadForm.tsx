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
  });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setImages(Array.from(e.target.files));
    }
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
          is_primary: index === 0,
          display_order: index,
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
      });
      setImages([]);
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

      <div>
        <Label htmlFor="images">Product Images</Label>
        <Input
          id="images"
          type="file"
          accept="image/*"
          multiple
          onChange={handleImageChange}
        />
        {images.length > 0 && (
          <p className="text-sm text-muted-foreground mt-2">
            {images.length} image(s) selected
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
