import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import ProductUploadForm from "@/components/ProductUploadForm";
import { Skeleton } from "@/components/ui/skeleton";

const ProductEdit = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const { data: product, isLoading } = useQuery({
    queryKey: ['product', id],
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
      return data;
    },
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-12 w-64" />
        <Skeleton className="h-[600px] w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate("/my-products")}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <h1 className="text-3xl font-bold">Edit Product</h1>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Edit Product</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-muted-foreground">
              Product ID: {product?.id}
            </p>
            <p className="text-sm text-muted-foreground">
              Edit functionality coming soon. For now, you can view your product details here.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProductEdit;
