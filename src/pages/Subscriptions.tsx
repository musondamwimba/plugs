import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { useProfile } from "@/hooks/useProfile";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";

const Subscriptions = () => {
  const navigate = useNavigate();
  const { profile } = useProfile();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedSubscriptions, setSelectedSubscriptions] = useState<string[]>([]);

  const { data: subscriptions, isLoading } = useQuery({
    queryKey: ['subscriptions'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('subscriptions')
        .select('*, products(name)')
        .eq('user_id', user.id)
        .order('due_date', { ascending: true });

      if (error) throw error;
      return data;
    },
  });

  const totalMonthly = subscriptions?.reduce((sum, sub) => sum + Number(sub.amount), 0) || 0;
  const selectedTotal = subscriptions
    ?.filter(sub => selectedSubscriptions.includes(sub.id))
    .reduce((sum, sub) => sum + Number(sub.amount), 0) || 0;

  const handleToggleSubscription = (subscriptionId: string) => {
    setSelectedSubscriptions(prev =>
      prev.includes(subscriptionId)
        ? prev.filter(id => id !== subscriptionId)
        : [...prev, subscriptionId]
    );
  };

  const handlePaySelected = async () => {
    if (!profile || selectedSubscriptions.length === 0) return;
    
    const balance = Number(profile.balance) || 0;
    if (balance < selectedTotal) {
      toast({
        title: "Insufficient balance",
        description: "Please deposit funds to pay for your subscriptions.",
        variant: "destructive",
      });
      navigate('/profile/deposit');
      return;
    }

    try {
      // Update selected subscriptions as paid
      const { error } = await supabase
        .from('subscriptions')
        .update({ 
          is_paid: true, 
          last_payment_date: new Date().toISOString() 
        })
        .in('id', selectedSubscriptions);

      if (error) throw error;

      // Deduct from balance
      const { error: balanceError } = await supabase
        .from('profiles')
        .update({ balance: balance - selectedTotal })
        .eq('id', profile.id);

      if (balanceError) throw balanceError;

      toast({
        title: "Payment successful",
        description: `ZMK ${selectedTotal.toFixed(2)} has been deducted from your balance.`,
      });

      setSelectedSubscriptions([]);
      queryClient.invalidateQueries({ queryKey: ['subscriptions'] });
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    } catch (error: any) {
      toast({
        title: "Payment failed",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleQuickPayAll = async () => {
    if (!profile) return;
    
    const balance = Number(profile.balance) || 0;
    if (balance < totalMonthly) {
      toast({
        title: "Insufficient balance",
        description: "Please deposit funds to pay for your subscriptions.",
        variant: "destructive",
      });
      navigate('/profile/deposit');
      return;
    }

    try {
      const subscriptionIds = subscriptions?.map(sub => sub.id) || [];
      
      // Update all subscriptions as paid
      const { error } = await supabase
        .from('subscriptions')
        .update({ 
          is_paid: true, 
          last_payment_date: new Date().toISOString() 
        })
        .in('id', subscriptionIds);

      if (error) throw error;

      // Deduct from balance
      const { error: balanceError } = await supabase
        .from('profiles')
        .update({ balance: balance - totalMonthly })
        .eq('id', profile.id);

      if (balanceError) throw balanceError;

      toast({
        title: "Payment successful",
        description: `ZMK ${totalMonthly.toFixed(2)} has been deducted from your balance.`,
      });

      queryClient.invalidateQueries({ queryKey: ['subscriptions'] });
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    } catch (error: any) {
      toast({
        title: "Payment failed",
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
          <CardTitle>Monthly Subscription Total</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-3xl font-bold">ZMK {totalMonthly.toFixed(2)}</p>
          <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
            <span className="text-sm font-medium">Your Balance:</span>
            <span className="text-lg font-bold">ZMK {(Number(profile?.balance) || 0).toFixed(2)}</span>
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
                  className="flex items-center gap-4 p-4 border rounded-lg"
                >
                  <Checkbox
                    checked={selectedSubscriptions.includes(subscription.id)}
                    onCheckedChange={() => handleToggleSubscription(subscription.id)}
                  />
                  <div className="flex-1 space-y-1">
                    <p className="font-semibold">{subscription.products?.name}</p>
                    <p className="text-sm text-muted-foreground">
                      Due: {new Date(subscription.due_date).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="font-bold text-lg">
                      ZMK {subscription.amount}
                    </span>
                    <Badge variant={subscription.is_paid ? 'default' : 'secondary'}>
                      {subscription.is_paid ? 'Paid' : 'Unpaid'}
                    </Badge>
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

      {subscriptions && subscriptions.length > 0 && (
        <div className="space-y-3">
          <Button 
            className="w-full" 
            size="lg"
            onClick={handleQuickPayAll}
          >
            Pay All (ZMK {totalMonthly.toFixed(2)})
          </Button>
          {selectedSubscriptions.length > 0 && (
            <Button 
              className="w-full" 
              size="lg"
              variant="outline"
              onClick={handlePaySelected}
            >
              Pay Selected ({selectedSubscriptions.length}) - ZMK {selectedTotal.toFixed(2)}
            </Button>
          )}
        </div>
      )}
    </div>
  );
};

export default Subscriptions;