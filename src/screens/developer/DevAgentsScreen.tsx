import { useState, useEffect } from 'react';
import { ArrowLeft, Search, Trash2, Power, Briefcase, ShieldAlert } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { supabase } from '../../lib/supabase';
import { StatusBar } from '../../components/StatusBar';
import { Agent } from '../../lib/types';

export function DevAgentsScreen() {
  const { navigate, user } = useApp();
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (!user) {
      navigate('dev-login');
      return;
    }
    fetchAgents();
  }, [user]);

  async function fetchAgents() {
    try {
      const { data, error } = await supabase
        .from('sv_agents')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAgents(data || []);
    } catch (error) {
      console.error('Error fetching agents:', error);
    } finally {
      setLoading(false);
    }
  }

  async function deleteAgent(id: string) {
    if (!window.confirm("Êtes-vous sûr de vouloir supprimer cet agent ?")) return;
    
    try {
      const { error } = await supabase.from('sv_agents').delete().eq('id', id);
      if (error) throw error;
      
      setAgents(agents.filter(a => a.id !== id));
    } catch (error) {
      console.error('Error deleting agent:', error);
      alert('Erreur lors de la suppression.');
    }
  }

  async function toggleActive(agent: Agent) {
    try {
      const { error } = await supabase
        .from('sv_agents')
        .update({ is_active: !agent.is_active })
        .eq('id', agent.id);
        
      if (error) throw error;
      
      setAgents(agents.map(a => a.id === agent.id ? { ...a, is_active: !agent.is_active } : a));
    } catch (error) {
      console.error('Error toggling agent status:', error);
    }
  }

  const filteredAgents = agents.filter(a => 
    (a.full_name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
    (a.login_code?.toLowerCase() || '').includes(searchTerm.toLowerCase())
  );

  return (
    <div className="absolute inset-0 bg-[#06060F] flex flex-col overflow-hidden">
      <StatusBar />
      
      <div className="px-5 pt-2 pb-4 border-b border-white/5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate('dev-dashboard')} className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-white bg-white/5 rounded-full transition-colors">
              <ArrowLeft size={18} />
            </button>
            <div>
              <h1 className="text-white font-bold text-xl">Agents (Valticket)</h1>
              <p className="text-gray-400 text-xs">Total: {agents.length}</p>
            </div>
          </div>
        </div>

        <div className="relative">
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">
            <Search size={18} />
          </div>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Rechercher par nom ou code..."
            className="w-full bg-[#13132A] text-white pl-11 pr-4 py-3 rounded-xl border border-white/5 focus:outline-none focus:border-red-500 transition-colors text-sm"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-4">
        {loading ? (
          <div className="flex justify-center py-10">
            <div className="w-6 h-6 border-2 border-red-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {filteredAgents.map(agent => (
              <div key={agent.id} className="bg-[#13132A] border border-white/5 rounded-2xl p-4">
                <div className="flex justify-between items-start">
                  <div className="flex gap-3">
                    <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center text-white font-bold shrink-0">
                      {agent.avatar_initials || 'A'}
                    </div>
                    <div>
                      <h3 className="text-white font-bold text-sm">{agent.full_name}</h3>
                      <p className="text-gray-400 text-xs mt-0.5 font-mono">{agent.login_code}</p>
                      
                      <div className="flex items-center gap-2 mt-2">
                        <span className={`text-[10px] px-2 py-0.5 rounded-full flex items-center gap-1 ${
                          agent.role === 'supervisor' ? 'bg-amber-500/20 text-amber-400' : 'bg-violet-500/20 text-violet-400'
                        }`}>
                          {agent.role === 'supervisor' ? <ShieldAlert size={10} /> : <Briefcase size={10} />}
                          {agent.role === 'supervisor' ? 'Superviseur' : 'Validateur'}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex flex-col gap-2">
                    <button 
                      onClick={() => toggleActive(agent)}
                      className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
                        agent.is_active ? 'bg-green-500/20 text-green-400' : 'bg-white/5 text-gray-500'
                      }`}
                    >
                      <Power size={14} />
                    </button>
                    <button 
                      onClick={() => deleteAgent(agent.id)}
                      className="w-8 h-8 flex items-center justify-center text-red-400 bg-red-500/10 rounded-full hover:bg-red-500/20 transition-colors"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
            
            {filteredAgents.length === 0 && (
              <div className="text-center py-10">
                <p className="text-gray-500 text-sm">Aucun agent trouvé.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
