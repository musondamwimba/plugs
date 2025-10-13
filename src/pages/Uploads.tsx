import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Upload as UploadIcon } from "lucide-react";

const Uploads = () => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Uploads</h1>
        <Button className="gap-2">
          <UploadIcon className="w-4 h-4" />
          Upload New Product
        </Button>
      </div>
      <Card className="border-2 border-dashed">
        <CardContent className="flex flex-col items-center justify-center py-16">
          <UploadIcon className="w-16 h-16 text-muted-foreground mb-4" />
          <h3 className="text-xl font-semibold mb-2">No uploads yet</h3>
          <p className="text-muted-foreground text-center mb-4">
            Start uploading your products to sell them on PluGS
          </p>
          <Button>Upload Your First Product</Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default Uploads;
