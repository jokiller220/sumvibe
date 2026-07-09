import { useState } from 'react';
import { Search, X, Clock, MapPin, ChevronLeft } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { BottomNav } from '../components/BottomNav';
import { StatusBar } from '../components/StatusBar';
import { formatShortDate, formatPrice } from '../lib/utils';

const RECENT = ['Big Chill Beach Party', 'Toofan Concert', 'Full Moon Party'];

export function SearchScreen() {
  const { events, navigate, goBack } = useApp();
  const [query, setQuery] = useState('');

  const results = query.trim()
    ? events.filter(
        e =>
          e.title.toLowerCase().includes(query.toLowerCase()) ||
          e.category.toLowerCase().includes(query.toLowerCase()) ||
          e.location.toLowerCase().includes(query.toLowerCase())
      )
    : [];

  return (
    <div className="absolute inset-0 bg-[#06060F] flex flex-col overflow-hidden">
      <StatusBar />

      <div className="px-5 pt-2 pb-4">
        <div className="flex items-center gap-3">
          <button onClick={goBack} className="w-9 h-9 bg-white/10 rounded-full flex items-center justify-center flex-shrink-0">
            <ChevronLeft size={20} className="text-white" />
          </button>
          <div className="flex-1 relative">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
            <input
              autoFocus
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Rechercher un événement..."
              className="w-full bg-[#13132A] border border-white/10 rounded-2xl pl-10 pr-10 py-3 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-violet-500 transition-colors"
            />
            {query && (
              <button
                onClick={() => setQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2"
              >
                <X size={16} className="text-gray-500" />
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto pb-24 px-5">
        {!query ? (
          <>
            <div className="mb-6">
              <h3 className="text-white font-bold text-sm mb-3">Recherches récentes</h3>
              <div className="flex flex-col gap-2">
                {RECENT.map(r => (
                  <button
                    key={r}
                    onClick={() => setQuery(r)}
                    className="flex items-center gap-3 py-2.5"
                  >
                    <Clock size={16} className="text-gray-600" />
                    <span className="text-gray-300 text-sm flex-1 text-left">{r}</span>
                    <X size={14} className="text-gray-600" />
                  </button>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-white font-bold text-sm mb-3">Catégories populaires</h3>
              <div className="grid grid-cols-2 gap-3">
                {['Concerts', 'Soirées', 'Festivals', 'Plage', 'Sport', 'Théâtres'].map((cat, i) => (
                  <button
                    key={cat}
                    onClick={() => navigate('categories', { category: cat })}
                    className="h-16 rounded-2xl overflow-hidden relative"
                  >
                    <div className={`absolute inset-0 bg-gradient-to-br ${
                      ['from-violet-600 to-purple-900', 'from-pink-600 to-rose-900', 'from-amber-500 to-orange-900',
                       'from-cyan-600 to-blue-900', 'from-green-600 to-emerald-900', 'from-red-600 to-rose-900'][i % 6]
                    }`} />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-white font-semibold text-sm">{cat}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </>
        ) : results.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-40 text-center">
            <Search size={32} className="text-gray-600 mb-3" />
            <p className="text-gray-400 text-sm">Aucun résultat pour &quot;{query}&quot;</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            <p className="text-gray-400 text-xs mb-1">{results.length} résultat{results.length > 1 ? 's' : ''}</p>
            {results.map(event => {
              const minPrice = event.sv_ticket_types?.length
                ? Math.min(...event.sv_ticket_types.map(t => t.price))
                : 0;
              return (
                <button
                  key={event.id}
                  onClick={() => navigate('event-detail', { eventId: event.id })}
                  className="w-full bg-[#13132A] rounded-2xl overflow-hidden flex gap-3 p-3"
                >
                  <div className="w-16 h-16 rounded-xl overflow-hidden flex-shrink-0">
                    <img src={event.image_url || ''} alt={event.title} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0 text-left">
                    <span className="text-violet-400 text-xs">{event.category}</span>
                    <h3 className="text-white font-semibold text-sm truncate">{event.title}</h3>
                    <div className="flex items-center gap-1">
                      <MapPin size={11} className="text-gray-500" />
                      <span className="text-gray-500 text-xs truncate">{event.location}</span>
                    </div>
                    <div className="flex items-center justify-between mt-0.5">
                      <span className="text-gray-400 text-xs">{formatShortDate(event.date)}</span>
                      <span className="text-amber-400 text-xs font-semibold">{formatPrice(minPrice)}</span>
                    </div>
                  </div>
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
