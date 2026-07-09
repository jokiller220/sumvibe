import { useState } from 'react';
import { Eye, EyeOff, ChevronLeft } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { supabase } from '../lib/supabase';
import { StatusBar } from '../components/StatusBar';

export function RegisterScreen() {
  const { navigate, goBack } = useApp();
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', confirm: '' });
  const [showPass, setShowPass] = useState(false);
  const [accepted, setAccepted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }));

  const handleRegister = async () => {
    if (!form.name || !form.email || !form.password) { setError('Remplissez tous les champs obligatoires'); return; }
    if (form.password !== form.confirm) { setError('Les mots de passe ne correspondent pas'); return; }
    if (!accepted) { setError('Acceptez les conditions d\'utilisation'); return; }
    setLoading(true);
    setError('');
    const { data, error: err } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: { data: { full_name: form.name } },
    });
    if (err) { setError(err.message); setLoading(false); return; }
    if (data.user) {
      await supabase.from('sv_user_profiles').insert({
        id: data.user.id,
        full_name: form.name,
        phone: form.phone || null,
        is_organizer: false,
      });
      navigate('home');
    }
    setLoading(false);
  };

  return (
    <div className="absolute inset-0 bg-[#06060F] flex flex-col overflow-hidden">
      <StatusBar />
      <div className="flex-1 flex flex-col px-6 pt-4 pb-8 overflow-y-auto">
        <button onClick={goBack} className="w-8 h-8 flex items-center justify-center rounded-full bg-white/10 mb-6">
          <ChevronLeft size={18} className="text-white" />
        </button>

        <h1 className="text-2xl font-bold text-white mb-1">Créer un compte</h1>
        <p className="text-gray-400 text-sm mb-8">Rejoignez la communauté SUMVIBE</p>

        <div className="flex flex-col gap-4">
          {[
            { label: 'Nom complet', key: 'name', type: 'text', placeholder: 'Kossi Amega' },
            { label: 'Email', key: 'email', type: 'email', placeholder: 'kossi@exemple.com' },
            { label: 'Téléphone', key: 'phone', type: 'tel', placeholder: '+228 90 000 000' },
          ].map(({ label, key, type, placeholder }) => (
            <div key={key}>
              <label className="text-xs text-gray-400 mb-1.5 block">{label}</label>
              <input
                type={type}
                value={form[key as keyof typeof form]}
                onChange={set(key as keyof typeof form)}
                placeholder={placeholder}
                className="w-full bg-[#13132A] border border-white/10 rounded-xl px-4 py-3.5 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-violet-500 transition-colors"
              />
            </div>
          ))}

          <div>
            <label className="text-xs text-gray-400 mb-1.5 block">Mot de passe</label>
            <div className="relative">
              <input
                type={showPass ? 'text' : 'password'}
                value={form.password}
                onChange={set('password')}
                placeholder="••••••••"
                className="w-full bg-[#13132A] border border-white/10 rounded-xl px-4 py-3.5 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-violet-500 pr-12 transition-colors"
              />
              <button onClick={() => setShowPass(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">
                {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <div>
            <label className="text-xs text-gray-400 mb-1.5 block">Confirmer le mot de passe</label>
            <input
              type="password"
              value={form.confirm}
              onChange={set('confirm')}
              placeholder="••••••••"
              className="w-full bg-[#13132A] border border-white/10 rounded-xl px-4 py-3.5 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-violet-500 transition-colors"
            />
          </div>

          <label className="flex items-start gap-3 cursor-pointer">
            <div
              onClick={() => setAccepted(v => !v)}
              className={`w-5 h-5 rounded flex-shrink-0 border-2 mt-0.5 flex items-center justify-center transition-colors ${accepted ? 'bg-violet-600 border-violet-600' : 'border-gray-600'}`}
            >
              {accepted && <svg width="10" height="8" viewBox="0 0 10 8" fill="none"><path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="2" strokeLinecap="round"/></svg>}
            </div>
            <span className="text-xs text-gray-400 leading-relaxed">
              J&apos;accepte les{' '}
              <button className="text-violet-400">conditions d&apos;utilisation</button>
              {' '}et la{' '}
              <button className="text-violet-400">politique de confidentialité</button>
            </span>
          </label>

          {error && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3 text-red-400 text-xs">
              {error}
            </div>
          )}

          <button
            onClick={handleRegister}
            disabled={loading}
            className="w-full py-4 bg-violet-600 hover:bg-violet-500 text-white font-semibold rounded-2xl transition-colors disabled:opacity-60 mt-2"
          >
            {loading ? 'Création...' : 'S\'inscrire'}
          </button>
        </div>

        <div className="mt-6 text-center">
          <span className="text-gray-500 text-sm">Déjà un compte ? </span>
          <button onClick={() => navigate('login')} className="text-violet-400 text-sm font-semibold">
            Se connecter
          </button>
        </div>
      </div>
    </div>
  );
}
