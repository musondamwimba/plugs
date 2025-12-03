import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Trash2, MapPin, Check } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { useProfile } from "@/hooks/useProfile";
import { useToast } from "@/hooks/use-toast";
import { useAdminSettings } from "@/hooks/useAdminSettings";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

const BASE_SUBSCRIPTION_FEE = 50; // Base fee per product
const LOCATION_MULTIPLIER = 25; // Additional fee per location

const Subscriptions = () => {
  const navigate = useNavigate();
  const { profile } = useProfile();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { settings } = useAdminSettings();
  const [selectedSubscriptions, setSelectedSubscriptions] = useState<Set<string>>(new Set());

  // Get base subscription fee from admin settings or use default
  const baseFee = settings?.subscription_fee?.value || BASE_SUBSCRIPTION_FEE;
  const locationFee = settings?.location_fee?.value || LOCATION_MULTIPLIER;

  const { data: subscriptions, isLoading } = useQuery({
    queryKey: ['subscriptions-with-locations'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Get subscriptions with products
      const { data: subs, error } = await supabase
        .from('subscriptions')
        .select('*, products(id, name, product_type, is_active, location_lat, location_lng, location_address)')
        .eq('user_id', user.id)
        .order('due_date', { ascending: true });

      if (error) throw error;

      // Count locations for each product (including outlet locations if any)
      const enrichedSubs = await Promise.all(subs.map(async (sub) => {
        let locationCount = 0;
        
        // Check if product has a location
        if (sub.products?.location_lat && sub.products?.location_lng) {
          locationCount = 1;
        }

        // Check for additional outlet locations
        if (sub.outlet_id) {
          const { data: outlet } = await supabase
            .from('outlets')
            .select('location_lat, location_lng')
            .eq('id', sub.outlet_id)
            .single();
          
          if (outlet?.location_lat && outlet?.location_lng) {
            locationCount += 1;
          }
        }

        // Calculate dynamic subscription fee based on locations
        const calculatedFee = baseFee + (locationCount * locationFee);

        return {
          ...sub,
          location_count: locationCount,
          calculated_fee: calculatedFee
        };
      }));

      return enrichedSubs;
    },
  });

  const toggleSubscriptionSelection = (subscriptionId: string) => {
    const newSelected = new Set(selectedSubscriptions);
    if (newSelected.has(subscriptionId)) {
      newSelected.delete(subscriptionId);
    } else {
      newSelected.add(subscriptionId);
    }
    setSelectedSubscriptions(newSelected);
  };

  const selectAllUnpaid = () => {
    if (!subscriptions) return;
    const unpaidIds = subscriptions
      .filter(sub => !sub.is_paid && sub.status !== 'cancelled' && sub.products?.is_active)
      .map(sub => sub.id);
    setSelectedSubscriptions(new Set(unpaidIds));
  };

  const clearSelection = () => {
    setSelectedSubscriptions(new Set());
  };

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
      const { error } = await supabase
        .from('subscriptions')
        .update({ 
          is_paid: true, 
          last_payment_date: new Date().toISOString(),
          amount: amount // Update with calculated amount
        })
        .eq('id', subscriptionId);

      if (error) throw error;

      const { error: productError } = await supabase
        .from('products')
        .update({ subscription_paid: true })
        .eq('id', productId);

      if (productError) throw productError;

      const { error: balanceError } = await supabase
        .from('profiles')
        .update({ balance: balance - amount })
        .eq('id', profile.id);

      if (balanceError) throw balanceError;

      toast({
        title: "Payment successful",
        description: `ZMK ${amount.toFixed(2)} has been deducted. Your product is now visible in search results.`,
      });

      queryClient.invalidateQueries({ queryKey: ['subscriptions-with-locations'] });
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

  const handlePaySelected = async () => {
    if (!profile || !subscriptions || selectedSubscriptions.size === 0) return;
    
    const selectedSubs = subscriptions.filter(
      sub => selectedSubscriptions.has(sub.id) && !sub.is_paid && sub.status !== 'cancelled' && sub.products?.is_active
    );
    
    if (selectedSubs.length === 0) {
      toast({
        title: "No valid subscriptions selected",
        description: "Please select unpaid subscriptions to pay.",
        variant: "destructive",
      });
      return;
    }

    const totalAmount = selectedSubs.reduce((sum, sub) => sum + Number(sub.calculated_fee), 0);
    const balance = Number(profile.balance) || 0;

    if (balance < totalAmount) {
      toast({
        title: "Insufficient balance",
        description: `You need ZMK ${totalAmount.toFixed(2)} but have ZMK ${balance.toFixed(2)}. Please deposit funds.`,
        variant: "destructive",
      });
      navigate('/profile/deposit');
      return;
    }

    try {
      for (const sub of selectedSubs) {
        const { error } = await supabase
          .from('subscriptions')
          .update({ 
            is_paid: true, 
            last_payment_date: new Date().toISOString(),
            amount: sub.calculated_fee
          })
          .eq('id', sub.id);

        if (error) throw error;

        const { error: productError } = await supabase
          .from('products')
          .update({ subscription_paid: true })
          .eq('id', sub.product_id);

        if (productError) throw productError;
      }

      const { error: balanceError } = await supabase
        .from('profiles')
        .update({ balance: balance - totalAmount })
        .eq('id', profile.id);

      if (balanceError) throw balanceError;

      toast({
        title: "Payments successful",
        description: `ZMK ${totalAmount.toFixed(2)} deducted. ${selectedSubs.length} products are now visible in search results.`,
      });

      setSelectedSubscriptions(new Set());
      queryClient.invalidateQueries({ queryKey: ['subscriptions-with-locations'] });
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

  const handlePayAllSubscriptions = async () => {
    if (!profile || !subscriptions) return;
    
    const unpaidSubscriptions = subscriptions.filter(
      sub => !sub.is_paid && sub.status !== 'cancelled' && sub.products?.is_active
    );
    
    if (unpaidSubscriptions.length === 0) {
      toast({
        title: "No unpaid subscriptions",
        description: "All your subscriptions are already paid.",
      });
      return;
    }

    const totalAmount = unpaidSubscriptions.reduce((sum, sub) => sum + Number(sub.calculated_fee), 0);
    const balance = Number(profile.balance) || 0;

    if (balance < totalAmount) {
      toast({
        title: "Insufficient balance",
        description: `You need ZMK ${totalAmount.toFixed(2)} but have ZMK ${balance.toFixed(2)}. Please deposit funds.`,
        variant: "destructive",
      });
      navigate('/profile/deposit');
      return;
    }

    try {
      for (const sub of unpaidSubscriptions) {
        const { error } = await supabase
          .from('subscriptions')
          .update({ 
            is_paid: true, 
            last_payment_date: new Date().toISOString(),
            amount: sub.calculated_fee
          })
          .eq('id', sub.id);

        if (error) throw error;

        const { error: productError } = await supabase
          .from('products')
          .update({ subscription_paid: true })
          .eq('id', sub.product_id);

        if (productError) throw productError;
      }

      const { error: balanceError } = await supabase
        .from('profiles')
        .update({ balance: balance - totalAmount })
        .eq('id', profile.id);

      if (balanceError) throw balanceError;

      toast({
        title: "All payments successful",
        description: `ZMK ${totalAmount.toFixed(2)} deducted. ${unpaidSubscriptions.length} products are now visible in search results.`,
      });

      queryClient.invalidateQueries({ queryKey: ['subscriptions-with-locations'] });
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
      const { error: productError } = await supabase
        .from('products')
        .update({ is_active: false })
        .eq('id', productId);

      if (productError) throw productError;

      const { error: subError } = await supabase
        .from('subscriptions')
        .update({ status: 'cancelled' })
        .eq('id', subscriptionId);

      if (subError) throw subError;

      toast({
        title: "Product removed",
        description: "Product has been removed from search results.",
      });

      queryClient.invalidateQueries({ queryKey: ['subscriptions-with-locations'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const unpaidCount = subscriptions?.filter(s => !s.is_paid && s.status !== 'cancelled' && s.products?.is_active).length || 0;
  const totalUnpaidAmount = subscriptions
    ?.filter(s => !s.is_paid && s.status !== 'cancelled' && s.products?.is_active)
    .reduce((sum, s) => sum + Number(s.calculated_fee), 0) || 0;
  
  const selectedTotal = subscriptions
    ?.filter(s => selectedSubscriptions.has(s.id) && !s.is_paid && s.status !== 'cancelled' && s.products?.is_active)
    .reduce((sum, s) => sum + Number(s.calculated_fee), 0) || 0;

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
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle>Uploaded Products & Subscriptions</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Base fee: ZMK {baseFee} + ZMK {locationFee}/location
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {selectedSubscriptions.size > 0 && (
                <>
                  <Button onClick={clearSelection} variant="outline" size="sm">
                    Clear ({selectedSubscriptions.size})
                  </Button>
                  <Button onClick={handlePaySelected} size="sm">
                    Pay Selected (ZMK {selectedTotal.toFixed(2)})
                  </Button>
                </>
              )}
              {unpaidCount > 0 && (
                <>
                  <Button onClick={selectAllUnpaid} variant="outline" size="sm">
                    Select All Unpaid
                  </Button>
                  <Button onClick={handlePayAllSubscriptions} size="sm">
                    Pay All (ZMK {totalUnpaidAmount.toFixed(2)})
                  </Button>
                </>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-28 w-full" />
              ))}
            </div>
          ) : subscriptions && subscriptions.length > 0 ? (
            <div className="space-y-3">
              {subscriptions.map((subscription) => {
                const isUnpaid = !subscription.is_paid && subscription.status !== 'cancelled' && subscription.products?.is_active;
                const isSelected = selectedSubscriptions.has(subscription.id);
                
                return (
                  <div
                    key={subscription.id}
                    className={`flex items-start gap-3 p-4 border rounded-lg transition-colors ${
                      isSelected ? 'bg-primary/5 border-primary' : 'hover:bg-muted/50'
                    }`}
                  >
                    {isUnpaid && (
                      <Checkbox
                        checked={isSelected}
                        onCheckedChange={() => toggleSubscriptionSelection(subscription.id)}
                        className="mt-1"
                      />
                    )}
                    <div className="flex-1 space-y-2">
                      <p className="font-semibold text-lg">{subscription.products?.name}</p>
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge variant="outline">
                          {subscription.products?.product_type === 'service' ? 'Service' : 'Good'}
                        </Badge>
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <MapPin className="w-3 h-3" />
                          <span>{subscription.location_count || 0} location{subscription.location_count !== 1 ? 's' : ''}</span>
                        </div>
                        {subscription.is_paid ? (
                          <Badge className="bg-green-500">
                            <Check className="w-3 h-3 mr-1" />
                            Paid - Visible in Search
                          </Badge>
                        ) : (
                          <Badge variant="secondary">Unpaid - Not Visible</Badge>
                        )}
                        {subscription.status === 'cancelled' && (
                          <Badge variant="destructive">Cancelled</Badge>
                        )}
                        {!subscription.products?.is_active && (
                          <Badge variant="secondary">Inactive</Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <span className="text-muted-foreground">Subscription Fee:</span>
                        <span className="font-bold text-primary">ZMK {subscription.calculated_fee.toFixed(2)}</span>
                        <span className="text-xs text-muted-foreground">
                          (Base: {baseFee} + Locations: {subscription.location_count * locationFee})
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {!subscription.is_paid && subscription.status !== 'cancelled' && (
                        <Button 
                          onClick={() => handlePaySubscription(subscription.id, subscription.product_id, subscription.calculated_fee)}
                          size="sm"
                        >
                          Pay ZMK {subscription.calculated_fee.toFixed(2)}
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
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground mb-4">
                No products uploaded yet
              </p>
              <Button onClick={() => navigate('/uploads')} variant="outline">
                Upload Product
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Subscriptions;
