import { useState } from 'react';
import { ChevronLeft } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { supabase } from '../../lib/supabase';
import { StatusBar } from '../../components/StatusBar';

export function OrganizerRegisterScreen() {
  const { navigate, goBack, user, loadOrganizer } = useApp();
  const [form, setForm] = useState({ name: '', email: '', phone: '', description: '' });
  const [accepted, setAccepted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async () => {
    if (!user) { navigate('login'); return; }
    if (!form.name || !form.email) { setError('Remplissez tous les champs obligatoires'); return; }
    if (!accepted) { setError('Acceptez les conditions d\'utilisation'); return; }
    setLoading(true);
    setError('');
    const { error: err } = await supabase.from('sv_organizers').insert({
      user_id: user.id,
      name: form.name,
      email: form.email,
      phone: form.phone || null,
      description: form.description || null,
      verified: false,
    });
    if (err) { setError(err.message); setLoading(false); return; }
    await loadOrganizer();
    setLoading(false);
    navigate('organizer-dashboard');
  };

  return (
    <div className="absolute inset-0 bg-[#06060F] flex flex-col overflow-hidden">
      <StatusBar />
      <div className="flex items-center px-5 pt-2 pb-4 gap-3">
        <button onClick={goBack} className="w-9 h-9 bg-white/10 rounded-full flex items-center justify-center">
          <ChevronLeft size={20} className="text-white" />
        </button>
        <h1 className="text-white font-bold text-lg flex-1">Créer un compte organisateur</h1>
      </div>

      <div className="flex-1 overflow-y-auto pb-28 px-5">
        <div className="flex flex-col gap-4">
          {[
            { label: 'Nom de l\'organisation *', key: 'name', type: 'text', placeholder: 'Event Corp' },
            { label: 'Email professionnel *', key: 'email', type: 'email', placeholder: 'contact@organisation.tg' },
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
            <label className="text-xs text-gray-400 mb-1.5 block">Description</label>
            <textarea
              value={form.description}
              onChange={set('description')}
              placeholder="Décrivez votre organisation..."
              rows={3}
              className="w-full bg-[#13132A] border border-white/10 rounded-xl px-4 py-3.5 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-violet-500 transition-colors resize-none"
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
            </span>
          </label>

          {error && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3 text-red-400 text-xs">
              {error}
            </div>
          )}
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 bg-[#06060F] border-t border-white/10 px-5 py-4 pb-6">
        <button
          onClick={handleSubmit}
          disabled={loading}
          className="w-full py-4 bg-violet-600 text-white font-bold rounded-2xl disabled:opacity-60 mb-2"
        >
          {loading ? 'Création...' : 'S\'inscrire'}
        </button>
        <p className="text-center text-gray-500 text-xs">
          Déjà un compte ?{' '}
          <button onClick={() => navigate('organizer-dashboard')} className="text-violet-400">
            Se connecter
          </button>
        </p>
      </div>
    </div>
  );
}
