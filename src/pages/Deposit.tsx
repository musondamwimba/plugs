import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useProfile } from "@/hooks/useProfile";
import { useAdminSettings } from "@/hooks/useAdminSettings";

const Deposit = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { profile } = useProfile();
  const { settings } = useAdminSettings();
  const [amount, setAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("mobile_money");
  const [accountNumber, setAccountNumber] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const calculateFee = () => {
    const amt = parseFloat(amount) || 0;
    if (!settings?.deposit_fee) return 0;
    
    const depositFee = settings.deposit_fee;
    if (depositFee.type === 'percentage') {
      return amt * (depositFee.value / 100);
    }
    return depositFee.value;
  };

  const getFeeDisplay = () => {
    if (!settings?.deposit_fee) return "";
    const depositFee = settings.deposit_fee;
    return depositFee.type === 'percentage' 
      ? `${depositFee.value}%` 
      : `${depositFee.value} ZMK`;
  };

  const paymentMethods = [
    { value: "mobile_money", label: "MTN Mobile Money" },
    { value: "airtel_money", label: "Airtel Money" },
    { value: "zamtel_kwacha", label: "Zamtel Kwacha" },
    { value: "bank_transfer", label: "Bank Transfer" },
  ];

  const handleDeposit = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      toast({
        title: "Please enter a valid amount",
        variant: "destructive",
      });
      return;
    }

    if (paymentMethod === "mobile_money" && !phoneNumber) {
      toast({
        title: "Please enter your phone number",
        variant: "destructive",
      });
      return;
    }

    if (paymentMethod === "bank_transfer" && !accountNumber) {
      toast({
        title: "Please enter your account number",
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
          account_number: accountNumber || null,
          phone_number: phoneNumber || null,
          status: 'pending',
        });

      if (error) throw error;

      toast({
        title: "Deposit request submitted",
        description: "Your deposit will be processed shortly",
      });

      setAmount("");
      setAccountNumber("");
      setPhoneNumber("");
    } catch (error: any) {
      toast({
        title: "Deposit failed",
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
          <p className="text-3xl font-bold">ZMK {(profile?.balance || 0).toFixed(2)}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Make a Deposit</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="amount">Amount (ZMK)</Label>
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
                    {method.label} {getFeeDisplay() && `(Fee: ${getFeeDisplay()})`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {(paymentMethod === "mobile_money" || paymentMethod === "airtel_money" || paymentMethod === "zamtel_kwacha") && (
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="+260..."
              />
            </div>
          )}

          {paymentMethod === "bank_transfer" && (
            <div className="space-y-2">
              <Label htmlFor="account">Account Number</Label>
              <Input
                id="account"
                type="text"
                value={accountNumber}
                onChange={(e) => setAccountNumber(e.target.value)}
                placeholder="Enter account number"
              />
            </div>
          )}

          {amount && (
            <div className="p-4 bg-accent rounded-lg space-y-2">
              <div className="flex justify-between">
                <span>Deposit Amount:</span>
                <span className="font-semibold">ZMK {parseFloat(amount).toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Processing Fee:</span>
                <span className="font-semibold">ZMK {calculateFee().toFixed(2)}</span>
              </div>
              <div className="flex justify-between border-t pt-2">
                <span className="font-bold">Total to Pay:</span>
                <span className="font-bold">ZMK {(parseFloat(amount) + calculateFee()).toFixed(2)}</span>
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