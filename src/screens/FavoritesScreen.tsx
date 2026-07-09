import { Heart, MapPin } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { BottomNav } from '../components/BottomNav';
import { StatusBar } from '../components/StatusBar';
import { formatShortDate, formatPrice } from '../lib/utils';

export function FavoritesScreen() {
  const { events, favoriteIds, toggleFavorite, navigate, user } = useApp();
  const favorites = events.filter(e => favoriteIds.has(e.id));

  if (!user) {
    return (
      <div className="absolute inset-0 bg-[#06060F] flex flex-col">
        <StatusBar />
        <div className="flex-1 flex flex-col items-center justify-center px-6 text-center">
          <Heart size={40} className="text-gray-600 mb-4" />
          <h2 className="text-white font-bold text-xl mb-2">Vos favoris</h2>
          <p className="text-gray-400 text-sm mb-6">Connectez-vous pour sauvegarder vos événements</p>
          <button onClick={() => navigate('login')} className="w-full py-4 bg-violet-600 text-white font-semibold rounded-2xl">
            Se connecter
          </button>
        </div>
        <BottomNav />
      </div>
    );
  }

  return (
    <div className="absolute inset-0 bg-[#06060F] flex flex-col overflow-hidden">
      <StatusBar />
      <div className="px-5 pt-2 pb-4">
        <h1 className="text-white font-bold text-xl">Favoris</h1>
      </div>

      <div className="flex-1 overflow-y-auto pb-24 px-5">
        {favorites.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 text-center">
            <Heart size={32} className="text-gray-600 mb-3" />
            <p className="text-gray-500 text-sm">Aucun favori pour l&apos;instant</p>
            <button onClick={() => navigate('home')} className="mt-3 text-violet-400 text-sm font-medium">
              Découvrir des événements
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {favorites.map(event => {
              const minPrice = event.sv_ticket_types?.length
                ? Math.min(...event.sv_ticket_types.map(t => t.price))
                : 0;
              return (
                <button
                  key={event.id}
                  onClick={() => navigate('event-detail', { eventId: event.id })}
                  className="w-full bg-[#13132A] rounded-2xl overflow-hidden flex gap-3 p-3"
                >
                  <div className="w-20 h-20 rounded-xl overflow-hidden flex-shrink-0">
                    <img src={event.image_url || ''} alt={event.title} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
                    <div>
                      <span className="text-violet-400 text-xs font-medium">{event.category}</span>
                      <h3 className="text-white font-semibold text-sm leading-tight truncate">{event.title}</h3>
                    </div>
                    <div>
                      <div className="flex items-center gap-1 mb-1">
                        <MapPin size={11} className="text-gray-500" />
                        <span className="text-gray-500 text-xs truncate">{event.location}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-400 text-xs">{formatShortDate(event.date)}</span>
                        <span className="text-amber-400 text-xs font-semibold">{formatPrice(minPrice)}</span>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={e => { e.stopPropagation(); toggleFavorite(event.id); }}
                    className="flex-shrink-0 self-center ml-1"
                  >
                    <Heart size={18} fill="#EC4899" stroke="#EC4899" />
                  </button>
                </button>
              );
            })}
          </div>
        )}
      </div>
      <BottomNav />
    </div>
  );
}
