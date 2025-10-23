import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useCart } from "@/hooks/useCart";
import { useProfile } from "@/hooks/useProfile";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

const Checkout = () => {
  const { cartItems } = useCart();
  const { profile } = useProfile();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [adminFeePaid, setAdminFeePaid] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const subtotal = cartItems?.reduce(
    (sum: number, item: any) => sum + item.products.price * item.quantity,
    0
  ) || 0;
  
  const adminFee = subtotal * 0.05; // 5% admin fee
  const total = subtotal + adminFee;

  const handlePayAdminFee = async () => {
    if (!profile?.balance || profile.balance < adminFee) {
      toast({
        title: "Insufficient balance",
        description: "Please deposit funds to pay the admin fee",
        variant: "destructive",
      });
      navigate("/profile/deposit");
      return;
    }

    setIsProcessing(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Deduct admin fee from balance
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ balance: (profile.balance || 0) - adminFee })
        .eq('id', user.id);

      if (updateError) throw updateError;

      // Record transaction
      const { error: transError } = await supabase
        .from('transactions')
        .insert({
          user_id: user.id,
          amount: adminFee,
          type: 'admin_fee',
          description: 'Admin fee payment for order',
          admin_fee: adminFee,
        });

      if (transError) throw transError;

      setAdminFeePaid(true);
      toast({
        title: "Admin fee paid",
        description: "You can now proceed with checkout",
      });
    } catch (error: any) {
      toast({
        title: "Payment failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCompleteOrder = async () => {
    toast({
      title: "Order placed",
      description: "Vendor has been notified. Check messages for details.",
    });
    navigate("/messages");
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold">Checkout</h1>

      <Card>
        <CardHeader>
          <CardTitle>Order Summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>ZMK {subtotal.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span>Admin Fee (5%)</span>
              <span>ZMK {adminFee.toLocaleString()}</span>
            </div>
            <div className="border-t pt-2 flex justify-between font-bold text-lg">
              <span>Total</span>
              <span>ZMK {total.toLocaleString()}</span>
            </div>
          </div>

          {!adminFeePaid ? (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Current Balance: ZMK {(profile?.balance || 0).toLocaleString()}
              </p>
              <Button 
                className="w-full" 
                onClick={handlePayAdminFee}
                disabled={isProcessing}
              >
                {isProcessing ? "Processing..." : "Pay Admin Fee"}
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="bg-green-50 dark:bg-green-950 p-4 rounded-lg">
                <p className="text-green-800 dark:text-green-200 font-medium">
                  ✓ Admin fee paid. You can now complete your order.
                </p>
              </div>
              <Button className="w-full" onClick={handleCompleteOrder}>
                Complete Order
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Checkout;
