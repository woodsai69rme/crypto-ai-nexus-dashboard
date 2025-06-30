
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import { AuthGuard } from '@/components/auth/AuthGuard';
import { MainDashboard } from '@/components/dashboard/MainDashboard';
import { Auth } from '@/pages/Auth';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000, // 1 minute
      retry: 1,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <Routes>
          <Route 
            path="/auth" 
            element={
              <AuthGuard requireAuth={false}>
                <Auth />
              </AuthGuard>
            } 
          />
          <Route 
            path="/*" 
            element={
              <AuthGuard requireAuth={true}>
                <MainDashboard />
              </AuthGuard>
            } 
          />
        </Routes>
        <Toaster />
      </Router>
    </QueryClientProvider>
  );
}

export default App;
