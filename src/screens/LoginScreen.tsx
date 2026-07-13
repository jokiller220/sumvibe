import { useState } from 'react';
import { Eye, EyeOff, ChevronLeft } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { supabase } from '../lib/supabase';
import { StatusBar } from '../components/StatusBar';

export function LoginScreen() {
  const { navigate, goBack } = useApp();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async () => {
    if (!email || !password) { setError('Remplissez tous les champs'); return; }
    setLoading(true);
    setError('');
    const { error: err } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (err) setError(err.message);
    else navigate('home');
  };

  const handleForgotPassword = async () => {
    if (!email) { setError('Entrez votre email d\'abord puis cliquez "Mot de passe oublié"'); return; }
    setLoading(true);
    setError('');
    const { error: err } = await supabase.auth.resetPasswordForEmail(email);
    setLoading(false);
    if (err) setError(err.message);
    else setError('✅ Email de réinitialisation envoyé ! Vérifiez votre boîte mail.');
  };

  return (
    <div className="absolute inset-0 bg-[#06060F] flex flex-col overflow-hidden">
      <StatusBar />

      <div className="flex-1 flex flex-col px-6 pt-4 pb-8 overflow-y-auto">
        <button onClick={goBack} className="w-8 h-8 flex items-center justify-center rounded-full bg-white/10 mb-6">
          <ChevronLeft size={18} className="text-white" />
        </button>

        {/* Logo */}
        <div className="mb-8">
          <span className="text-3xl font-black tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-amber-300">
            SUMVIBE
          </span>
        </div>

        <h1 className="text-2xl font-bold text-white mb-1">Bienvenue 👋</h1>
        <p className="text-gray-400 text-sm mb-8">Connectez-vous à votre compte</p>

        <div className="flex flex-col gap-4">
          <div>
            <label className="text-xs text-gray-400 mb-1.5 block">Email ou téléphone</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="votremail@exemple.com"
              className="w-full bg-[#13132A] border border-white/10 rounded-xl px-4 py-3.5 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-violet-500 transition-colors"
            />
          </div>
          <div>
            <label className="text-xs text-gray-400 mb-1.5 block">Mot de passe</label>
            <div className="relative">
              <input
                type={showPass ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-[#13132A] border border-white/10 rounded-xl px-4 py-3.5 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-violet-500 transition-colors pr-12"
              />
              <button
                onClick={() => setShowPass(v => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
              >
                {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            <div className="flex justify-end mt-1.5">
              <button onClick={handleForgotPassword} className="text-xs text-violet-400 hover:text-violet-300 transition-colors">Mot de passe oublié ?</button>
            </div>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3 text-red-400 text-xs">
              {error}
            </div>
          )}

          <button
            onClick={handleLogin}
            disabled={loading}
            className="w-full py-4 bg-violet-600 hover:bg-violet-500 active:bg-violet-700 text-white font-semibold rounded-2xl transition-colors disabled:opacity-60 mt-2"
          >
            {loading ? 'Connexion...' : 'Se connecter'}
          </button>

          <div className="flex items-center gap-3 my-2">
            <div className="flex-1 h-px bg-white/10" />
            <span className="text-gray-600 text-xs">ou</span>
            <div className="flex-1 h-px bg-white/10" />
          </div>

          <button className="w-full py-3.5 bg-white/5 border border-white/10 rounded-2xl text-white text-sm font-medium flex items-center justify-center gap-3 hover:bg-white/10 transition-colors">
            <svg viewBox="0 0 24 24" width="18" height="18">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Se connecter avec Google
          </button>
        </div>

        <div className="mt-auto pt-8 text-center">
          <span className="text-gray-500 text-sm">Pas encore de compte ? </span>
          <button onClick={() => navigate('register')} className="text-violet-400 text-sm font-semibold">
            S&apos;inscrire
          </button>
        </div>
      </div>
    </div>
  );
}
