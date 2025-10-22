import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  DollarSign, 
  User, 
  TrendingDown, 
  History, 
  CreditCard, 
  ShoppingCart 
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const ProfileMenu = () => {
  const navigate = useNavigate();

  const menuItems = [
    { icon: DollarSign, label: "Deposit", path: "/profile/deposit" },
    { icon: User, label: "Personal Information", path: "/profile/personal-info" },
    { icon: TrendingDown, label: "Withdraw", path: "/profile/withdraw" },
    { icon: History, label: "Transaction History", path: "/profile/transactions" },
    { icon: CreditCard, label: "Pay for Subscription", path: "/profile/subscriptions" },
    { icon: ShoppingCart, label: "Go to Checkout", path: "/cart" },
  ];

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold">Profile</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {menuItems.map((item) => (
          <Card
            key={item.path}
            className="cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => navigate(item.path)}
          >
            <CardContent className="flex flex-col items-center justify-center p-8 space-y-4">
              <item.icon className="w-12 h-12 text-primary" />
              <span className="text-lg font-semibold text-center">{item.label}</span>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default ProfileMenu;