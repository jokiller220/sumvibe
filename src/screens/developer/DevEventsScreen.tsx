import { useState, useEffect } from 'react';
import { ArrowLeft, Calendar, Search, Trash2, Eye, EyeOff } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { supabase } from '../../lib/supabase';
import { StatusBar } from '../../components/StatusBar';
import { Event } from '../../lib/types';

export function DevEventsScreen() {
  const { navigate, user } = useApp();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (!user) {
      navigate('dev-login');
      return;
    }
    fetchEvents();
  }, [user]);

  async function fetchEvents() {
    try {
      const { data, error } = await supabase
        .from('sv_events')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setEvents(data || []);
    } catch (error) {
      console.error('Error fetching events:', error);
    } finally {
      setLoading(false);
    }
  }

  async function deleteEvent(id: string) {
    if (!window.confirm("Êtes-vous sûr de vouloir supprimer cet événement ? Cela supprimera également les tickets et logs associés.")) return;
    
    try {
      const { error } = await supabase.from('sv_events').delete().eq('id', id);
      if (error) throw error;
      
      setEvents(events.filter(e => e.id !== id));
    } catch (error) {
      console.error('Error deleting event:', error);
      alert('Erreur lors de la suppression.');
    }
  }

  async function togglePublish(id: string, currentStatus: boolean) {
    try {
      const { error } = await supabase
        .from('sv_events')
        .update({ is_published: !currentStatus })
        .eq('id', id);
        
      if (error) throw error;
      
      setEvents(events.map(e => e.id === id ? { ...e, is_published: !currentStatus } : e));
    } catch (error) {
      console.error('Error toggling publish status:', error);
    }
  }

  const filteredEvents = events.filter(e => 
    (e.title?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
    (e.location?.toLowerCase() || '').includes(searchTerm.toLowerCase())
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
              <h1 className="text-white font-bold text-xl">Événements</h1>
              <p className="text-gray-400 text-xs">{events.length} événements</p>
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
            placeholder="Rechercher par nom..."
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
            {filteredEvents.map(ev => (
              <div key={ev.id} className="bg-[#13132A] border border-white/5 rounded-2xl p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3 flex-1">
                    <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center shrink-0 overflow-hidden">
                      {ev.image_url ? (
                        <img src={ev.image_url} alt={ev.title} className="w-full h-full object-cover opacity-80" />
                      ) : (
                        <Calendar size={20} className="text-gray-400" />
                      )}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-white font-bold text-sm leading-tight">{ev.title}</h3>
                      <p className="text-gray-400 text-xs mt-1">{new Date(ev.date).toLocaleDateString('fr-FR')} • {ev.location}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => togglePublish(ev.id, ev.is_published)}
                      className={`w-8 h-8 flex items-center justify-center rounded-lg transition-colors ${ev.is_published ? 'text-green-400 bg-green-500/10' : 'text-gray-400 bg-white/5 hover:bg-white/10'}`}
                    >
                      {ev.is_published ? <Eye size={16} /> : <EyeOff size={16} />}
                    </button>
                    <button 
                      onClick={() => deleteEvent(ev.id)}
                      className="w-8 h-8 flex items-center justify-center text-red-400 bg-red-500/10 rounded-lg hover:bg-red-500/20 transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
            
            {filteredEvents.length === 0 && (
              <div className="text-center py-10">
                <p className="text-gray-500 text-sm">Aucun événement trouvé.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
