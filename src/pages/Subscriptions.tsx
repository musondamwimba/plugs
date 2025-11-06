import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { useProfile } from "@/hooks/useProfile";
import { useToast } from "@/hooks/use-toast";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

const Subscriptions = () => {
  const navigate = useNavigate();
  const { profile } = useProfile();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: subscriptions, isLoading } = useQuery({
    queryKey: ['subscriptions'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('subscriptions')
        .select('*, products(id, name, product_type, is_active)')
        .eq('user_id', user.id)
        .order('due_date', { ascending: true });

      if (error) throw error;
      return data;
    },
  });

  const handlePaySubscription = async (subscriptionId: string, productId: string, amount: number) => {
    if (!profile) return;
    
    const balance = Number(profile.balance) || 0;
    if (balance < amount) {
      toast({
        title: "Insufficient balance",
        description: "Please deposit funds to pay for your subscription.",
        variant: "destructive",
      });
      navigate('/profile/deposit');
      return;
    }

    try {
      // Update subscription as paid
      const { error } = await supabase
        .from('subscriptions')
        .update({ 
          is_paid: true, 
          last_payment_date: new Date().toISOString() 
        })
        .eq('id', subscriptionId);

      if (error) throw error;

      // Update product to show in search results
      const { error: productError } = await supabase
        .from('products')
        .update({ subscription_paid: true })
        .eq('id', productId);

      if (productError) throw productError;

      // Deduct balance
      const { error: balanceError } = await supabase
        .from('profiles')
        .update({ balance: balance - amount })
        .eq('id', profile.id);

      if (balanceError) throw balanceError;

      toast({
        title: "Payment successful",
        description: `ZMK ${amount.toFixed(2)} has been deducted. Your product is now visible in search results.`,
      });

      queryClient.invalidateQueries({ queryKey: ['subscriptions'] });
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
    } catch (error: any) {
      toast({
        title: "Payment failed",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleRemoveProduct = async (productId: string, subscriptionId: string) => {
    try {
      // Set product as inactive (removes from search results)
      const { error: productError } = await supabase
        .from('products')
        .update({ is_active: false })
        .eq('id', productId);

      if (productError) throw productError;

      // Cancel subscription
      const { error: subError } = await supabase
        .from('subscriptions')
        .update({ status: 'cancelled' })
        .eq('id', subscriptionId);

      if (subError) throw subError;

      toast({
        title: "Product removed",
        description: "Product has been removed from search results.",
      });

      queryClient.invalidateQueries({ queryKey: ['subscriptions'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate("/profile")}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <h1 className="text-3xl font-bold">Pay for Subscription</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Your Balance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
            <span className="text-sm font-medium">Available Balance:</span>
            <span className="text-2xl font-bold">ZMK {(Number(profile?.balance) || 0).toFixed(2)}</span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Active Subscriptions</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-24 w-full" />
              ))}
            </div>
          ) : subscriptions && subscriptions.length > 0 ? (
            <div className="space-y-3">
              {subscriptions.map((subscription) => (
                <div
                  key={subscription.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex-1 space-y-1">
                    <p className="font-semibold text-lg">{subscription.products?.name}</p>
                    <div className="flex items-center gap-3">
                      <Badge variant="outline">
                        {subscription.products?.product_type === 'service' ? 'Service' : 'Good'}
                      </Badge>
                      <span className="text-sm text-muted-foreground">
                        ZMK {subscription.amount}/month
                      </span>
                      {subscription.status === 'cancelled' && (
                        <Badge variant="destructive">Cancelled</Badge>
                      )}
                      {!subscription.products?.is_active && (
                        <Badge variant="secondary">Inactive</Badge>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {subscription.is_paid ? (
                      <Badge variant="default">Paid</Badge>
                    ) : (
                      <Button 
                        onClick={() => handlePaySubscription(subscription.id, subscription.product_id, Number(subscription.amount))}
                        size="sm"
                        disabled={subscription.status === 'cancelled'}
                      >
                        Pay
                      </Button>
                    )}
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="destructive" size="icon">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Remove Product</AlertDialogTitle>
                          <AlertDialogDescription>
                            This will remove "{subscription.products?.name}" from search results. Are you sure?
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleRemoveProduct(subscription.product_id, subscription.id)}>
                            Remove
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-8">
              No active subscriptions
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Subscriptions;
