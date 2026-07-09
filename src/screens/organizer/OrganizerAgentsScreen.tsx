import { useEffect, useState, useCallback } from 'react';
import { ArrowLeft, Plus, Users, UserCheck, ShieldCheck } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { supabase } from '../../lib/supabase';
import { Agent, Event } from '../../lib/types';
import { StatusBar } from '../../components/StatusBar';

export function OrganizerAgentsScreen() {
  const { organizer, navigate } = useApp();
  const [agents, setAgents] = useState<Agent[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAgentsAndEvents = useCallback(async () => {
    if (!organizer) return;
    setLoading(true);
    try {
      const { data: eventsData } = await supabase
        .from('sv_events')
        .select('*')
        .eq('organizer_id', organizer.id);
      
      if (eventsData) {
        setEvents(eventsData);
        const eventIds = eventsData.map(e => e.id);
        if (eventIds.length > 0) {
          const { data: agentsData } = await supabase
            .from('sv_agents')
            .select('*')
            .in('event_id', eventIds)
            .order('created_at', { ascending: false });
            
          if (agentsData) setAgents(agentsData);
        }
      }
    } finally {
      setLoading(false);
    }
  }, [organizer]);

  useEffect(() => {
    fetchAgentsAndEvents();
  }, [fetchAgentsAndEvents]);

  async function toggleAgent(agent: Agent) {
    const { error } = await supabase
      .from('sv_agents')
      .update({ is_active: !agent.is_active })
      .eq('id', agent.id);
      
    if (!error) {
      fetchAgentsAndEvents();
    }
  }

  const activeCount = agents.filter(a => a.is_active).length;

  return (
    <div className="absolute inset-0 bg-[#06060F] flex flex-col overflow-hidden">
      <StatusBar />
      
      <div className="px-5 pt-2 pb-4 border-b border-white/5">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('organizer-dashboard')} className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-white bg-white/5 rounded-full transition-colors">
            <ArrowLeft size={18} />
          </button>
          <div>
            <h1 className="text-white font-bold text-xl">Staff & Agents</h1>
            <p className="text-gray-400 text-xs">Gérez les accès à Valticket</p>
          </div>
        </div>
        
        {!loading && (
          <div className="flex items-center gap-4 mt-4 bg-[#13132A] rounded-xl p-3">
            <div className="flex flex-col flex-1 items-center justify-center border-r border-white/5">
              <span className="text-white font-bold text-lg">{agents.length}</span>
              <span className="text-gray-500 text-[10px] uppercase tracking-wider">Total</span>
            </div>
            <div className="flex flex-col flex-1 items-center justify-center border-r border-white/5">
              <span className="text-green-400 font-bold text-lg">{activeCount}</span>
              <span className="text-gray-500 text-[10px] uppercase tracking-wider">Actifs</span>
            </div>
            <div className="flex flex-col flex-1 items-center justify-center">
              <span className="text-gray-400 font-bold text-lg">{agents.length - activeCount}</span>
              <span className="text-gray-500 text-[10px] uppercase tracking-wider">Inactifs</span>
            </div>
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-4 pb-24">
        {loading ? (
          <div className="flex flex-col gap-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-24 bg-[#13132A] rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : agents.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-[300px] gap-3 text-center">
            <div className="w-16 h-16 rounded-full bg-violet-600/20 flex items-center justify-center">
              <Users size={32} className="text-violet-400" />
            </div>
            <div>
              <p className="text-white font-semibold">Aucun agent</p>
              <p className="text-gray-500 text-xs mt-1 max-w-[200px] mx-auto">Vous n'avez pas encore ajouté de membre à votre staff pour scanner les billets.</p>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {agents.map(agent => {
              const event = events.find(e => e.id === agent.event_id);
              return (
                <div key={agent.id} className="bg-[#13132A] rounded-2xl p-4 flex items-start justify-between border border-white/5">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center text-white font-bold text-sm shrink-0 shadow-lg shadow-violet-900/20">
                      {agent.avatar_initials || agent.full_name.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex flex-col">
                      <p className="text-white font-bold text-sm">{agent.full_name}</p>
                      
                      <div className="flex items-center gap-1.5 mt-1">
                        {agent.role === 'supervisor' ? (
                          <ShieldCheck size={12} className="text-amber-400" />
                        ) : (
                          <UserCheck size={12} className="text-violet-400" />
                        )}
                        <span className="text-gray-400 text-xs capitalize">
                          {agent.role === 'supervisor' ? 'Superviseur' : 'Validateur'}
                        </span>
                      </div>
                      
                      {event && (
                        <p className="text-gray-500 text-[10px] mt-1.5 truncate max-w-[150px]">
                          📅 {event.title}
                        </p>
                      )}
                      
                      <div className="mt-3 bg-[#06060F] rounded-lg px-2.5 py-1.5 flex flex-col gap-1 border border-white/5">
                        <div className="flex items-center justify-between">
                          <span className="text-gray-500 text-[10px] mr-2">Login:</span>
                          <span className="text-violet-300 font-mono text-xs font-semibold">{agent.login_code}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-gray-500 text-[10px] mr-2">Mdp:</span>
                          <span className="text-pink-300 font-mono text-xs font-semibold">{agent.temp_password}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex flex-col items-end gap-3 shrink-0">
                    <span className={`text-[9px] font-bold px-2 py-1 rounded-md ${agent.is_active ? 'text-green-400 bg-green-400/10' : 'text-red-400 bg-red-400/10'}`}>
                      {agent.is_active ? 'ACTIF' : 'INACTIF'}
                    </span>
                    <button
                      onClick={() => toggleAgent(agent)}
                      className={`relative w-11 h-6 rounded-full transition-colors ${agent.is_active ? 'bg-green-500' : 'bg-gray-700'}`}
                    >
                      <div className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform ${agent.is_active ? 'translate-x-5' : ''}`} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="absolute bottom-6 right-5">
        <button
          onClick={() => navigate('organizer-add-agent')}
          className="w-14 h-14 bg-violet-600 rounded-full flex items-center justify-center shadow-lg shadow-violet-600/30 hover:scale-105 active:scale-95 transition-all"
        >
          <Plus size={24} className="text-white" />
        </button>
      </div>
    </div>
  );
}
