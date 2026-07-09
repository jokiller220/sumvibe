import { useState } from 'react';
import { ChevronLeft, MapPin, SlidersHorizontal } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { BottomNav } from '../components/BottomNav';
import { StatusBar } from '../components/StatusBar';
import { formatShortDate, formatPrice } from '../lib/utils';

const CATEGORIES = ['Tous', 'Concerts', 'Soirées', 'Festivals', 'Plage', 'Sport', 'Théâtres', 'Conférences', 'Autres'];

const CATEGORY_ICONS: Record<string, string> = {
  Concerts: '🎵', Soirées: '🌙', Festivals: '🎪', Plage: '🏖️',
  Sport: '⚽', Théâtres: '🎭', Conférences: '🎤', Autres: '✨', Tous: '🔥',
};

export function CategoriesScreen() {
  const { events, params, navigate, goBack } = useApp();
  const [activeCategory, setActiveCategory] = useState((params.category as string) || 'Tous');

  const filtered = activeCategory === 'Tous' ? events : events.filter(e => e.category === activeCategory);

  return (
    <div className="absolute inset-0 bg-[#06060F] flex flex-col overflow-hidden">
      <StatusBar />
      <div className="flex items-center justify-between px-5 pt-2 pb-4">
        <div className="flex items-center gap-3">
          <button onClick={goBack} className="w-9 h-9 bg-white/10 rounded-full flex items-center justify-center">
            <ChevronLeft size={20} className="text-white" />
          </button>
          <h1 className="text-white font-bold text-lg">Catégories</h1>
        </div>
        <button
          onClick={() => navigate('filter')}
          className="w-9 h-9 bg-[#13132A] rounded-full flex items-center justify-center"
        >
          <SlidersHorizontal size={16} className="text-gray-400" />
        </button>
      </div>

      {/* Category grid */}
      <div className="px-5 mb-4">
        <div className="grid grid-cols-4 gap-2">
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`flex flex-col items-center gap-1 py-3 rounded-2xl transition-colors ${
                activeCategory === cat
                  ? 'bg-violet-600/20 border border-violet-500'
                  : 'bg-[#13132A] border border-transparent'
              }`}
            >
              <span className="text-xl">{CATEGORY_ICONS[cat] || '📅'}</span>
              <span className={`text-xs font-medium ${activeCategory === cat ? 'text-violet-300' : 'text-gray-400'}`}>
                {cat}
              </span>
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto pb-24">
        <div className="px-5">
          <p className="text-gray-400 text-xs mb-3">{filtered.length} événement{filtered.length > 1 ? 's' : ''}</p>
          <div className="flex flex-col gap-3">
            {filtered.map(event => {
              const minPrice = event.sv_ticket_types?.length
                ? Math.min(...event.sv_ticket_types.map(t => t.price))
                : 0;
              return (
                <button
                  key={event.id}
                  onClick={() => navigate('event-detail', { eventId: event.id })}
                  className="w-full bg-[#13132A] rounded-2xl overflow-hidden"
                >
                  <div className="relative h-36">
                    <img src={event.image_url || ''} alt={event.title} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/80" />
                    <div className="absolute bottom-0 left-0 right-0 p-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-white font-bold text-sm">{event.title}</h3>
                          <div className="flex items-center gap-1">
                            <MapPin size={10} className="text-gray-300" />
                            <span className="text-gray-300 text-xs">{event.location}</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="text-amber-400 font-bold text-sm">{formatPrice(minPrice)}</span>
                          <p className="text-gray-300 text-xs">{formatShortDate(event.date)}</p>
                        </div>
                      </div>
                    </div>
                    <div className="absolute top-3 left-3 bg-violet-600/80 backdrop-blur-sm rounded-full px-2 py-0.5">
                      <span className="text-white text-xs font-medium">{event.category}</span>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
      <BottomNav />
    </div>
  );
}
