import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const Deposit = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [amount, setAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("mobile_money");
  const [balance, setBalance] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const paymentMethods = [
    { value: "mobile_money", label: "Mobile Money", fee: "2%" },
    { value: "bank_transfer", label: "Bank Transfer", fee: "1.5%" },
    { value: "card", label: "Debit/Credit Card", fee: "3%" },
  ];

  const calculateFee = () => {
    const amt = parseFloat(amount) || 0;
    const feePercent = paymentMethod === "mobile_money" ? 0.02 : 
                       paymentMethod === "bank_transfer" ? 0.015 : 0.03;
    return amt * feePercent;
  };

  const handleDeposit = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      toast({
        title: "Invalid amount",
        description: "Please enter a valid amount",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('deposits')
        .insert({
          user_id: user.id,
          amount: parseFloat(amount),
          fee: calculateFee(),
          payment_method: paymentMethod,
          status: 'pending',
        });

      if (error) throw error;

      toast({
        title: "Deposit initiated",
        description: "Your deposit request has been submitted",
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
        <h1 className="text-3xl font-bold">Deposit</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Current Balance</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-bold">MMK {balance.toFixed(2)}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Make a Deposit</CardTitle>
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

          <div className="space-y-2">
            <Label htmlFor="payment_method">Payment Method</Label>
            <Select value={paymentMethod} onValueChange={setPaymentMethod}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {paymentMethods.map((method) => (
                  <SelectItem key={method.value} value={method.value}>
                    {method.label} (Fee: {method.fee})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {amount && (
            <div className="p-4 bg-accent rounded-lg space-y-2">
              <div className="flex justify-between">
                <span>Deposit Amount:</span>
                <span className="font-semibold">MMK {parseFloat(amount).toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Processing Fee:</span>
                <span className="font-semibold">MMK {calculateFee().toFixed(2)}</span>
              </div>
              <div className="flex justify-between border-t pt-2">
                <span className="font-bold">Total to Pay:</span>
                <span className="font-bold">MMK {(parseFloat(amount) + calculateFee()).toFixed(2)}</span>
              </div>
            </div>
          )}

          <Button 
            onClick={handleDeposit} 
            disabled={isSubmitting}
            className="w-full"
          >
            {isSubmitting ? "Processing..." : "Deposit Funds"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default Deposit;