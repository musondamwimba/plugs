import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const Withdraw = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [amount, setAmount] = useState("");
  const [balance, setBalance] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const withdrawalFee = 50; // Fixed fee

  const handleWithdraw = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      toast({
        title: "Invalid amount",
        description: "Please enter a valid amount",
        variant: "destructive",
      });
      return;
    }

    if (parseFloat(amount) + withdrawalFee > balance) {
      toast({
        title: "Insufficient balance",
        description: "You don't have enough funds for this withdrawal",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('withdrawals')
        .insert({
          user_id: user.id,
          amount: parseFloat(amount),
          fee: withdrawalFee,
          status: 'pending',
        });

      if (error) throw error;

      toast({
        title: "Withdrawal initiated",
        description: "Your withdrawal request has been submitted",
      });

      setAmount("");
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
    <div className="space-y-6 max-w-2xl mx-auto">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate("/profile")}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <h1 className="text-3xl font-bold">Withdraw</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Available Balance</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-bold">MMK {balance.toFixed(2)}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Withdraw Funds</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="amount">Amount (MMK)</Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
            />
          </div>

          {amount && (
            <div className="p-4 bg-accent rounded-lg space-y-2">
              <div className="flex justify-between">
                <span>Withdrawal Amount:</span>
                <span className="font-semibold">MMK {parseFloat(amount).toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Processing Fee:</span>
                <span className="font-semibold">MMK {withdrawalFee.toFixed(2)}</span>
              </div>
              <div className="flex justify-between border-t pt-2">
                <span className="font-bold">Total Deducted:</span>
                <span className="font-bold">MMK {(parseFloat(amount) + withdrawalFee).toFixed(2)}</span>
              </div>
            </div>
          )}

          <Button 
            onClick={handleWithdraw} 
            disabled={isSubmitting}
            className="w-full"
          >
            {isSubmitting ? "Processing..." : "Withdraw Funds"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default Withdraw;