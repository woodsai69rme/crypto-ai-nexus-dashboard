
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { useToast } from '@/hooks/use-toast';
import { Eye, EyeOff, TrendingUp, Shield, Zap, AlertCircle } from 'lucide-react';
import { validateEmail, validatePassword, sanitizeInput } from '@/utils/validation';

export default function Auth() {
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [activeTab, setActiveTab] = useState<'signup' | 'signin'>('signup');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const { signIn, signUp, user } = useAuth();
  const { toast } = useToast();

  // Redirect if already authenticated
  useEffect(() => {
    if (user) {
      window.location.href = '/';
    }
  }, [user]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!validateEmail(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (activeTab === 'signup') {
      const passwordValidation = validatePassword(formData.password);
      if (!passwordValidation.isValid) {
        newErrors.password = passwordValidation.errors[0];
      }

      if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match';
      }
    } else {
      if (!formData.password) {
        newErrors.password = 'Password is required';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: sanitizeInput(value)
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

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
      console.error('Sign in error:', error);
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
    
    if (!validateForm()) return;

    setIsLoading(true);

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
      console.error('Sign up error:', error);
      toast({
        title: "Registration Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const renderInput = (
    id: string,
    name: string,
    type: string,
    placeholder: string,
    value: string,
    required = true,
    showToggle = false
  ) => (
    <div className="space-y-2">
      <Label htmlFor={id} className="text-slate-200">
        {name.charAt(0).toUpperCase() + name.slice(1)}
      </Label>
      <div className="relative">
        <Input
          id={id}
          name={name}
          type={showToggle && showPassword ? "text" : type}
          placeholder={placeholder}
          value={value}
          onChange={handleInputChange}
          required={required}
          disabled={isLoading}
          className={`bg-slate-700 border-slate-600 text-white placeholder:text-slate-400 ${
            showToggle ? 'pr-10' : ''
          } ${errors[name] ? 'border-red-500' : ''}`}
        />
        {showToggle && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-200"
          >
            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        )}
      </div>
      {errors[name] && (
        <div className="flex items-center space-x-1 text-red-400 text-sm">
          <AlertCircle size={16} />
          <span>{errors[name]}</span>
        </div>
      )}
    </div>
  );

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
              <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'signup' | 'signin')} className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-6">
                  <TabsTrigger value="signup">Sign Up</TabsTrigger>
                  <TabsTrigger value="signin">Sign In</TabsTrigger>
                </TabsList>

                <TabsContent value="signup">
                  <form onSubmit={handleSignUp} className="space-y-4">
                    {renderInput(
                      'signup-email',
                      'email',
                      'email',
                      'your@email.com',
                      formData.email
                    )}

                    {renderInput(
                      'signup-password',
                      'password',
                      'password',
                      'Create a strong password',
                      formData.password,
                      true,
                      true
                    )}

                    {renderInput(
                      'confirm-password',
                      'confirmPassword',
                      'password',
                      'Confirm your password',
                      formData.confirmPassword,
                      true,
                      true
                    )}

                    <Button 
                      type="submit" 
                      className="w-full bg-emerald-500 hover:bg-emerald-600 text-white"
                      disabled={isLoading}
                    >
                      {isLoading && <LoadingSpinner size="sm" className="mr-2" />}
                      Create Account
                    </Button>

                    <p className="text-xs text-slate-400 text-center">
                      By signing up, you agree to our Terms of Service and Privacy Policy
                    </p>
                  </form>
                </TabsContent>

                <TabsContent value="signin">
                  <form onSubmit={handleSignIn} className="space-y-4">
                    {renderInput(
                      'signin-email',
                      'email',
                      'email',
                      'your@email.com',
                      formData.email
                    )}

                    {renderInput(
                      'signin-password',
                      'password',
                      'password',
                      'Enter your password',
                      formData.password,
                      true,
                      true
                    )}

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
                    >
                      {isLoading && <LoadingSpinner size="sm" className="mr-2" />}
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
