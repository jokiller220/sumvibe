import { useState, useEffect } from 'react';
import { ArrowLeft, Users, Calendar, Ticket, ShieldAlert } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { supabase } from '../../lib/supabase';
import { StatusBar } from '../../components/StatusBar';

export function DevDashboardScreen() {
  const { navigate, user } = useApp();
  const [stats, setStats] = useState({
    users: 0,
    organizers: 0,
    events: 0,
    agents: 0
  });

  useEffect(() => {
    if (!user) {
      navigate('dev-login');
      return;
    }
    fetchStats();
  }, [user]);

  async function fetchStats() {
    try {
      const [users, organizers, events, agents] = await Promise.all([
        supabase.from('sv_user_profiles').select('*', { count: 'exact', head: true }),
        supabase.from('sv_organizers').select('*', { count: 'exact', head: true }),
        supabase.from('sv_events').select('*', { count: 'exact', head: true }),
        supabase.from('sv_agents').select('*', { count: 'exact', head: true })
      ]);

      setStats({
        users: users.count || 0,
        organizers: organizers.count || 0,
        events: events.count || 0,
        agents: agents.count || 0
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  }

  return (
    <div className="absolute inset-0 bg-[#06060F] flex flex-col overflow-hidden">
      <StatusBar />
      
      <div className="px-5 pt-2 pb-4 border-b border-white/5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('home')} className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-white bg-white/5 rounded-full transition-colors">
            <ArrowLeft size={18} />
          </button>
          <div>
            <h1 className="text-white font-bold text-xl">Dev Panel</h1>
            <p className="text-gray-400 text-xs text-red-400">Accès Super Admin</p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-6">
        <h2 className="text-white font-bold mb-4">Vue d'ensemble</h2>
        
        <div className="grid grid-cols-2 gap-4 mb-8">
          <div className="bg-[#13132A] border border-white/5 rounded-2xl p-4">
            <div className="w-10 h-10 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center mb-3">
              <Users size={20} />
            </div>
            <p className="text-gray-400 text-xs mb-1">Utilisateurs</p>
            <h3 className="text-white font-bold text-2xl">{stats.users}</h3>
          </div>

          <div className="bg-[#13132A] border border-white/5 rounded-2xl p-4">
            <div className="w-10 h-10 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center mb-3">
              <ShieldAlert size={20} />
            </div>
            <p className="text-gray-400 text-xs mb-1">Organisateurs</p>
            <h3 className="text-white font-bold text-2xl">{stats.organizers}</h3>
          </div>

          <div className="bg-[#13132A] border border-white/5 rounded-2xl p-4">
            <div className="w-10 h-10 rounded-xl bg-green-500/20 text-green-400 flex items-center justify-center mb-3">
              <Calendar size={20} />
            </div>
            <p className="text-gray-400 text-xs mb-1">Événements</p>
            <h3 className="text-white font-bold text-2xl">{stats.events}</h3>
          </div>

          <div className="bg-[#13132A] border border-white/5 rounded-2xl p-4">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center mb-3">
              <Ticket size={20} />
            </div>
            <p className="text-gray-400 text-xs mb-1">Agents (Valticket)</p>
            <h3 className="text-white font-bold text-2xl">{stats.agents}</h3>
          </div>
        </div>

        <h2 className="text-white font-bold mb-4">Gestion des plateformes</h2>
        
        <div className="flex flex-col gap-3">
          <button 
            onClick={() => navigate('dev-users')}
            className="w-full bg-[#13132A] rounded-2xl p-4 flex items-center gap-4 border border-white/5 hover:border-red-500/30 transition-colors"
          >
            <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center text-white">
              <Users size={24} />
            </div>
            <div className="text-left">
              <h3 className="text-white font-bold">Utilisateurs & Profils</h3>
              <p className="text-gray-400 text-xs mt-0.5">Voir et gérer tous les comptes</p>
            </div>
          </button>

          <button 
            onClick={() => navigate('dev-events')}
            className="w-full bg-[#13132A] rounded-2xl p-4 flex items-center gap-4 border border-white/5 hover:border-red-500/30 transition-colors"
          >
            <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center text-white">
              <Calendar size={24} />
            </div>
            <div className="text-left">
              <h3 className="text-white font-bold">Tous les Événements</h3>
              <p className="text-gray-400 text-xs mt-0.5">Modération et suppression</p>
            </div>
          </button>

          <button 
            onClick={() => navigate('dev-agents')}
            className="w-full bg-[#13132A] rounded-2xl p-4 flex items-center gap-4 border border-white/5 hover:border-red-500/30 transition-colors"
          >
            <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center text-white">
              <ShieldAlert size={24} />
            </div>
            <div className="text-left">
              <h3 className="text-white font-bold">Agents Valticket</h3>
              <p className="text-gray-400 text-xs mt-0.5">Gestion globale des scanners</p>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}
