import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Eye, EyeOff } from "lucide-react";

const Auth = () => {
  const navigate = useNavigate();
  const { signIn, signUp, user } = useAuth();
  const { toast } = useToast();
  const [loginData, setLoginData] = useState({ email: "", password: "", showPassword: false });
  const [signupData, setSignupData] = useState({ 
    email: "", 
    password: "",
    confirmPassword: "",
    fullName: "", 
    phoneNumber: "",
    wantsToBeVendor: false,
    nrcNumber: "",
    showPassword: false,
    showConfirmPassword: false,
  });
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState("");
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    const { error } = await signIn(loginData.email, loginData.password);
    
    if (error) {
      toast({
        title: "Login failed",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Welcome back!",
      });
      navigate('/');
    }
    setLoading(false);
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (signupData.password !== signupData.confirmPassword) {
      toast({
        title: "Passwords don't match",
        variant: "destructive",
      });
      return;
    }

    if (signupData.wantsToBeVendor && !signupData.nrcNumber) {
      toast({
        title: "NRC required for vendors",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    
    const { error } = await signUp(
      signupData.email, 
      signupData.password,
      signupData.fullName,
      signupData.phoneNumber
    );

    if (error) {
      toast({
        title: "Signup failed",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Account created!",
      });
      navigate('/');
    }
    
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-primary/5 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold">PluGS</CardTitle>
          <CardDescription>Your local marketplace</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">Login</TabsTrigger>
              <TabsTrigger value="signup">Sign Up</TabsTrigger>
            </TabsList>
            
            <TabsContent value="login">
              {showForgotPassword ? (
                <div className="space-y-4">
                  <Input
                    type="email"
                    value={forgotPasswordEmail}
                    onChange={(e) => setForgotPasswordEmail(e.target.value)}
                    placeholder="Enter your email"
                  />
                  <Button onClick={() => { toast({ title: "Reset email sent" }); setShowForgotPassword(false); }} className="w-full">
                    Reset Password
                  </Button>
                  <Button variant="outline" onClick={() => setShowForgotPassword(false)} className="w-full">
                    Cancel
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label>Email</Label>
                    <Input
                      type="email"
                      value={loginData.email}
                      onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Password</Label>
                    <div className="relative">
                      <Input
                        type={loginData.showPassword ? "text" : "password"}
                        value={loginData.password}
                        onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                        required
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-0 top-0"
                        onClick={() => setLoginData({ ...loginData, showPassword: !loginData.showPassword })}
                      >
                        {loginData.showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </Button>
                    </div>
                  </div>
                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                    Sign In
                  </Button>
                  <Button type="button" variant="link" className="w-full" onClick={() => setShowForgotPassword(true)}>
                    Forgot Password?
                  </Button>
                </form>
              )}
            </TabsContent>
            
            <TabsContent value="signup">
              <form onSubmit={handleSignup} className="space-y-4">
                <div className="space-y-2">
                  <Label>Full Name</Label>
                  <Input value={signupData.fullName} onChange={(e) => setSignupData({ ...signupData, fullName: e.target.value })} required />
                </div>
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input type="email" value={signupData.email} onChange={(e) => setSignupData({ ...signupData, email: e.target.value })} required />
                </div>
                <div className="space-y-2">
                  <Label>Phone</Label>
                  <Input type="tel" value={signupData.phoneNumber} onChange={(e) => setSignupData({ ...signupData, phoneNumber: e.target.value })} required />
                </div>
                <div className="space-y-2">
                  <Label>Password</Label>
                  <div className="relative">
                    <Input type={signupData.showPassword ? "text" : "password"} value={signupData.password} onChange={(e) => setSignupData({ ...signupData, password: e.target.value })} required />
                    <Button type="button" variant="ghost" size="icon" className="absolute right-0 top-0" onClick={() => setSignupData({ ...signupData, showPassword: !signupData.showPassword })}>
                      {signupData.showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </Button>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Confirm Password</Label>
                  <div className="relative">
                    <Input type={signupData.showConfirmPassword ? "text" : "password"} value={signupData.confirmPassword} onChange={(e) => setSignupData({ ...signupData, confirmPassword: e.target.value })} required />
                    <Button type="button" variant="ghost" size="icon" className="absolute right-0 top-0" onClick={() => setSignupData({ ...signupData, showConfirmPassword: !signupData.showConfirmPassword })}>
                      {signupData.showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </Button>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch checked={signupData.wantsToBeVendor} onCheckedChange={(checked) => setSignupData({ ...signupData, wantsToBeVendor: checked })} />
                  <Label>I want to be a vendor</Label>
                </div>
                {signupData.wantsToBeVendor && (
                  <div className="space-y-2">
                    <Label>NRC Number</Label>
                    <Input value={signupData.nrcNumber} onChange={(e) => setSignupData({ ...signupData, nrcNumber: e.target.value })} required />
                  </div>
                )}
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  Sign Up
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default Auth;