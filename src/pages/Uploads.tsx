import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import ProductUploadForm from "@/components/ProductUploadForm";

const Uploads = () => {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Upload Product</h1>
      <Card>
        <CardHeader>
          <CardTitle>Product Details</CardTitle>
        </CardHeader>
        <CardContent>
          <ProductUploadForm />
        </CardContent>
      </Card>
    </div>
  );
};

export default Uploads;
