import { Header } from "@/components/header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient, setToken } from "@/lib/queryClient";
import { useLocation } from "wouter";
import { Mail, Lock, LogIn } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-blue-950 dark:via-purple-950 dark:to-pink-950">
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-20 right-10 w-72 h-72 bg-blue-300 rounded-full mix-blend-multiply filter blur-3xl animate-pulse" style={{animationDuration: '8s'}}></div>
        <div className="absolute bottom-20 left-10 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl animate-pulse" style={{animationDuration: '10s', animationDelay: '2s'}}></div>
      </div>

      <div className="relative z-10">
        <Header isAuthenticated={false} />
        
        <main className="container px-4 py-8 md:px-6">
          <div className="mx-auto max-w-lg">
            <div className="text-center mb-8">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900">
                <LogIn className="h-8 w-8 text-blue-600 dark:text-blue-300" />
              </div>
              <h1 className="text-3xl font-bold">Welcome Back</h1>
              <p className="text-muted-foreground mt-2">
                Log in to manage your Eclipse-MD bots
              </p>
            </div>
            
            <Card className="shadow-lg backdrop-blur-sm bg-white/80 dark:bg-slate-900/80">
              <CardHeader className="text-center pb-4">
                <CardTitle>Secure Login</CardTitle>
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
                      className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
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
                    className="text-blue-600 dark:text-blue-400 hover:underline font-medium"
                    data-testid="link-signup"
                  >
                    Sign up for free
                  </button>
                </p>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}
