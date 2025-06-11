
import { useSettings } from '@/contexts/SettingsContext';
import { Flame } from 'lucide-react';
import { useEffect, useState } from 'react';

export const VisualEffects = () => {
  const { settings } = useSettings();
  const [lightningActive, setLightningActive] = useState(false);

  useEffect(() => {
    if (!settings.visualEffects) return;

    const lightningInterval = setInterval(() => {
      if (Math.random() < 0.1) { // 10% chance every 3 seconds
        setLightningActive(true);
        setTimeout(() => setLightningActive(false), 200);
      }
    }, 3000);

    return () => clearInterval(lightningInterval);
  }, [settings.visualEffects]);

  if (!settings.visualEffects) return null;

  return (
    <>
      {/* Animated Background Particles */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-900/5 via-transparent to-blue-900/5 animate-pulse"></div>
        
        {/* Floating Particles */}
        {Array.from({ length: 20 }).map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-emerald-400/30 rounded-full animate-float"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 10}s`,
              animationDuration: `${8 + Math.random() * 4}s`,
            }}
          />
        ))}
      </div>

      {/* Lightning Effect */}
      {lightningActive && (
        <div className="fixed inset-0 pointer-events-none z-10">
          <div className="absolute inset-0 bg-blue-400/10 animate-lightning"></div>
          <div className="absolute top-0 left-1/4 w-0.5 h-full bg-gradient-to-b from-blue-400 to-transparent animate-lightning-bolt"></div>
          <div className="absolute top-0 right-1/3 w-0.5 h-3/4 bg-gradient-to-b from-purple-400 to-transparent animate-lightning-bolt" style={{ animationDelay: '50ms' }}></div>
        </div>
      )}

      {/* Flame Effects on Trending Items */}
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); opacity: 0.3; }
          25% { transform: translateY(-20px) rotate(90deg); opacity: 0.6; }
          50% { transform: translateY(-40px) rotate(180deg); opacity: 1; }
          75% { transform: translateY(-20px) rotate(270deg); opacity: 0.6; }
        }
        
        @keyframes lightning {
          0% { opacity: 0; }
          10% { opacity: 1; }
          20% { opacity: 0; }
          30% { opacity: 1; }
          40% { opacity: 0; }
          100% { opacity: 0; }
        }
        
        @keyframes lightning-bolt {
          0% { opacity: 0; transform: scaleY(0); }
          10% { opacity: 1; transform: scaleY(1); }
          20% { opacity: 0; transform: scaleY(0); }
          30% { opacity: 1; transform: scaleY(1); }
          40% { opacity: 0; transform: scaleY(0); }
          100% { opacity: 0; transform: scaleY(0); }
        }
        
        .animate-float {
          animation: float 10s ease-in-out infinite;
        }
        
        .animate-lightning {
          animation: lightning 200ms ease-in-out;
        }
        
        .animate-lightning-bolt {
          animation: lightning-bolt 200ms ease-in-out;
          transform-origin: top;
        }
      `}</style>
    </>
  );
};

export const FlameIcon = ({ className = "", trending = false }: { className?: string; trending?: boolean }) => {
  const { settings } = useSettings();
  
  if (!settings.visualEffects) {
    return <Flame className={className} />;
  }

  return (
    <div className={`relative ${className}`}>
      <Flame className={`${trending ? 'text-orange-500 animate-pulse' : 'text-emerald-400'} ${settings.animations ? 'transition-all duration-300' : ''}`} />
      {trending && (
        <div className="absolute inset-0">
          <Flame className="text-red-400 animate-ping opacity-75" />
        </div>
      )}
    </div>
  );
};
