import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";

const Subscriptions = () => {
  const navigate = useNavigate();

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
        <CardContent>
          <p className="text-3xl font-bold">MMK {totalMonthly.toFixed(2)}</p>
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
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="space-y-1">
                    <p className="font-semibold">{subscription.products?.name}</p>
                    <p className="text-sm text-muted-foreground">
                      Due: {new Date(subscription.due_date).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="font-bold text-lg">
                      MMK {subscription.amount}
                    </span>
                    <Badge variant={subscription.status === 'active' ? 'default' : 'secondary'}>
                      {subscription.status}
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
        <Button className="w-full" size="lg">
          Pay All Subscriptions (MMK {totalMonthly.toFixed(2)})
        </Button>
      )}
    </div>
  );
};

export default Subscriptions;