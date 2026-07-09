import { ChevronLeft, Bell, Ticket, Star, Calendar } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { StatusBar } from '../components/StatusBar';

const NOTIFS = [
  { id: 1, icon: Ticket, color: 'text-violet-400 bg-violet-600/20', title: 'Nouveau ticket vendu', body: 'Big Chill Beach Party — Entrée Standard', time: 'Il y a 4h' },
  { id: 2, icon: Star, color: 'text-amber-400 bg-amber-600/20', title: 'Paiement reçu', body: '3 000 FCFA — Big Chill Beach Party', time: 'Il y a 6h' },
  { id: 3, icon: Calendar, color: 'text-green-400 bg-green-600/20', title: 'Événement publié avec succès', body: 'Full Moon Party est maintenant visible', time: 'Il y a 1j' },
  { id: 4, icon: Bell, color: 'text-pink-400 bg-pink-600/20', title: 'Rappel d\'événement', body: 'Big Chill Beach Party dans 2 jours!', time: 'Il y a 2j' },
];

export function NotificationsScreen() {
  const { goBack } = useApp();

  return (
    <div className="absolute inset-0 bg-[#06060F] flex flex-col overflow-hidden">
      <StatusBar />
      <div className="flex items-center px-5 pt-2 pb-4 gap-3">
        <button onClick={goBack} className="w-9 h-9 bg-white/10 rounded-full flex items-center justify-center">
          <ChevronLeft size={20} className="text-white" />
        </button>
        <h1 className="text-white font-bold text-lg flex-1">Notifications</h1>
        <button className="text-violet-400 text-xs font-medium">Tout lire</button>
      </div>

      <div className="flex-1 overflow-y-auto px-5 pb-8">
        <div className="flex flex-col gap-3">
          {NOTIFS.map(n => (
            <div key={n.id} className="bg-[#13132A] rounded-2xl p-4 flex items-start gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${n.color}`}>
                <n.icon size={18} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white text-sm font-semibold mb-0.5">{n.title}</p>
                <p className="text-gray-400 text-xs">{n.body}</p>
              </div>
              <span className="text-gray-600 text-xs flex-shrink-0">{n.time}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
