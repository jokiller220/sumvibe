import { useState } from 'react';
import { Bell, MapPin, Search, Heart, ChevronRight } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { BottomNav } from '../components/BottomNav';
import { StatusBar } from '../components/StatusBar';
import { Event } from '../lib/types';
import { formatShortDate, formatTime, formatPrice } from '../lib/utils';
import { PullToRefresh } from '../components/PullToRefresh';

const CATEGORIES = ['Tous', 'Concerts', 'Soirées', 'Festivals', 'Plage', 'Sport'];

export function HomeScreen() {
  const { events, favoriteIds, toggleFavorite, navigate, user, profile, loadEvents } = useApp();
  const [activeCategory, setActiveCategory] = useState('Tous');

  const firstName = profile?.full_name?.split(' ')[0] || user?.user_metadata?.full_name?.split(' ')[0] || 'toi';

  const featured = events.filter(e => e.is_featured);
  const filtered = activeCategory === 'Tous' ? events : events.filter(e => e.category === activeCategory);
  const upcoming = filtered.slice(0, 6);

  return (
    <div className="absolute inset-0 bg-[#06060F] flex flex-col overflow-hidden">
      <StatusBar />

      {/* Header */}
      <div className="flex-shrink-0 px-5 pt-2 pb-3">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-gray-400 text-xs">Bonjour,</p>
            <h1 className="text-white font-bold text-lg">{firstName} 🌟</h1>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate('notifications')}
              className="w-9 h-9 bg-[#13132A] rounded-full flex items-center justify-center relative"
            >
              <Bell size={18} className="text-white" />
              <div className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
            </button>
            <button
              onClick={() => navigate(user ? 'profile' : 'login')}
              className="w-9 h-9 bg-violet-600 rounded-full flex items-center justify-center text-white font-bold text-sm"
            >
              {firstName.charAt(0).toUpperCase()}
            </button>
          </div>
        </div>

        {/* Location */}
        <div className="flex items-center gap-1 mb-4">
          <MapPin size={13} className="text-violet-400" />
          <span className="text-gray-400 text-xs">Lomé, Togo</span>
        </div>

        {/* Search bar */}
        <button
          onClick={() => navigate('search')}
          className="w-full bg-[#13132A] border border-white/10 rounded-2xl px-4 py-3 flex items-center gap-3"
        >
          <Search size={16} className="text-gray-500" />
          <span className="text-gray-500 text-sm">Rechercher un événement...</span>
        </button>
      </div>

      {/* Scrollable content */}
      <PullToRefresh onRefresh={loadEvents}>
        <div className="pb-24">
          {/* Categories */}
        <div className="px-5 mb-5">
          <div className="flex gap-2 overflow-x-auto scrollbar-none pb-1">
            {CATEGORIES.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`flex-shrink-0 px-4 py-1.5 rounded-full text-xs font-medium transition-colors ${
                  activeCategory === cat
                    ? 'bg-violet-600 text-white'
                    : 'bg-[#13132A] text-gray-400 border border-white/10'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Featured */}
        {featured.length > 0 && (
          <section className="mb-6">
            <div className="flex items-center justify-between px-5 mb-3">
              <h2 className="text-white font-bold text-base">En vedette 🔥</h2>
              <button onClick={() => navigate('categories')} className="text-violet-400 text-xs flex items-center gap-1">
                Voir tout <ChevronRight size={14} />
              </button>
            </div>
            <div className="flex gap-4 overflow-x-auto scrollbar-none px-5 pb-2">
              {featured.map(event => (
                <FeaturedCard
                  key={event.id}
                  event={event}
                  isFav={favoriteIds.has(event.id)}
                  onFav={() => user ? toggleFavorite(event.id) : navigate('login')}
                  onPress={() => navigate('event-detail', { eventId: event.id })}
                />
              ))}
            </div>
          </section>
        )}

        {/* Upcoming */}
        <section>
          <div className="flex items-center justify-between px-5 mb-3">
            <h2 className="text-white font-bold text-base">À venir 📅</h2>
            <button onClick={() => navigate('categories')} className="text-violet-400 text-xs flex items-center gap-1">
              Voir tout <ChevronRight size={14} />
            </button>
          </div>
          <div className="flex flex-col gap-3 px-5">
            {upcoming.map(event => (
              <UpcomingCard
                key={event.id}
                event={event}
                isFav={favoriteIds.has(event.id)}
                onFav={() => user ? toggleFavorite(event.id) : navigate('login')}
                onPress={() => navigate('event-detail', { eventId: event.id })}
              />
            ))}
          </div>
        </section>
        </div>
      </PullToRefresh>

      <BottomNav />
    </div>
  );
}

function FeaturedCard({
  event,
  isFav,
  onFav,
  onPress,
}: {
  event: Event;
  isFav: boolean;
  onFav: () => void;
  onPress: () => void;
}) {
  const minPrice = event.sv_ticket_types?.length
    ? Math.min(...event.sv_ticket_types.map(t => t.price))
    : 0;

  return (
    <button
      onClick={onPress}
      className="flex-shrink-0 w-56 h-72 rounded-2xl overflow-hidden relative"
    >
      <img src={event.image_url || ''} alt={event.title} className="absolute inset-0 w-full h-full object-cover" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />

      <button
        onClick={e => { e.stopPropagation(); onFav(); }}
        className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center"
      >
        <Heart size={16} fill={isFav ? '#EC4899' : 'none'} stroke={isFav ? '#EC4899' : 'white'} />
      </button>

      <div className="absolute bottom-0 left-0 right-0 p-4">
        <div className="bg-violet-600/20 backdrop-blur-sm border border-violet-500/30 rounded-lg px-2 py-0.5 inline-block mb-2">
          <span className="text-violet-300 text-xs font-medium">{event.category}</span>
        </div>
        <h3 className="text-white font-bold text-sm leading-tight mb-1">{event.title}</h3>
        <div className="flex items-center gap-1 mb-2">
          <MapPin size={11} className="text-gray-300" />
          <span className="text-gray-300 text-xs truncate">{event.location}, {event.city}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-300">{formatShortDate(event.date)}</span>
          <span className="text-amber-400 text-xs font-semibold">À partir de {formatPrice(minPrice)}</span>
        </div>
      </div>
    </button>
  );
}

function UpcomingCard({
  event,
  isFav,
  onFav,
  onPress,
}: {
  event: Event;
  isFav: boolean;
  onFav: () => void;
  onPress: () => void;
}) {
  const minPrice = event.sv_ticket_types?.length
    ? Math.min(...event.sv_ticket_types.map(t => t.price))
    : 0;

  return (
    <button
      onClick={onPress}
      className="w-full bg-[#13132A] rounded-2xl overflow-hidden flex gap-3 p-3 active:bg-[#1A1A35] transition-colors"
    >
      <div className="w-20 h-20 rounded-xl overflow-hidden flex-shrink-0">
        <img src={event.image_url || ''} alt={event.title} className="w-full h-full object-cover" />
      </div>
      <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
        <div>
          <div className="flex items-center justify-between mb-1">
            <span className="text-violet-400 text-xs font-medium">{event.category}</span>
            <button
              onClick={e => { e.stopPropagation(); onFav(); }}
              className="ml-2"
            >
              <Heart size={14} fill={isFav ? '#EC4899' : 'none'} stroke={isFav ? '#EC4899' : '#6B7280'} />
            </button>
          </div>
          <h3 className="text-white font-semibold text-sm leading-tight truncate">{event.title}</h3>
        </div>
        <div>
          <div className="flex items-center gap-1 mb-1">
            <MapPin size={11} className="text-gray-500" />
            <span className="text-gray-500 text-xs truncate">{event.location}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-400 text-xs">{formatShortDate(event.date)} • {formatTime(event.date)}</span>
            <span className="text-amber-400 text-xs font-semibold">{formatPrice(minPrice)}</span>
          </div>
        </div>
      </div>
    </button>
  );
}
