
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { Home, TrendingUp, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center space-y-8">
        {/* 404 Animation */}
        <div className="relative">
          <div className="text-9xl font-bold text-emerald-500/20 select-none">404</div>
          <div className="absolute inset-0 flex items-center justify-center">
            <TrendingUp className="h-16 w-16 text-emerald-500 animate-pulse" />
          </div>
        </div>

        {/* Error Message */}
        <div className="space-y-4">
          <h1 className="text-3xl font-bold text-white">Page Not Found</h1>
          <p className="text-slate-300 text-lg">
            Looks like this trading pair doesn't exist in our market!
          </p>
          <p className="text-slate-400 text-sm">
            The page you're looking for might have been moved, deleted, or never existed.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="space-y-4">
          <Button 
            onClick={() => navigate('/')}
            className="w-full bg-emerald-500 hover:bg-emerald-600 text-white"
            size="lg"
          >
            <Home className="mr-2 h-5 w-5" />
            Back to Dashboard
          </Button>
          
          <Button 
            onClick={() => navigate(-1)}
            variant="outline"
            className="w-full border-slate-600 text-slate-300 hover:bg-slate-800"
            size="lg"
          >
            <ArrowLeft className="mr-2 h-5 w-5" />
            Go Back
          </Button>
        </div>

        {/* Help Section */}
        <div className="p-6 bg-slate-800/50 rounded-lg border border-slate-700">
          <h3 className="text-lg font-semibold text-white mb-2">Need Help?</h3>
          <p className="text-slate-300 text-sm mb-4">
            If you believe this is an error, please contact our support team.
          </p>
          <div className="space-y-2 text-xs text-slate-400">
            <p>• Check the URL for typos</p>
            <p>• Try refreshing the page</p>
            <p>• Contact support if the problem persists</p>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center text-slate-500 text-sm">
          <p>© 2024 CryptoMax. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
}
