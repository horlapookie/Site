import { Header } from "@/components/header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient, setToken } from "@/lib/queryClient";
import { useLocation } from "wouter";
import { Mail, Lock, LogIn, Zap } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { PropellerBanner } from "@/components/propeller-banner";

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function Login() {
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (values: LoginFormValues) => {
    try {
      const response = await apiRequest("POST", "/api/auth/login", values);

      setToken(response.token);

      await queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });

      toast({
        title: "Welcome back!",
        description: "You've successfully logged in",
      });

      setLocation("/dashboard");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Invalid email or password",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header isAuthenticated={false} />
      
      <main className="container px-4 py-8 md:px-6">
        <div className="mx-auto max-w-lg">
          <div className="text-center mb-8">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
              <LogIn className="h-8 w-8 text-primary" />
            </div>
            <h1 className="text-3xl font-bold">Welcome Back</h1>
            <p className="text-muted-foreground mt-2">
              Log in to manage your Eclipse-MD bots
            </p>
          </div>
          
          <div className="flex justify-center mb-6">
            <PropellerBanner width={300} height={100} />
          </div>
          
          <Card className="shadow-lg">
            <CardHeader className="text-center pb-4">
              <div className="inline-flex items-center gap-2 mx-auto rounded-full border bg-muted px-3 py-1 text-sm">
                <Zap className="h-4 w-4" />
                <span>Secure Login</span>
              </div>
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
                              placeholder="Enter your password"
                              className="pl-9"
                              data-testid="input-password"
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button 
                    type="submit"
                    className="w-full"
                    size="lg"
                    disabled={form.formState.isSubmitting}
                    data-testid="button-login"
                  >
                    {form.formState.isSubmitting ? "Logging in..." : "Log In"}
                  </Button>
                </form>
              </Form>

              <p className="text-center text-sm text-muted-foreground">
                Don't have an account?{" "}
                <button
                  onClick={() => setLocation("/signup")}
                  className="text-primary hover:underline font-medium"
                  data-testid="link-signup"
                >
                  Sign up for free
                </button>
              </p>
            </CardContent>
          </Card>
          
          <div className="mt-8 flex justify-center">
            <PropellerBanner width={300} height={250} />
          </div>
        </div>
      </main>
    </div>
  );
}
