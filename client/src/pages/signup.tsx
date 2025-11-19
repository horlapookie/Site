import { useEffect } from "react";
import { Header } from "@/components/header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient, setToken } from "@/lib/queryClient";
import { useLocation } from "wouter";
import { Gift, Mail, Lock, User, CheckCircle, XCircle } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQuery } from "@tanstack/react-query";

const signupSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  referralCode: z.string().optional(),
});

type SignupFormValues = z.infer<typeof signupSchema>;

export default function Signup() {
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  const form = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      email: "",
      password: "",
      firstName: "",
      lastName: "",
      referralCode: "",
    },
  });

  const referralCode = form.watch("referralCode");

  // Auto-populate referral code from URL parameter
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const refCode = params.get('ref');
    if (refCode) {
      form.setValue("referralCode", refCode.toUpperCase());
    }
  }, [form]);

  // Validate referral code
  const hasReferral = !!referralCode?.trim();
  const { data: referralValidation, isLoading: isValidating } = useQuery<{ valid: boolean }>({
    queryKey: ['/api/referral/validate', referralCode],
    queryFn: async () => {
      return await apiRequest("GET", `/api/referral/validate/${referralCode}`);
    },
    enabled: hasReferral,
  });

  const isValidReferralCode = hasReferral && referralValidation?.valid === true;
  const isInvalidReferralCode = hasReferral && referralValidation?.valid === false;

  const onSubmit = async (values: SignupFormValues) => {
    try {
      const response = await apiRequest("POST", "/api/auth/register", {
        email: values.email,
        password: values.password,
        firstName: values.firstName || undefined,
        lastName: values.lastName || undefined,
        referralCode: values.referralCode || undefined,
      });

      // Store the JWT token
      setToken(response.token);

      // Invalidate the auth query to refetch user data
      await queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });

      toast({
        title: "Account Created!",
        description: `Welcome! You've received ${isValidReferralCode ? "15" : "10"} coins to get started.`,
      });

      setLocation("/dashboard");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to create account. Please try again.",
        variant: "destructive",
      });
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
                Sign up and get free coins to deploy your first bot
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                            <Input
                              {...field}
                              type="email"
                              placeholder="your@email.com"
                              className="pl-9"
                              data-testid="input-email"
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Password</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                            <Input
                              {...field}
                              type="password"
                              placeholder="At least 6 characters"
                              className="pl-9"
                              data-testid="input-password"
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="firstName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>First Name (Optional)</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                              <Input
                                {...field}
                                type="text"
                                placeholder="John"
                                className="pl-9"
                                data-testid="input-firstname"
                              />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="lastName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Last Name (Optional)</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              type="text"
                              placeholder="Doe"
                              data-testid="input-lastname"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="referralCode"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Referral Code (Optional)</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input
                              {...field}
                              placeholder="Enter referral code"
                              onChange={(e) => field.onChange(e.target.value.toUpperCase())}
                              className={
                                isInvalidReferralCode
                                  ? "border-destructive pr-10"
                                  : isValidReferralCode
                                  ? "border-green-500 pr-10"
                                  : ""
                              }
                              data-testid="input-referralcode"
                            />
                            {isValidating && referralCode && (
                              <div className="absolute right-3 top-3">
                                <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                              </div>
                            )}
                            {!isValidating && isValidReferralCode && (
                              <CheckCircle className="absolute right-3 top-3 h-4 w-4 text-green-500" />
                            )}
                            {!isValidating && isInvalidReferralCode && (
                              <XCircle className="absolute right-3 top-3 h-4 w-4 text-destructive" />
                            )}
                          </div>
                        </FormControl>
                        {isValidReferralCode && (
                          <p className="text-sm text-green-600" data-testid="text-referral-valid">
                            Valid referral code! You'll get 15 coins instead of 10
                          </p>
                        )}
                        {isInvalidReferralCode && (
                          <p className="text-sm text-destructive" data-testid="text-referral-invalid">
                            Invalid referral code
                          </p>
                        )}
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="rounded-md border bg-muted/50 p-4">
                    <div className="flex items-center gap-2">
                      <Gift className="h-5 w-5 text-primary" />
                      <div>
                        <p className="text-sm font-medium" data-testid="text-coins-bonus">
                          {isValidReferralCode ? "15 Free Coins" : "10 Free Coins"}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {isValidReferralCode 
                            ? "Bonus for using a referral code!" 
                            : "Perfect for your first deployment"}
                        </p>
                      </div>
                    </div>
                  </div>

                  <Button 
                    type="submit"
                    className="w-full"
                    disabled={form.formState.isSubmitting || isInvalidReferralCode}
                    data-testid="button-signup"
                  >
                    {form.formState.isSubmitting ? "Creating Account..." : "Create Account & Get Coins"}
                  </Button>
                </form>
              </Form>

              <p className="text-center text-sm text-muted-foreground">
                Already have an account?{" "}
                <button
                  onClick={() => setLocation("/login")}
                  className="text-primary hover:underline"
                  data-testid="link-login"
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
