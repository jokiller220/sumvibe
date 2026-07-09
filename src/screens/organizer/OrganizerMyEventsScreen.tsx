import { useEffect, useState } from 'react';
import { Plus, Calendar, MapPin } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { OrganizerBottomNav } from '../../components/BottomNav';
import { StatusBar } from '../../components/StatusBar';
import { supabase } from '../../lib/supabase';
import { formatShortDate } from '../../lib/utils';
import { Event } from '../../lib/types';

export function OrganizerMyEventsScreen() {
  const { organizer, navigate } = useApp();
  const [events, setEvents] = useState<Event[]>([]);

  useEffect(() => {
    if (!organizer) return;
    supabase
      .from('sv_events')
      .select('*, sv_ticket_types(*)')
      .eq('organizer_id', organizer.id)
      .order('date', { ascending: true })
      .then(({ data }) => { if (data) setEvents(data); });
  }, [organizer]);

  return (
    <div className="absolute inset-0 bg-[#06060F] flex flex-col overflow-hidden">
      <StatusBar />
      <div className="flex items-center justify-between px-5 pt-2 pb-4">
        <h1 className="text-white font-bold text-xl">Mes événements</h1>
        <button
          onClick={() => navigate('organizer-create-event')}
          className="w-9 h-9 bg-violet-600 rounded-full flex items-center justify-center"
        >
          <Plus size={20} className="text-white" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto pb-24 px-5">
        {events.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 text-center">
            <Calendar size={32} className="text-gray-600 mb-3" />
            <p className="text-gray-400 text-sm">Aucun événement pour l&apos;instant</p>
            <button
              onClick={() => navigate('organizer-create-event')}
              className="mt-4 px-6 py-3 bg-violet-600 text-white font-semibold rounded-2xl flex items-center gap-2"
            >
              <Plus size={16} />
              Créer un événement
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {events.map(event => {
              const sold = event.sv_ticket_types?.reduce((a: number, t: { sold: number }) => a + t.sold, 0) || 0;
              const capacity = event.sv_ticket_types?.reduce((a: number, t: { capacity: number }) => a + t.capacity, 0) || event.total_capacity;
              const pct = capacity > 0 ? Math.round((sold / capacity) * 100) : 0;
              const revenue = event.sv_ticket_types?.reduce((a: number, t: { sold: number; price: number }) => a + t.sold * t.price, 0) || 0;
              return (
                <div key={event.id} className="bg-[#13132A] rounded-2xl overflow-hidden">
                  <div className="relative h-28">
                    <img src={event.image_url || ''} alt={event.title} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-r from-black/70 to-transparent flex items-end p-3">
                      <div className="flex-1">
                        <h3 className="text-white font-bold text-sm">{event.title}</h3>
                        <div className="flex items-center gap-1">
                          <MapPin size={10} className="text-gray-300" />
                          <span className="text-gray-300 text-xs">{event.location}, {event.city}</span>
                        </div>
                      </div>
                    </div>
                    <div className={`absolute top-2 right-2 px-2 py-0.5 rounded-full text-xs font-semibold ${event.is_published ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
                      {event.is_published ? 'Publié' : 'Brouillon'}
                    </div>
                  </div>
                  <div className="p-3">
                    <div className="flex items-center justify-between mb-2 text-xs">
                      <div className="flex items-center gap-1 text-gray-400">
                        <Calendar size={11} />
                        <span>{formatShortDate(event.date)}</span>
                      </div>
                      <span className="text-gray-400">{sold} / {capacity} billets</span>
                    </div>
                    <div className="flex items-center gap-2 mb-2">
                      <div className="flex-1 h-1.5 bg-white/10 rounded-full">
                        <div className="h-full bg-violet-500 rounded-full" style={{ width: `${pct}%` }} />
                      </div>
                      <span className="text-gray-400 text-xs">{pct}%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-amber-400 text-xs font-semibold">
                        {revenue.toLocaleString('fr-FR')} FCFA
                      </span>
                      <button
                        onClick={() => navigate('organizer-scanner')}
                        className="text-xs text-violet-400 font-medium"
                      >
                        Scanner
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* FAB */}
      <button
        onClick={() => navigate('organizer-create-event')}
        className="absolute bottom-20 right-5 w-12 h-12 bg-violet-600 rounded-full flex items-center justify-center shadow-lg shadow-violet-600/30"
      >
        <Plus size={22} className="text-white" />
      </button>

      <OrganizerBottomNav />
    </div>
  );
}
