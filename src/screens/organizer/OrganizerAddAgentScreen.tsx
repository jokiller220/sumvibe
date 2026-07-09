import { useState, useEffect } from 'react';
import { ArrowLeft, User, Shield, Briefcase, Calendar } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { supabase } from '../../lib/supabase';
import { Event } from '../../lib/types';
import { StatusBar } from '../../components/StatusBar';

export function OrganizerAddAgentScreen() {
  const { organizer, navigate } = useApp();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(false);
  
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState<'scanner' | 'supervisor'>('scanner');
  const [selectedEventId, setSelectedEventId] = useState<string>('');

  useEffect(() => {
    if (!organizer) return;
    supabase
      .from('sv_events')
      .select('*')
      .eq('organizer_id', organizer.id)
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        if (data) {
          setEvents(data);
          if (data.length > 0) {
            setSelectedEventId(data[0].id);
          }
        }
      });
  }, [organizer]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!fullName || !selectedEventId) return;

    setLoading(true);
    try {
      const year = new Date().getFullYear();
      const randomNum = Math.floor(100 + Math.random() * 900);
      const loginCode = `AGT-${year}-${randomNum}`;
      const tempPassword = Math.random().toString(36).slice(-6).toUpperCase();

      const initials = fullName.split(' ').map(p => p[0]).join('').toUpperCase().slice(0, 2);

      const { error } = await supabase.from('sv_agents').insert({
        full_name: fullName,
        login_code: loginCode,
        temp_password: tempPassword,
        event_id: selectedEventId,
        role,
        is_active: true,
        avatar_initials: initials,
      });

      if (error) throw error;
      navigate('organizer-agents');
    } catch (error: unknown) {
      console.error(error);
      const msg = error instanceof Error ? error.message : JSON.stringify(error);
      alert('Erreur: ' + msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="absolute inset-0 bg-[#06060F] flex flex-col overflow-hidden">
      <StatusBar />
      
      <div className="px-5 pt-2 pb-4 border-b border-white/5">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('organizer-agents')} className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-white bg-white/5 rounded-full transition-colors">
            <ArrowLeft size={18} />
          </button>
          <div>
            <h1 className="text-white font-bold text-xl">Ajouter un Agent</h1>
            <p className="text-gray-400 text-xs">Créez un accès pour votre staff</p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-6">
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div className="flex flex-col gap-2">
            <label className="text-gray-300 text-sm font-medium ml-1">Événement assigné</label>
            <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">
                <Calendar size={18} />
              </div>
              <select
                value={selectedEventId}
                onChange={e => setSelectedEventId(e.target.value)}
                className="w-full pl-11 pr-4 py-3.5 rounded-xl bg-[#13132A] border border-white/5 text-white focus:outline-none focus:border-violet-500 transition-colors text-sm appearance-none"
                required
              >
                <option value="" disabled>Sélectionner un événement</option>
                {events.map(ev => (
                  <option key={ev.id} value={ev.id}>{ev.title}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-gray-300 text-sm font-medium ml-1">Nom complet</label>
            <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">
                <User size={18} />
              </div>
              <input
                type="text"
                value={fullName}
                onChange={e => setFullName(e.target.value)}
                placeholder="Ex: Jean Dupont"
                className="w-full pl-11 pr-4 py-3.5 rounded-xl bg-[#13132A] border border-white/5 text-white placeholder-gray-500 focus:outline-none focus:border-violet-500 transition-colors text-sm"
                required
              />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-gray-300 text-sm font-medium ml-1">Rôle de l'agent</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setRole('scanner')}
                className={`flex flex-col items-center justify-center gap-2 py-4 rounded-xl border transition-all ${
                  role === 'scanner' 
                    ? 'bg-violet-600/20 border-violet-500 text-violet-400' 
                    : 'bg-[#13132A] border-white/5 text-gray-400 hover:border-white/20'
                }`}
              >
                <Briefcase size={24} />
                <span className="text-sm font-semibold">Validateur</span>
                <span className="text-[10px] text-center px-2 opacity-70">Peut uniquement scanner les billets</span>
              </button>
              
              <button
                type="button"
                onClick={() => setRole('supervisor')}
                className={`flex flex-col items-center justify-center gap-2 py-4 rounded-xl border transition-all ${
                  role === 'supervisor' 
                    ? 'bg-amber-600/20 border-amber-500 text-amber-400' 
                    : 'bg-[#13132A] border-white/5 text-gray-400 hover:border-white/20'
                }`}
              >
                <Shield size={24} />
                <span className="text-sm font-semibold">Superviseur</span>
                <span className="text-[10px] text-center px-2 opacity-70">Peut gérer les statistiques et agents</span>
              </button>
            </div>
          </div>

          <div className="bg-violet-900/20 border border-violet-500/30 rounded-xl p-4 mt-2">
            <p className="text-violet-300 text-xs leading-relaxed">
              Le <strong>Code Login</strong> et le <strong>Mot de passe</strong> seront générés automatiquement. Vous pourrez les voir dans la liste des agents juste après la création pour les transmettre à la personne.
            </p>
          </div>

          <button
            type="submit"
            disabled={loading || !fullName || !selectedEventId}
            className="w-full py-4 mt-4 rounded-2xl bg-violet-600 hover:bg-violet-500 disabled:opacity-50 text-white font-bold text-sm transition-all active:scale-95 flex items-center justify-center"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              'Créer l\'agent'
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
