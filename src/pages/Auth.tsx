
import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { useToast } from '@/hooks/use-toast';
import { Eye, EyeOff, TrendingUp, Shield, Zap } from 'lucide-react';

export default function Auth() {
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: ''
  });
  
  const { signIn, signUp } = useAuth();
  const { toast } = useToast();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { error } = await signIn(formData.email, formData.password);
      
      if (error) {
        toast({
          title: "Login Failed",
          description: error.message,
          variant: "destructive"
        });
      } else {
        toast({
          title: "Welcome back!",
          description: "Successfully logged in to CryptoMax"
        });
      }
    } catch (error) {
      toast({
        title: "Login Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    if (formData.password !== formData.confirmPassword) {
      toast({
        title: "Password Mismatch",
        description: "Passwords do not match. Please try again.",
        variant: "destructive"
      });
      setIsLoading(false);
      return;
    }

    if (formData.password.length < 8) {
      toast({
        title: "Password Too Short",
        description: "Password must be at least 8 characters long.",
        variant: "destructive"
      });
      setIsLoading(false);
      return;
    }

    try {
      const { error } = await signUp(formData.email, formData.password);
      
      if (error) {
        toast({
          title: "Registration Failed",
          description: error.message,
          variant: "destructive"
        });
      } else {
        toast({
          title: "Registration Successful!",
          description: "Please check your email to verify your account."
        });
      }
    } catch (error) {
      toast({
        title: "Registration Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-6xl grid lg:grid-cols-2 gap-8 items-center">
        {/* Left side - Marketing content */}
        <div className="hidden lg:block space-y-8 text-white">
          <div>
            <h1 className="text-5xl font-bold mb-4">
              Welcome to <span className="text-emerald-400">CryptoMax</span>
            </h1>
            <p className="text-xl text-slate-300 mb-8">
              Australia's most advanced AI-powered cryptocurrency trading platform
            </p>
          </div>

          <div className="space-y-6">
            <div className="flex items-start space-x-4">
              <div className="p-3 bg-emerald-500/20 rounded-lg">
                <TrendingUp className="h-6 w-6 text-emerald-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-2">AI-Powered Trading Bots</h3>
                <p className="text-slate-300">
                  Let our advanced AI algorithms trade for you 24/7 with proven strategies
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="p-3 bg-purple-500/20 rounded-lg">
                <Shield className="h-6 w-6 text-purple-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-2">Paper Trading</h3>
                <p className="text-slate-300">
                  Learn and practice with $10,000 virtual AUD - no risk, real experience
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="p-3 bg-blue-500/20 rounded-lg">
                <Zap className="h-6 w-6 text-blue-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-2">Real-Time Data</h3>
                <p className="text-slate-300">
                  Professional-grade charts and market data updated every 10 seconds
                </p>
              </div>
            </div>
          </div>

          <div className="p-6 bg-slate-800/50 rounded-lg border border-slate-700">
            <p className="text-sm text-slate-400 mb-2">🚀 Join thousands of Australians</p>
            <p className="text-lg font-semibold">
              Start your crypto journey with <span className="text-emerald-400">confidence</span>
            </p>
          </div>
        </div>

        {/* Right side - Auth forms */}
        <div className="w-full max-w-md mx-auto">
          <Card className="bg-slate-800/80 border-slate-700 backdrop-blur">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl font-bold text-white">
                Get Started with CryptoMax
              </CardTitle>
              <CardDescription className="text-slate-300">
                Join Australia's leading crypto trading platform
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="signup" className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-6">
                  <TabsTrigger value="signup" data-testid="signup-tab">Sign Up</TabsTrigger>
                  <TabsTrigger value="signin">Sign In</TabsTrigger>
                </TabsList>

                <TabsContent value="signup">
                  <form onSubmit={handleSignUp} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="signup-email" className="text-slate-200">Email</Label>
                      <Input
                        id="signup-email"
                        name="email"
                        type="email"
                        placeholder="your@email.com"
                        value={formData.email}
                        onChange={handleInputChange}
                        required
                        disabled={isLoading}
                        data-testid="email-input"
                        className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-400"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="signup-password" className="text-slate-200">Password</Label>
                      <div className="relative">
                        <Input
                          id="signup-password"
                          name="password"
                          type={showPassword ? "text" : "password"}
                          placeholder="Create a strong password"
                          value={formData.password}
                          onChange={handleInputChange}
                          required
                          disabled={isLoading}
                          data-testid="password-input"
                          className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-400 pr-10"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-200"
                        >
                          {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                        </button>
                      </div>
                      <p className="text-xs text-slate-400">
                        Must be at least 8 characters long
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="confirm-password" className="text-slate-200">Confirm Password</Label>
                      <Input
                        id="confirm-password"
                        name="confirmPassword"
                        type={showPassword ? "text" : "password"}
                        placeholder="Confirm your password"
                        value={formData.confirmPassword}
                        onChange={handleInputChange}
                        required
                        disabled={isLoading}
                        data-testid="confirm-password-input"
                        className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-400"
                      />
                    </div>

                    <Button 
                      type="submit" 
                      className="w-full bg-emerald-500 hover:bg-emerald-600 text-white"
                      disabled={isLoading}
                      data-testid="signup-button"
                    >
                      {isLoading ? (
                        <LoadingSpinner size="sm" className="mr-2" />
                      ) : null}
                      Create Account
                    </Button>

                    <p className="text-xs text-slate-400 text-center">
                      By signing up, you agree to our Terms of Service and Privacy Policy
                    </p>
                  </form>
                </TabsContent>

                <TabsContent value="signin">
                  <form onSubmit={handleSignIn} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="signin-email" className="text-slate-200">Email</Label>
                      <Input
                        id="signin-email"
                        name="email"
                        type="email"
                        placeholder="your@email.com"
                        value={formData.email}
                        onChange={handleInputChange}
                        required
                        disabled={isLoading}
                        data-testid="email-input"
                        className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-400"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="signin-password" className="text-slate-200">Password</Label>
                      <div className="relative">
                        <Input
                          id="signin-password"
                          name="password"
                          type={showPassword ? "text" : "password"}
                          placeholder="Enter your password"
                          value={formData.password}
                          onChange={handleInputChange}
                          required
                          disabled={isLoading}
                          data-testid="password-input"
                          className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-400 pr-10"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-200"
                        >
                          {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <label className="flex items-center space-x-2 text-sm text-slate-300">
                        <input type="checkbox" className="rounded" />
                        <span>Remember me</span>
                      </label>
                      <button
                        type="button"
                        className="text-sm text-emerald-400 hover:text-emerald-300"
                      >
                        Forgot password?
                      </button>
                    </div>

                    <Button 
                      type="submit" 
                      className="w-full bg-emerald-500 hover:bg-emerald-600 text-white"
                      disabled={isLoading}
                      data-testid="login-button"
                    >
                      {isLoading ? (
                        <LoadingSpinner size="sm" className="mr-2" />
                      ) : null}
                      Sign In
                    </Button>
                  </form>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          {/* Mobile marketing content */}
          <div className="lg:hidden mt-8 text-center text-white">
            <h2 className="text-2xl font-bold mb-4">Why Choose CryptoMax?</h2>
            <div className="space-y-4 text-sm">
              <div className="flex items-center justify-center space-x-2">
                <TrendingUp className="h-5 w-5 text-emerald-400" />
                <span>AI-Powered Trading Bots</span>
              </div>
              <div className="flex items-center justify-center space-x-2">
                <Shield className="h-5 w-5 text-purple-400" />
                <span>Risk-Free Paper Trading</span>
              </div>
              <div className="flex items-center justify-center space-x-2">
                <Zap className="h-5 w-5 text-blue-400" />
                <span>Real-Time Market Data</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
