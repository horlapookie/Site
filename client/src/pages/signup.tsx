import { useState, useEffect } from "react";
import { Header } from "@/components/header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useLocation } from "wouter";
import { Gift, Mail, Lock, User } from "lucide-react";
import { queryClient } from "@/lib/queryClient";


export default function Signup() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [referralCode, setReferralCode] = useState("");
  const [isValidating, setIsValidating] = useState(false);
  const [isValid, setIsValid] = useState<boolean | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  // Auto-populate referral code from URL parameter
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const refCode = params.get('ref');
    if (refCode) {
      const code = refCode.toUpperCase();
      setReferralCode(code);
      validateReferralCode(code);
    }
  }, []);

  const validateReferralCode = async (code: string) => {
    if (!code) {
      setIsValid(null);
      return;
    }

    setIsValidating(true);
    try {
      const response = await apiRequest("GET", `/api/referral/validate/${code}`);
      setIsValid(response.valid);
    } catch (error) {
      setIsValid(false);
    } finally {
      setIsValidating(false);
    }
  };

  const handleSignup = async () => {
    if (!email || !password) {
      toast({
        title: "Error",
        description: "Email and password are required",
        variant: "destructive",
      });
      return;
    }

    if (password.length < 6) {
      toast({
        title: "Error",
        description: "Password must be at least 6 characters",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      await apiRequest("POST", "/api/auth/register", {
        email,
        password,
        firstName: firstName || undefined,
        lastName: lastName || undefined,
        referralCode: referralCode || undefined,
      });

      toast({
        title: "Account Created!",
        description: `Welcome! You've received ${referralCode && isValid ? "15" : "10"} coins to get started.`,
      });

      // Force full page reload to ensure cookie is set
      setTimeout(() => {
        window.location.href = "/dashboard";
      }, 100);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to complete signup. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header isAuthenticated={false} />

      <main className="container px-4 py-16 md:px-6">
        <div className="mx-auto max-w-md">
          <Card>
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                <Gift className="h-6 w-6 text-primary" />
              </div>
              <CardTitle className="text-2xl">Create Your Account</CardTitle>
              <CardDescription>
                Sign up with your email and get free coins to deploy your first bot
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="your@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-9"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="At least 6 characters"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-9"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name (Optional)</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="firstName"
                      type="text"
                      placeholder="John"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      className="pl-9"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name (Optional)</Label>
                  <Input
                    id="lastName"
                    type="text"
                    placeholder="Doe"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="referral-code">
                  Referral Code (Optional)
                </Label>
                <Input
                  id="referral-code"
                  placeholder="Enter referral code"
                  value={referralCode}
                  onChange={(e) => {
                    const code = e.target.value.toUpperCase();
                    setReferralCode(code);
                    validateReferralCode(code);
                  }}
                  className={
                    referralCode && isValid === false
                      ? "border-destructive"
                      : referralCode && isValid === true
                      ? "border-green-500"
                      : ""
                  }
                />
                {isValidating && (
                  <p className="text-sm text-muted-foreground">Validating...</p>
                )}
                {referralCode && isValid === true && (
                  <p className="text-sm text-green-600">
                    ✓ Valid referral code! You'll get 15 coins instead of 10
                  </p>
                )}
                {referralCode && isValid === false && (
                  <p className="text-sm text-destructive">
                    ✗ Invalid referral code
                  </p>
                )}
              </div>

              <div className="rounded-lg border bg-muted/50 p-4">
                <div className="flex items-center gap-2">
                  <Gift className="h-5 w-5 text-primary" />
                  <div>
                    <p className="text-sm font-medium">
                      {referralCode && isValid ? "15 Free Coins" : "10 Free Coins"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {referralCode && isValid 
                        ? "Bonus for using a referral code!" 
                        : "Perfect for your first deployment"}
                    </p>
                  </div>
                </div>
              </div>

              <Button 
                onClick={handleSignup} 
                className="w-full"
                disabled={isSubmitting || (referralCode ? isValid !== true : false)}
              >
                {isSubmitting ? "Creating Account..." : "Create Account & Get Coins"}
              </Button>

              <p className="text-center text-sm text-muted-foreground">
                Already have an account?{" "}
                <button
                  onClick={() => setLocation("/login")}
                  className="text-primary hover:underline"
                >
                  Log in
                </button>
              </p>

              <p className="text-center text-xs text-muted-foreground">
                By signing up, you agree to our Terms of Service
              </p>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}