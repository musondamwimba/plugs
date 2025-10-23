import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Shield, Users, Package, TrendingUp } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

const Admin = () => {
  const { toast } = useToast();
  const [depositFeeType, setDepositFeeType] = useState<'percentage' | 'fixed'>('percentage');
  const [depositFeeValue, setDepositFeeValue] = useState('5');
  const [adminFeeType, setAdminFeeType] = useState<'percentage' | 'fixed'>('percentage');
  const [adminFeeValue, setAdminFeeValue] = useState('10');
  const [subscriptionFee, setSubscriptionFee] = useState('50');
  const stats = [
    { title: "Total Users", value: "1,234", icon: Users, color: "text-blue-600" },
    { title: "Total Products", value: "567", icon: Package, color: "text-green-600" },
    { title: "Revenue", value: "ZMK 45,678", icon: TrendingUp, color: "text-orange-600" },
  ];

  const handleSaveRates = () => {
    toast({
      title: "Rates updated",
      description: "Fee rates have been saved successfully.",
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Shield className="w-10 h-10 text-icon-admin" />
        <div>
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-muted-foreground">Manage your marketplace</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title}>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <p className="text-3xl font-bold">{stat.value}</p>
                  <Icon className={`w-8 h-8 ${stat.color}`} />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Fee Management</CardTitle>
            <CardDescription>Set rates for deposits, admin fees, and subscriptions</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-3">
              <Label>Deposit Fee</Label>
              <div className="flex gap-3">
                <Select value={depositFeeType} onValueChange={(v: 'percentage' | 'fixed') => setDepositFeeType(v)}>
                  <SelectTrigger className="w-[140px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="percentage">Percentage</SelectItem>
                    <SelectItem value="fixed">Fixed Amount</SelectItem>
                  </SelectContent>
                </Select>
                <div className="flex-1 flex items-center gap-2">
                  <Input
                    type="number"
                    value={depositFeeValue}
                    onChange={(e) => setDepositFeeValue(e.target.value)}
                    placeholder="Enter value"
                  />
                  <span className="text-sm text-muted-foreground">
                    {depositFeeType === 'percentage' ? '%' : 'ZMK'}
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <Label>Admin Fee (per transaction)</Label>
              <div className="flex gap-3">
                <Select value={adminFeeType} onValueChange={(v: 'percentage' | 'fixed') => setAdminFeeType(v)}>
                  <SelectTrigger className="w-[140px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="percentage">Percentage</SelectItem>
                    <SelectItem value="fixed">Fixed Amount</SelectItem>
                  </SelectContent>
                </Select>
                <div className="flex-1 flex items-center gap-2">
                  <Input
                    type="number"
                    value={adminFeeValue}
                    onChange={(e) => setAdminFeeValue(e.target.value)}
                    placeholder="Enter value"
                  />
                  <span className="text-sm text-muted-foreground">
                    {adminFeeType === 'percentage' ? '%' : 'ZMK'}
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <Label>Monthly Subscription Fee (per product)</Label>
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  value={subscriptionFee}
                  onChange={(e) => setSubscriptionFee(e.target.value)}
                  placeholder="Enter amount"
                />
                <span className="text-sm text-muted-foreground">ZMK</span>
              </div>
            </div>

            <Button onClick={handleSaveRates} className="w-full">
              Save Rates
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest actions in the system</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center py-2 border-b">
                <span>New user registered</span>
                <span className="text-sm text-muted-foreground">5 min ago</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b">
                <span>Product uploaded</span>
                <span className="text-sm text-muted-foreground">15 min ago</span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span>Order completed</span>
                <span className="text-sm text-muted-foreground">1 hour ago</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Admin;
