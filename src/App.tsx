
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import { SettingsProvider } from '@/contexts/SettingsContext';
import { AuthGuard } from '@/components/auth/AuthGuard';
import { MainDashboard } from '@/components/dashboard/MainDashboard';
import Auth from '@/pages/Auth';

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
      <SettingsProvider>
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
      </SettingsProvider>
    </QueryClientProvider>
  );
}

export default App;
