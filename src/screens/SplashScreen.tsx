import { useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { StatusBar } from '../components/StatusBar';

export function SplashScreen() {
  const { navigate, user } = useApp();

  useEffect(() => {
    const timer = setTimeout(() => {
      if (user) navigate('home');
      else navigate('onboarding');
    }, 2200);
    return () => clearTimeout(timer);
  }, [user]);

  return (
    <div className="absolute inset-0 bg-[#06060F] flex flex-col items-center justify-center overflow-hidden">
      <StatusBar />
      {/* Glow effects */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full bg-violet-700/30 blur-3xl" />
      <div className="absolute top-1/2 left-1/4 w-40 h-40 rounded-full bg-pink-600/20 blur-3xl" />

      <div className="relative flex flex-col items-center gap-4 animate-pulse-slow">
        {/* Logo */}
        <div className="flex flex-col items-center">
          <span className="text-5xl font-black tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-400 drop-shadow-lg">
            SUMVIBE
          </span>
          <div className="w-full h-0.5 bg-gradient-to-r from-transparent via-amber-400 to-transparent mt-1" />
          <span className="text-xs text-gray-400 tracking-[0.3em] mt-2 uppercase">
            Vibrez. Réservez. Profitez.
          </span>
        </div>
      </div>
    </div>
  );
}
