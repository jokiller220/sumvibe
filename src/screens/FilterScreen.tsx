import { useState } from 'react';
import { ChevronLeft, X } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { StatusBar } from '../components/StatusBar';

const CATEGORIES = ['Concerts', 'Soirées', 'Festivals', 'Plage', 'Sport', 'Théâtres', 'Conférences', 'Autres'];

export function FilterScreen() {
  const { goBack, navigate } = useApp();
  const [selectedCats, setSelectedCats] = useState<string[]>([]);
  const [city, setCity] = useState('');

  const toggleCat = (cat: string) =>
    setSelectedCats(s => s.includes(cat) ? s.filter(c => c !== cat) : [...s, cat]);

  const apply = () => {
    navigate('categories', { category: selectedCats[0] || 'Tous' });
  };

  return (
    <div className="absolute inset-0 bg-[#06060F] flex flex-col overflow-hidden">
      <StatusBar />
      <div className="flex items-center justify-between px-5 pt-2 pb-4">
        <div className="flex items-center gap-3">
          <button onClick={goBack} className="w-9 h-9 bg-white/10 rounded-full flex items-center justify-center">
            <ChevronLeft size={20} className="text-white" />
          </button>
          <h1 className="text-white font-bold text-lg">Filtrer les événements</h1>
        </div>
        <button
          onClick={() => { setSelectedCats([]); setCity(''); }}
          className="text-violet-400 text-sm"
        >
          Réinitialiser
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-5 pb-28">
        {/* Categories */}
        <div className="mb-6">
          <h3 className="text-white font-bold text-sm mb-3">Catégories</h3>
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map(cat => (
              <button
                key={cat}
                onClick={() => toggleCat(cat)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm transition-colors ${
                  selectedCats.includes(cat)
                    ? 'bg-violet-600 text-white'
                    : 'bg-[#13132A] text-gray-400 border border-white/10'
                }`}
              >
                {cat}
                {selectedCats.includes(cat) && <X size={12} />}
              </button>
            ))}
          </div>
        </div>

        {/* City */}
        <div className="mb-6">
          <h3 className="text-white font-bold text-sm mb-3">Lieu</h3>
          <input
            type="text"
            value={city}
            onChange={e => setCity(e.target.value)}
            placeholder="Choisir un lieu..."
            className="w-full bg-[#13132A] border border-white/10 rounded-xl px-4 py-3.5 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-violet-500 transition-colors"
          />
        </div>

        {/* Date range */}
        <div className="mb-6">
          <h3 className="text-white font-bold text-sm mb-3">Date</h3>
          <div className="flex flex-col gap-3">
            {[
              { label: 'Ce week-end', key: 'weekend' },
              { label: 'Ce mois', key: 'month' },
              { label: 'Ce trimestre', key: 'quarter' },
            ].map(item => (
              <button key={item.key} className="bg-[#13132A] rounded-xl px-4 py-3 flex items-center gap-3 text-left">
                <div className="w-4 h-4 rounded-full border-2 border-gray-600 flex items-center justify-center" />
                <span className="text-gray-300 text-sm">{item.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Apply button */}
      <div className="absolute bottom-0 left-0 right-0 bg-[#06060F] border-t border-white/10 px-5 py-4 pb-6">
        <button
          onClick={apply}
          className="w-full py-4 bg-violet-600 text-white font-bold rounded-2xl"
        >
          Appliquer
        </button>
      </div>
    </div>
  );
}
