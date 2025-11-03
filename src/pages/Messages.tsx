import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { useMessages } from "@/hooks/useMessages";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDistanceToNow } from "date-fns";
import { MessageCircle, ExternalLink } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Messages = () => {
  const { messages, isLoading } = useMessages();
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Messages</h1>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Messages</h1>
      {!messages || messages.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <MessageCircle className="w-16 h-16 text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold mb-2">No messages yet</h3>
            <p className="text-muted-foreground">Your conversations will appear here</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {messages.map((msg: any) => (
            <Card key={msg.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-2">
                    <CardTitle className="text-lg">
                      {msg.sender?.profiles?.full_name || "Admin"}
                    </CardTitle>
                    {!msg.is_read && <Badge variant="default">New</Badge>}
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {formatDistanceToNow(new Date(msg.created_at), { addSuffix: true })}
                  </span>
                </div>
                <CardDescription>{msg.content}</CardDescription>
                {msg.product_id && msg.products && (
                  <div className="flex items-center justify-between mt-3 pt-3 border-t">
                    <p className="text-sm text-muted-foreground">
                      About: {msg.products.name}
                    </p>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => navigate(`/product/${msg.product_id}`)}
                    >
                      <ExternalLink className="w-4 h-4 mr-2" />
                      View Product
                    </Button>
                  </div>
                )}
              </CardHeader>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default Messages;
