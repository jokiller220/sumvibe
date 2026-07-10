import { useState, useEffect } from 'react';
import { Calendar, MapPin, QrCode, Trash2 } from 'lucide-react';
import { useLongPress } from 'use-long-press';
import { useApp } from '../context/AppContext';
import { BottomNav } from '../components/BottomNav';
import { StatusBar } from '../components/StatusBar';
import { Purchase } from '../lib/types';
import { formatShortDate, formatTime, formatPrice } from '../lib/utils';

export function MyTicketsScreen() {
  const { myPurchases, navigate, user } = useApp();
  const [tab, setTab] = useState<'upcoming' | 'past'>('upcoming');
  const [hiddenTicketIds, setHiddenTicketIds] = useState<string[]>(() => {
    try {
      return JSON.parse(localStorage.getItem('sv_hidden_tickets') || '[]');
    } catch { return []; }
  });
  const [ticketToDelete, setTicketToDelete] = useState<Purchase | null>(null);

  useEffect(() => {
    localStorage.setItem('sv_hidden_tickets', JSON.stringify(hiddenTicketIds));
  }, [hiddenTicketIds]);

  if (!user) {
    return (
      <div className="absolute inset-0 bg-[#06060F] flex flex-col">
        <StatusBar />
        <div className="flex-1 flex flex-col items-center justify-center px-6 text-center">
          <div className="w-20 h-20 bg-violet-600/20 rounded-full flex items-center justify-center mb-4">
            <QrCode size={36} className="text-violet-400" />
          </div>
          <h2 className="text-white font-bold text-xl mb-2">Vos tickets</h2>
          <p className="text-gray-400 text-sm mb-6">Connectez-vous pour voir vos billets</p>
          <button
            onClick={() => navigate('login')}
            className="w-full py-4 bg-violet-600 text-white font-semibold rounded-2xl"
          >
            Se connecter
          </button>
        </div>
        <BottomNav />
      </div>
    );
  }

  const now = new Date();
  const upcoming = myPurchases.filter(p => p.sv_events && new Date(p.sv_events.date) > now);
  const past = myPurchases.filter(p => p.sv_events && new Date(p.sv_events.date) <= now && !hiddenTicketIds.includes(p.id));
  const list = tab === 'upcoming' ? upcoming : past;

  const handleDelete = () => {
    if (ticketToDelete) {
      setHiddenTicketIds(prev => [...prev, ticketToDelete.id]);
      setTicketToDelete(null);
    }
  };

  return (
    <div className="absolute inset-0 bg-[#06060F] flex flex-col overflow-hidden">
      <StatusBar />
      <div className="px-5 pt-2 pb-4">
        <h1 className="text-white font-bold text-xl mb-4">Mes tickets</h1>
        <div className="flex bg-[#13132A] rounded-2xl p-1 gap-1">
          {(['upcoming', 'past'] as const).map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                tab === t ? 'bg-violet-600 text-white' : 'text-gray-500'
              }`}
            >
              {t === 'upcoming' ? 'À venir' : 'Passées'}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto pb-24 px-5 relative">
        {list.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 text-center">
            <QrCode size={32} className="text-gray-600 mb-3" />
            <p className="text-gray-500 text-sm">Aucun billet {tab === 'upcoming' ? 'à venir' : 'passé'}</p>
            {tab === 'upcoming' && (
              <button onClick={() => navigate('home')} className="mt-3 text-violet-400 text-sm font-medium">
                Découvrir des événements
              </button>
            )}
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {list.map(purchase => (
              <TicketCard
                key={purchase.id}
                purchase={purchase}
                isPast={tab === 'past'}
                onPress={() => navigate('ticket-detail', { purchaseId: purchase.id })}
                onLongPress={() => tab === 'past' && setTicketToDelete(purchase)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {ticketToDelete && (
        <div className="absolute inset-0 z-50 flex items-center justify-center px-6">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setTicketToDelete(null)} />
          <div className="relative bg-[#13132A] rounded-3xl p-6 w-full max-w-sm border border-white/10 shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="w-12 h-12 bg-red-500/20 rounded-full flex items-center justify-center mb-4 mx-auto">
              <Trash2 size={24} className="text-red-500" />
            </div>
            <h3 className="text-xl font-bold text-white text-center mb-2">Supprimer le billet ?</h3>
            <p className="text-gray-400 text-center text-sm mb-6">
              Voulez-vous vraiment supprimer ce billet de votre historique ? Cette action est irréversible.
            </p>
            <div className="flex gap-3">
              <button 
                onClick={() => setTicketToDelete(null)}
                className="flex-1 py-3.5 rounded-xl bg-white/5 hover:bg-white/10 text-white font-semibold transition-colors text-sm"
              >
                Annuler
              </button>
              <button 
                onClick={handleDelete}
                className="flex-1 py-3.5 rounded-xl bg-red-500 hover:bg-red-600 text-white font-semibold transition-colors text-sm"
              >
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}

      <BottomNav />
    </div>
  );
}

function TicketCard({ purchase, onPress, onLongPress, isPast }: { purchase: Purchase; onPress: () => void, onLongPress: () => void, isPast: boolean }) {
  const event = purchase.sv_events;
  const ticketType = purchase.sv_ticket_types;
  
  const bind = useLongPress(() => {
    onLongPress();
  }, {
    threshold: 500,
    cancelOnMovement: true
  });

  if (!event) return null;

  return (
    <button
      {...bind()}
      onClick={onPress}
      style={{ WebkitTouchCallout: 'none', WebkitUserSelect: 'none', userSelect: 'none' }}
      className={`w-full text-left bg-[#13132A] rounded-2xl overflow-hidden active:opacity-80 transition-all select-none ${isPast ? 'opacity-80' : ''}`}
    >
      {/* Image header */}
      <div className="relative h-28 pointer-events-none">
        <img src={event.image_url || ''} alt={event.title} className="w-full h-full object-cover pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 to-transparent flex items-end p-4 pointer-events-none">
          <div>
            <h3 className="text-white font-bold text-sm">{event.title}</h3>
            <p className="text-gray-300 text-xs">{event.sv_organizers?.name}</p>
          </div>
        </div>
        <div className={`absolute top-3 right-3 px-2 py-0.5 rounded-full text-xs font-semibold ${
          purchase.status === 'active' ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'
        }`}>
          {purchase.status === 'active' ? 'Valide' : 'Utilisé'}
        </div>
      </div>

      {/* Dashed separator */}
      <div className="flex items-center px-4 pointer-events-none">
        <div className="w-4 h-4 -ml-6 bg-[#06060F] rounded-full" />
        <div className="flex-1 border-t-2 border-dashed border-white/10" />
        <div className="w-4 h-4 -mr-6 bg-[#06060F] rounded-full" />
      </div>

      {/* Details */}
      <div className="p-4 pointer-events-none">
        <div className="flex items-center justify-between">
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center gap-1.5">
              <Calendar size={12} className="text-violet-400" />
              <span className="text-gray-300 text-xs">{formatShortDate(event.date)} • {formatTime(event.date)}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <MapPin size={12} className="text-pink-400" />
              <span className="text-gray-300 text-xs">{event.location}, {event.city}</span>
            </div>
            <div className="flex items-center gap-2 mt-1">
              <span className="bg-violet-600/20 text-violet-300 text-xs px-2 py-0.5 rounded-full">
                {ticketType?.name || 'Entrée Standard'}
              </span>
              <span className="text-gray-400 text-xs">×{purchase.quantity}</span>
            </div>
          </div>
          <div className="flex flex-col items-end gap-1">
            <QrCode size={28} className="text-violet-400" />
            <span className="text-amber-400 text-xs font-semibold">{formatPrice(purchase.total_amount)}</span>
          </div>
        </div>
      </div>
    </button>
  );
}
