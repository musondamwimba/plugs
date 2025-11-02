import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Shield, Users, Package, TrendingUp, Ban, AlertCircle, DollarSign, CheckCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useUserManagement } from "@/hooks/useUserManagement";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { ThemeControl } from "@/components/ThemeControl";

const Admin = () => {
  const { toast } = useToast();
  const { users, isLoading: usersLoading, moderateUser } = useUserManagement();
  
  const [depositFeeType, setDepositFeeType] = useState<'percentage' | 'fixed'>('percentage');
  const [depositFeeValue, setDepositFeeValue] = useState('5');
  const [adminFeeType, setAdminFeeType] = useState<'percentage' | 'fixed'>('percentage');
  const [adminFeeValue, setAdminFeeValue] = useState('10');
  const [subscriptionFee, setSubscriptionFee] = useState('50');
  
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [moderationAction, setModerationAction] = useState<'active' | 'suspended' | 'banned' | 'blocked'>('active');
  const [moderationReason, setModerationReason] = useState('');
  const [fineAmount, setFineAmount] = useState('');

  const stats = [
    { title: "Total Users", value: users?.length || 0, icon: Users, color: "text-blue-600" },
    { title: "Active Users", value: users?.filter((u: any) => !u.user_moderation?.[0] || u.user_moderation[0].status === 'active').length || 0, icon: Users, color: "text-green-600" },
    { title: "Suspended/Banned", value: users?.filter((u: any) => u.user_moderation?.[0]?.status === 'suspended' || u.user_moderation?.[0]?.status === 'banned').length || 0, icon: Ban, color: "text-destructive" },
  ];

  const handleSaveRates = () => {
    toast({
      title: "Rates updated",
      description: "Fee rates have been saved successfully.",
    });
  };

  const handleModerateUser = () => {
    if (!selectedUser || !moderationAction) return;
    
    moderateUser({
      userId: selectedUser.id,
      status: moderationAction,
      reason: moderationReason,
      fineAmount: fineAmount ? parseFloat(fineAmount) : undefined,
    });
    
    setSelectedUser(null);
    setModerationAction('active');
    setModerationReason('');
    setFineAmount('');
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'default' | 'destructive' | 'secondary' | 'outline'> = {
      active: 'default',
      suspended: 'secondary',
      banned: 'destructive',
      blocked: 'outline',
    };
    return <Badge variant={variants[status] || 'default'}>{status}</Badge>;
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

      <Tabs defaultValue="fees" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="fees">Fee Management</TabsTrigger>
          <TabsTrigger value="users">User Management</TabsTrigger>
          <TabsTrigger value="theme">Theme Control</TabsTrigger>
        </TabsList>

        <TabsContent value="fees" className="space-y-4">
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
        </TabsContent>

        <TabsContent value="users" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>User Management</CardTitle>
              <CardDescription>Manage user accounts and permissions</CardDescription>
            </CardHeader>
            <CardContent>
              {usersLoading ? (
                <div className="text-center py-8">Loading users...</div>
              ) : (
                <div className="space-y-2 max-h-[500px] overflow-y-auto">
                  {users?.map((user: any) => (
                    <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50">
                      <div className="flex-1">
                        <div className="font-medium">{user.full_name}</div>
                        <div className="text-sm text-muted-foreground">{user.phone_number}</div>
                        <div className="text-xs text-muted-foreground">Balance: ZMK {user.balance || 0}</div>
                      </div>
                      <div className="flex items-center gap-2">
                        {user.user_moderation?.[0] && getStatusBadge(user.user_moderation[0].status)}
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => setSelectedUser(user)}
                            >
                              Manage
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Manage User: {user.full_name}</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4 py-4">
                              <div className="space-y-2">
                                <Label>Action</Label>
                                <Select 
                                  value={moderationAction} 
                                  onValueChange={(value) => setModerationAction(value as 'active' | 'suspended' | 'banned' | 'blocked')}
                                >
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select action" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="active">
                                      <div className="flex items-center gap-2">
                                        <CheckCircle className="w-4 h-4" /> Activate
                                      </div>
                                    </SelectItem>
                                    <SelectItem value="suspended">
                                      <div className="flex items-center gap-2">
                                        <AlertCircle className="w-4 h-4" /> Suspend
                                      </div>
                                    </SelectItem>
                                    <SelectItem value="banned">
                                      <div className="flex items-center gap-2">
                                        <Ban className="w-4 h-4" /> Ban
                                      </div>
                                    </SelectItem>
                                    <SelectItem value="blocked">
                                      <div className="flex items-center gap-2">
                                        <Shield className="w-4 h-4" /> Block
                                      </div>
                                    </SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                              
                              <div className="space-y-2">
                                <Label>Reason</Label>
                                <Input
                                  value={moderationReason}
                                  onChange={(e) => setModerationReason(e.target.value)}
                                  placeholder="Reason for action"
                                />
                              </div>

                              <div className="space-y-2">
                                <Label>Fine Amount (ZMK)</Label>
                                <Input
                                  type="number"
                                  value={fineAmount}
                                  onChange={(e) => setFineAmount(e.target.value)}
                                  placeholder="Optional fine amount"
                                />
                              </div>

                              <Button onClick={handleModerateUser} className="w-full">
                                Apply Action
                              </Button>
                            </div>
                          </DialogContent>
                        </Dialog>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="theme" className="space-y-4">
          <ThemeControl />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Admin;
