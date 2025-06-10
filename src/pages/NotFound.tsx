
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { TrendingUp, Home } from 'lucide-react';

const NotFound = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
      <div className="text-center space-y-6 max-w-md mx-auto px-4">
        <div className="flex items-center justify-center space-x-3 mb-8">
          <TrendingUp className="h-12 w-12 text-emerald-500" />
          <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-400 to-blue-500 bg-clip-text text-transparent">
            CryptoMax
          </h1>
        </div>
        
        <div className="space-y-4">
          <h2 className="text-6xl font-bold text-emerald-400">404</h2>
          <h3 className="text-2xl font-bold text-white">Page Not Found</h3>
          <p className="text-slate-300">
            The page you're looking for doesn't exist or has been moved.
          </p>
        </div>

        <div className="pt-6">
          <Link to="/">
            <Button className="bg-emerald-500 hover:bg-emerald-600">
              <Home className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
