import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ShoppingCart, Trash2 } from "lucide-react";

const Cart = () => {
  const cartItems = [
    { id: 1, name: "Premium Headphones", price: 299.99, quantity: 1 },
    { id: 2, name: "Smart Watch", price: 199.99, quantity: 2 },
  ];

  const total = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-3">
        <ShoppingCart className="w-8 h-8 text-icon-cart" />
        <h1 className="text-3xl font-bold">Shopping Cart</h1>
      </div>

      {cartItems.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center py-16">
            <ShoppingCart className="w-16 h-16 text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold mb-2">Your cart is empty</h3>
            <p className="text-muted-foreground">Add some products to get started</p>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="space-y-4">
            {cartItems.map((item) => (
              <Card key={item.id}>
                <CardContent className="flex justify-between items-center p-6">
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg">{item.name}</h3>
                    <p className="text-muted-foreground">Quantity: {item.quantity}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <p className="text-xl font-bold">ZMW {(item.price * item.quantity).toFixed(2)}</p>
                    <Button variant="destructive" size="icon">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between text-lg">
                <span>Subtotal</span>
                <span>ZMW {total.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-lg">
                <span>Shipping</span>
                <span>ZMW 20.00</span>
              </div>
              <div className="border-t pt-4 flex justify-between text-xl font-bold">
                <span>Total</span>
                <span>ZMW {(total + 20).toFixed(2)}</span>
              </div>
              <Button className="w-full" size="lg">Proceed to Checkout</Button>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
};

export default Cart;
