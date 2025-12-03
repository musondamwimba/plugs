import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Eye, EyeOff, Mail, Phone, ArrowLeft } from "lucide-react";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";

const Auth = () => {
  const navigate = useNavigate();
  const { signIn, signUp, user } = useAuth();
  const { toast } = useToast();
  const [loginMethod, setLoginMethod] = useState<'email' | 'phone'>('email');
  const [loginData, setLoginData] = useState({ email: "", phone: "", password: "", showPassword: false });
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
  const [showOTP, setShowOTP] = useState(false);
  const [otp, setOtp] = useState("");
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotMethod, setForgotMethod] = useState<'email' | 'phone'>('email');
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotPhone, setForgotPhone] = useState("");
  const [forgotOTP, setForgotOTP] = useState("");
  const [showForgotOTP, setShowForgotOTP] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);

  useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    const identifier = loginMethod === 'email' ? loginData.email : loginData.phone;
    const { error } = await signIn(identifier, loginData.password);
    
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
      setLoading(false);
    } else {
      setShowOTP(true);
      setLoading(false);
      toast({
        title: "Verification code sent!",
        description: "Check your email or phone for the OTP code.",
      });
    }
  };

  const handleVerifyOTP = () => {
    if (otp.length === 6) {
      toast({
        title: "Account verified!",
        description: "You can now log in.",
      });
      setShowOTP(false);
      navigate('/');
    } else {
      toast({
        title: "Invalid OTP",
        description: "Please enter a valid 6-digit code.",
        variant: "destructive",
      });
    }
  };

  const handleForgotPassword = async () => {
    setResetLoading(true);

    if (forgotMethod === 'email') {
      if (!forgotEmail) {
        toast({
          title: "Email required",
          description: "Please enter your email address.",
          variant: "destructive",
        });
        setResetLoading(false);
        return;
      }

      const { error } = await supabase.auth.resetPasswordForEmail(forgotEmail, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) {
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Reset link sent!",
          description: "Check your email for the password reset link.",
        });
        setShowForgotPassword(false);
        setForgotEmail("");
      }
    } else {
      // Phone OTP flow
      if (!forgotPhone) {
        toast({
          title: "Phone number required",
          description: "Please enter your phone number.",
          variant: "destructive",
        });
        setResetLoading(false);
        return;
      }

      const { error } = await supabase.auth.signInWithOtp({
        phone: forgotPhone,
      });

      if (error) {
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        });
      } else {
        setShowForgotOTP(true);
        toast({
          title: "OTP sent!",
          description: "Check your phone for the verification code.",
        });
      }
    }

    setResetLoading(false);
  };

  const handleVerifyForgotOTP = async () => {
    if (forgotOTP.length !== 6) {
      toast({
        title: "Invalid OTP",
        description: "Please enter a valid 6-digit code.",
        variant: "destructive",
      });
      return;
    }

    setResetLoading(true);

    const { error } = await supabase.auth.verifyOtp({
      phone: forgotPhone,
      token: forgotOTP,
      type: 'sms',
    });

    if (error) {
      toast({
        title: "Verification failed",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Verified!",
        description: "Redirecting to reset password...",
      });
      navigate('/reset-password');
    }

    setResetLoading(false);
  };

  const renderForgotPassword = () => (
    <div className="space-y-4">
      <Button
        variant="ghost"
        className="mb-2 -ml-2"
        onClick={() => {
          setShowForgotPassword(false);
          setShowForgotOTP(false);
          setForgotOTP("");
        }}
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Login
      </Button>

      <div className="text-center mb-4">
        <h3 className="font-semibold text-lg">Forgot Password</h3>
        <p className="text-sm text-muted-foreground">
          {showForgotOTP 
            ? "Enter the verification code sent to your phone" 
            : "Choose how you'd like to reset your password"}
        </p>
      </div>

      {showForgotOTP ? (
        <div className="space-y-4">
          <div className="flex justify-center">
            <InputOTP maxLength={6} value={forgotOTP} onChange={setForgotOTP}>
              <InputOTPGroup>
                <InputOTPSlot index={0} />
                <InputOTPSlot index={1} />
                <InputOTPSlot index={2} />
                <InputOTPSlot index={3} />
                <InputOTPSlot index={4} />
                <InputOTPSlot index={5} />
              </InputOTPGroup>
            </InputOTP>
          </div>
          <Button 
            onClick={handleVerifyForgotOTP} 
            className="w-full"
            disabled={resetLoading}
          >
            {resetLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Verify & Continue
          </Button>
          <Button 
            variant="outline" 
            onClick={() => setShowForgotOTP(false)} 
            className="w-full"
          >
            Back
          </Button>
        </div>
      ) : (
        <>
          <div className="flex gap-2 mb-4">
            <Button
              type="button"
              variant={forgotMethod === 'email' ? 'default' : 'outline'}
              className="flex-1"
              onClick={() => setForgotMethod('email')}
            >
              <Mail className="w-4 h-4 mr-2" />
              Email
            </Button>
            <Button
              type="button"
              variant={forgotMethod === 'phone' ? 'default' : 'outline'}
              className="flex-1"
              onClick={() => setForgotMethod('phone')}
            >
              <Phone className="w-4 h-4 mr-2" />
              Phone
            </Button>
          </div>

          {forgotMethod === 'email' ? (
            <div className="space-y-2">
              <Label>Email Address</Label>
              <Input
                type="email"
                value={forgotEmail}
                onChange={(e) => setForgotEmail(e.target.value)}
                placeholder="Enter your email"
              />
              <p className="text-xs text-muted-foreground">
                We'll send a password reset link to your email.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              <Label>Phone Number</Label>
              <Input
                type="tel"
                value={forgotPhone}
                onChange={(e) => setForgotPhone(e.target.value)}
                placeholder="+260..."
              />
              <p className="text-xs text-muted-foreground">
                We'll send a one-time PIN to your phone.
              </p>
            </div>
          )}

          <Button 
            onClick={handleForgotPassword} 
            className="w-full"
            disabled={resetLoading}
          >
            {resetLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            {forgotMethod === 'email' ? 'Send Reset Link' : 'Send OTP'}
          </Button>
        </>
      )}
    </div>
  );

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
                renderForgotPassword()
              ) : (
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="flex gap-2 mb-4">
                    <Button
                      type="button"
                      variant={loginMethod === 'email' ? 'default' : 'outline'}
                      className="flex-1"
                      onClick={() => setLoginMethod('email')}
                    >
                      <Mail className="w-4 h-4 mr-2" />
                      Email
                    </Button>
                    <Button
                      type="button"
                      variant={loginMethod === 'phone' ? 'default' : 'outline'}
                      className="flex-1"
                      onClick={() => setLoginMethod('phone')}
                    >
                      <Phone className="w-4 h-4 mr-2" />
                      Phone
                    </Button>
                  </div>

                  {loginMethod === 'email' ? (
                    <div className="space-y-2">
                      <Label>Email</Label>
                      <Input
                        type="email"
                        value={loginData.email}
                        onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                        required
                      />
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <Label>Phone Number</Label>
                      <Input
                        type="tel"
                        value={loginData.phone}
                        onChange={(e) => setLoginData({ ...loginData, phone: e.target.value })}
                        placeholder="+260..."
                        required
                      />
                    </div>
                  )}

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
              {showOTP ? (
                <div className="space-y-6 py-4">
                  <div className="text-center space-y-2">
                    <h3 className="font-semibold">Verify Your Account</h3>
                    <p className="text-sm text-muted-foreground">
                      Enter the 6-digit code sent to your email or phone
                    </p>
                  </div>
                  
                  <div className="flex justify-center">
                    <InputOTP maxLength={6} value={otp} onChange={setOtp}>
                      <InputOTPGroup>
                        <InputOTPSlot index={0} />
                        <InputOTPSlot index={1} />
                        <InputOTPSlot index={2} />
                        <InputOTPSlot index={3} />
                        <InputOTPSlot index={4} />
                        <InputOTPSlot index={5} />
                      </InputOTPGroup>
                    </InputOTP>
                  </div>

                  <Button onClick={handleVerifyOTP} className="w-full">
                    Verify Account
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    onClick={() => setShowOTP(false)} 
                    className="w-full"
                  >
                    Back to Sign Up
                  </Button>
                </div>
              ) : (
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
                    <Input type="tel" value={signupData.phoneNumber} onChange={(e) => setSignupData({ ...signupData, phoneNumber: e.target.value })} placeholder="+260..." required />
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
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default Auth;