import { ChevronLeft, Heart, MapPin, Calendar, Clock, Users, Share2, CheckCircle } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { StatusBar } from '../components/StatusBar';
import { formatDate, formatTime, formatPrice } from '../lib/utils';

export function EventDetailScreen() {
  const { events, params, navigate, goBack, favoriteIds, toggleFavorite, user } = useApp();
  const event = events.find(e => e.id === params.eventId as string);

  if (!event) return (
    <div className="absolute inset-0 bg-[#06060F] flex items-center justify-center">
      <span className="text-gray-400">Événement introuvable</span>
    </div>
  );

  const organizer = event.sv_organizers;
  const ticketTypes = event.sv_ticket_types || [];
  const minPrice = ticketTypes.length ? Math.min(...ticketTypes.map(t => t.price)) : 0;
  const isFav = favoriteIds.has(event.id);

  return (
    <div className="absolute inset-0 bg-[#06060F] flex flex-col overflow-hidden">
      <div className="absolute top-0 left-0 right-0 z-10">
        <StatusBar />
        <div className="flex items-center justify-between px-4 pt-1 pb-2">
          <button onClick={goBack} className="w-9 h-9 bg-black/40 backdrop-blur-sm rounded-full flex items-center justify-center">
            <ChevronLeft size={20} className="text-white" />
          </button>
          <div className="flex gap-2">
            <button
              onClick={() => navigate('share-event', { eventId: event.id })}
              className="w-9 h-9 bg-black/40 backdrop-blur-sm rounded-full flex items-center justify-center"
            >
              <Share2 size={18} className="text-white" />
            </button>
            <button
              onClick={() => user ? toggleFavorite(event.id) : navigate('login')}
              className="w-9 h-9 bg-black/40 backdrop-blur-sm rounded-full flex items-center justify-center"
            >
              <Heart size={18} fill={isFav ? '#EC4899' : 'none'} stroke={isFav ? '#EC4899' : 'white'} />
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto pb-28 relative">
        {/* Hero image */}
        <div className="relative h-72 flex-shrink-0">
          <img src={event.image_url || ''} alt={event.title} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#06060F]" />
          <div className="absolute bottom-4 left-5 right-5">
            <div className="bg-violet-600/20 backdrop-blur-sm border border-violet-500/30 rounded-full px-3 py-0.5 inline-block mb-2">
              <span className="text-violet-300 text-xs font-medium">{event.category}</span>
            </div>
            <h1 className="text-white text-2xl font-black leading-tight">{event.title}</h1>
          </div>
        </div>

        <div className="px-5 pt-4">
          {/* Info grid */}
          <div className="grid grid-cols-2 gap-3 mb-5">
            <div className="bg-[#13132A] rounded-2xl p-3 flex items-center gap-3">
              <div className="w-8 h-8 bg-violet-600/20 rounded-xl flex items-center justify-center">
                <Calendar size={16} className="text-violet-400" />
              </div>
              <div>
                <p className="text-gray-500 text-xs">Date</p>
                <p className="text-white text-xs font-semibold">{formatDate(event.date)}</p>
              </div>
            </div>
            <div className="bg-[#13132A] rounded-2xl p-3 flex items-center gap-3">
              <div className="w-8 h-8 bg-pink-600/20 rounded-xl flex items-center justify-center">
                <Clock size={16} className="text-pink-400" />
              </div>
              <div>
                <p className="text-gray-500 text-xs">Heure</p>
                <p className="text-white text-xs font-semibold">{formatTime(event.date)}</p>
              </div>
            </div>
            <div className="bg-[#13132A] rounded-2xl p-3 flex items-center gap-3 col-span-2">
              <div className="w-8 h-8 bg-amber-600/20 rounded-xl flex items-center justify-center">
                <MapPin size={16} className="text-amber-400" />
              </div>
              <div>
                <p className="text-gray-500 text-xs">Lieu</p>
                <p className="text-white text-xs font-semibold">{event.location}, {event.city}</p>
              </div>
            </div>
          </div>

          {/* Organizer */}
          {organizer && (
            <div className="bg-[#13132A] rounded-2xl p-4 mb-5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-violet-600 rounded-full flex items-center justify-center text-white font-bold">
                  {organizer.name.charAt(0)}
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-white text-sm font-semibold">{organizer.name}</span>
                    {organizer.verified && (
                      <CheckCircle size={14} fill="#7C3AED" stroke="white" strokeWidth={2} />
                    )}
                  </div>
                  <span className="text-gray-500 text-xs">Organisateur</span>
                </div>
              </div>
              <button
                onClick={() => navigate('public-profile', { organizerId: organizer.id })}
                className="text-xs text-violet-400 font-medium"
              >
                Voir
              </button>
            </div>
          )}

          {/* Description */}
          {event.description && (
            <div className="mb-5">
              <h3 className="text-white font-bold mb-2">Description</h3>
              <p className="text-gray-400 text-sm leading-relaxed">{event.description}</p>
            </div>
          )}

          {/* Ticket types */}
          <div className="mb-5">
            <h3 className="text-white font-bold mb-3">Billets disponibles</h3>
            <div className="flex flex-col gap-2">
              {ticketTypes.map(t => {
                const available = t.capacity - t.sold;
                const soldPct = Math.round((t.sold / t.capacity) * 100);
                return (
                  <div key={t.id} className="bg-[#13132A] rounded-2xl p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-white font-semibold text-sm">{t.name}</span>
                      <span className="text-amber-400 font-bold text-sm">{formatPrice(t.price)}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs mb-2">
                      <div className="flex items-center gap-1 text-gray-400">
                        <Users size={12} />
                        <span>{available} disponibles</span>
                      </div>
                      <span className="text-gray-500">{soldPct}% vendu</span>
                    </div>
                    <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-violet-600 to-pink-500 rounded-full"
                        style={{ width: `${soldPct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="absolute bottom-0 left-0 right-0 bg-[#06060F] border-t border-white/10 px-5 py-4 pb-6">
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-gray-500 text-xs">À partir de</p>
            <p className="text-amber-400 font-black text-lg">{formatPrice(minPrice)}</p>
          </div>
          <div className="text-right">
            <p className="text-gray-500 text-xs">Billets disponibles</p>
            <p className="text-white text-sm font-semibold">
              {ticketTypes.reduce((a, t) => a + Math.max(0, t.capacity - (t.sold || 0)), 0)}
            </p>
          </div>
        </div>
        
        {(() => {
          const totalAvailable = ticketTypes.reduce((a, t) => a + Math.max(0, t.capacity - (t.sold || 0)), 0);
          const isSoldOut = totalAvailable <= 0;
          
          return (
            <button
              onClick={() => {
                if (!isSoldOut) {
                  if (!user) navigate('login');
                  else navigate('ticket-selection', { eventId: event.id });
                }
              }}
              disabled={isSoldOut}
              className={`w-full py-4 font-bold rounded-2xl text-base transition-all ${
                isSoldOut 
                  ? 'bg-gray-800 text-gray-500 cursor-not-allowed'
                  : 'bg-gradient-to-r from-violet-600 to-violet-500 text-white active:opacity-90'
              }`}
            >
              {isSoldOut ? 'Épuisé (Sold Out)' : 'Acheter un billet'}
            </button>
          );
        })()}
      </div>
    </div>
  );
}
