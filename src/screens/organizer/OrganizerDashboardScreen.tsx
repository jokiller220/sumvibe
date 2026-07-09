import { useEffect, useState } from 'react';
import { Plus, TrendingUp, Ticket, DollarSign, BarChart2, Users, ChevronRight } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { OrganizerBottomNav } from '../../components/BottomNav';
import { StatusBar } from '../../components/StatusBar';
import { supabase } from '../../lib/supabase';
import { formatShortDate } from '../../lib/utils';
import { Event } from '../../lib/types';

interface Stats { events: number; sold: number; revenue: number }

export function OrganizerDashboardScreen() {
  const { organizer, navigate } = useApp();
  const [events, setEvents] = useState<Event[]>([]);
  const [stats, setStats] = useState<Stats>({ events: 0, sold: 0, revenue: 0 });

  useEffect(() => {
    if (!organizer) return;
    supabase
      .from('sv_events')
      .select('*, sv_ticket_types(*)')
      .eq('organizer_id', organizer.id)
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        if (!data) return;
        setEvents(data);
        const sold = data.reduce((a, e) => a + (e.sv_ticket_types?.reduce((b: number, t: { sold: number }) => b + t.sold, 0) || 0), 0);
        const revenue = data.reduce((a, e) => a + (e.sv_ticket_types?.reduce((b: number, t: { sold: number; price: number }) => b + t.sold * t.price, 0) || 0), 0);
        setStats({ events: data.length, sold, revenue });
      });
  }, [organizer]);

  if (!organizer) {
    return (
      <div className="absolute inset-0 bg-[#06060F] flex flex-col items-center justify-center px-6">
        <p className="text-gray-400 text-sm mb-4">Vous n&apos;êtes pas encore organisateur</p>
        <button onClick={() => navigate('organizer-landing')} className="w-full py-4 bg-violet-600 text-white font-bold rounded-2xl">
          Devenir organisateur
        </button>
      </div>
    );
  }

  const recentEvents = events.slice(0, 4);

  return (
    <div className="absolute inset-0 bg-[#06060F] flex flex-col overflow-hidden">
      <StatusBar />
      <div className="px-5 pt-2 pb-4 flex items-center justify-between">
        <h1 className="text-white font-bold text-xl">Tableau de bord</h1>
        <button
          onClick={() => navigate('organizer-create-event')}
          className="w-9 h-9 bg-violet-600 rounded-full flex items-center justify-center"
        >
          <Plus size={20} className="text-white" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto pb-24 px-5">
        {/* Filter */}
        <div className="flex items-center justify-between mb-4">
          <span className="text-gray-400 text-sm">Tous les événements</span>
          <button className="flex items-center gap-1 text-xs text-violet-400">
            <TrendingUp size={12} />
            Ce mois
          </button>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          {[
            { icon: BarChart2, label: 'Événements', value: stats.events, color: 'text-violet-400 bg-violet-600/20' },
            { icon: Ticket, label: 'Billets vendus', value: stats.sold.toLocaleString(), color: 'text-pink-400 bg-pink-600/20' },
            { icon: DollarSign, label: 'Revenus', value: stats.revenue >= 1000000 ? `${(stats.revenue/1000000).toFixed(1)}M` : `${Math.round(stats.revenue/1000)}K`, color: 'text-amber-400 bg-amber-600/20' },
          ].map(s => (
            <div key={s.label} className="bg-[#13132A] rounded-2xl p-3 text-center">
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center mx-auto mb-2 ${s.color}`}>
                <s.icon size={16} />
              </div>
              <p className="text-white font-black text-lg leading-none">{s.value}</p>
              <p className="text-gray-500 text-xs mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Revenue chart (simple bar) */}
        <div className="bg-[#13132A] rounded-2xl p-4 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-white font-bold text-sm">Ventes récentes</h3>
            <button onClick={() => navigate('organizer-sales')} className="text-violet-400 text-xs">Détails</button>
          </div>
          <div className="flex items-end gap-1.5 h-20">
            {[40, 65, 45, 80, 60, 90, 70].map((h, i) => (
              <div key={i} className="flex-1 flex flex-col justify-end">
                <div
                  className="rounded-t-lg bg-gradient-to-t from-violet-700 to-violet-400"
                  style={{ height: `${h}%` }}
                />
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-2">
            {['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'].map(d => (
              <span key={d} className="flex-1 text-center text-gray-600 text-xs">{d}</span>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mb-6">
          <button 
            onClick={() => navigate('organizer-agents')}
            className="w-full bg-[#13132A] rounded-2xl p-4 flex items-center justify-between border border-white/5 hover:border-violet-500/30 transition-colors"
          >
            <div className="flex items-center gap-3">
               <div className="w-10 h-10 rounded-xl bg-violet-600/20 flex items-center justify-center text-violet-400">
                  <Users size={20} />
               </div>
               <div className="text-left">
                 <h3 className="text-white font-bold text-sm">Staff & Agents (Valticket)</h3>
                 <p className="text-gray-400 text-xs mt-0.5">Créer et gérer les codes d'accès scanner</p>
               </div>
            </div>
            <ChevronRight size={20} className="text-gray-600" />
          </button>
        </div>

        {/* Recent events */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-white font-bold text-sm">Événements récents</h3>
            <button onClick={() => navigate('organizer-my-events')} className="text-violet-400 text-xs">Tous</button>
          </div>
          <div className="flex flex-col gap-3">
            {recentEvents.map(event => {
              const sold = event.sv_ticket_types?.reduce((a: number, t: { sold: number }) => a + t.sold, 0) || 0;
              const capacity = event.sv_ticket_types?.reduce((a: number, t: { capacity: number }) => a + t.capacity, 0) || event.total_capacity;
              const pct = capacity > 0 ? Math.round((sold / capacity) * 100) : 0;
              return (
                <div key={event.id} className="bg-[#1A1A30] rounded-2xl p-3 flex items-center gap-3">
                  <div className="w-14 h-14 rounded-xl overflow-hidden flex-shrink-0">
                    <img src={event.image_url || ''} alt={event.title} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-white font-semibold text-sm truncate">{event.title}</h4>
                    <p className="text-gray-500 text-xs">{formatShortDate(event.date)}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="flex-1 h-1 bg-white/10 rounded-full">
                        <div className="h-full bg-violet-500 rounded-full" style={{ width: `${pct}%` }} />
                      </div>
                      <span className="text-gray-400 text-xs">{pct}%</span>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-white font-semibold text-sm">{sold}</p>
                    <p className="text-gray-500 text-xs">vendus</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {events.length === 0 && (
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <p className="text-gray-400 text-sm mb-4">Aucun événement créé</p>
            <button
              onClick={() => navigate('organizer-create-event')}
              className="px-6 py-3 bg-violet-600 text-white font-semibold rounded-2xl flex items-center gap-2"
            >
              <Plus size={16} />
              Créer un événement
            </button>
          </div>
        )}
      </div>

      <OrganizerBottomNav />
    </div>
  );
}
