
import { useState } from 'react';
import { Bell, Settings, User, TrendingUp, Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useSettings } from '@/contexts/SettingsContext';

interface TopBarProps {
  onOpenSettings: () => void;
  onOpenNotifications: () => void;
  onOpenProfile: () => void;
}

export const TopBar = ({ onOpenSettings, onOpenNotifications, onOpenProfile }: TopBarProps) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { settings } = useSettings();

  return (
    <div className="fixed top-0 left-0 right-0 bg-slate-900/95 backdrop-blur-sm border-b border-slate-700 z-50 h-16">
      <div className="flex items-center justify-between px-4 h-full">
        {/* Logo */}
        <div className="flex items-center space-x-3">
          <TrendingUp className="h-8 w-8 text-emerald-500" />
          <h1 className={`text-xl font-bold bg-gradient-to-r from-emerald-400 to-blue-500 bg-clip-text text-transparent ${settings.animations ? 'transition-all duration-300' : ''}`}>
            CryptoMax
          </h1>
        </div>

        {/* Desktop Actions */}
        <div className="hidden md:flex items-center space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={onOpenNotifications}
            className={`relative hover:bg-slate-700/50 ${settings.animations ? 'transition-all duration-200' : ''}`}
          >
            <Bell className="h-4 w-4" />
            <Badge 
              variant="destructive" 
              className="absolute -top-1 -right-1 h-5 w-5 text-xs p-0 flex items-center justify-center"
            >
              3
            </Badge>
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={onOpenProfile}
            className={`hover:bg-slate-700/50 ${settings.animations ? 'transition-all duration-200' : ''}`}
          >
            <User className="h-4 w-4" />
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={onOpenSettings}
            className={`hover:bg-slate-700/50 ${settings.animations ? 'transition-all duration-200' : ''}`}
          >
            <Settings className="h-4 w-4" />
          </Button>
        </div>

        {/* Mobile Menu Toggle */}
        <div className="md:hidden">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className={`hover:bg-slate-700/50 ${settings.animations ? 'transition-all duration-200' : ''}`}
          >
            {isMobileMenuOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </Button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className={`md:hidden border-t border-slate-700 bg-slate-900/95 backdrop-blur-sm ${settings.animations ? 'animate-slide-down' : ''}`}>
          <div className="flex flex-col p-4 space-y-2">
            <Button
              variant="ghost"
              className="justify-start hover:bg-slate-700/50"
              onClick={() => {
                onOpenNotifications();
                setIsMobileMenuOpen(false);
              }}
            >
              <Bell className="h-4 w-4 mr-2" />
              Notifications
              <Badge 
                variant="destructive" 
                className="ml-auto h-5 w-5 text-xs p-0 flex items-center justify-center"
              >
                3
              </Badge>
            </Button>
            
            <Button
              variant="ghost"
              className="justify-start hover:bg-slate-700/50"
              onClick={() => {
                onOpenProfile();
                setIsMobileMenuOpen(false);
              }}
            >
              <User className="h-4 w-4 mr-2" />
              Profile
            </Button>
            
            <Button
              variant="ghost"
              className="justify-start hover:bg-slate-700/50"
              onClick={() => {
                onOpenSettings();
                setIsMobileMenuOpen(false);
              }}
            >
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </Button>
          </div>
        </div>
      )}

      <style>{`
        @keyframes slide-down {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-slide-down {
          animation: slide-down 200ms ease-out;
        }
      `}</style>
    </div>
  );
};
