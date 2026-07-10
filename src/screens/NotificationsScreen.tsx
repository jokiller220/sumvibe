import { ChevronLeft, Bell, Ticket, Star, Calendar } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { StatusBar } from '../components/StatusBar';
import { formatPrice, formatShortDate } from '../lib/utils';
import { useMemo } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';

export function NotificationsScreen() {
  const { goBack, myPurchases } = useApp();

  const notifications = useMemo(() => {
    const notifs: any[] = [];
    const now = new Date();

    myPurchases.forEach(p => {
      const event = p.sv_events;
      if (!event) return;

      const purchaseDate = new Date(p.created_at);
      
      // 1. Payment Notification
      notifs.push({
        id: `payment_${p.id}`,
        icon: Star,
        color: 'text-amber-400 bg-amber-600/20',
        title: 'Paiement réussi',
        body: `${formatPrice(p.total_amount)} — ${event.title}`,
        date: purchaseDate,
      });

      // 2. Event Reminder (if event is upcoming and within 7 days)
      const eventDate = new Date(event.date);
      const daysToEvent = (eventDate.getTime() - now.getTime()) / (1000 * 3600 * 24);
      
      if (daysToEvent > 0 && daysToEvent <= 7) {
        notifs.push({
          id: `reminder_${p.id}`,
          icon: Bell,
          color: 'text-pink-400 bg-pink-600/20',
          title: 'Rappel d\'événement',
          body: `${event.title} aura lieu le ${formatShortDate(event.date)} !`,
          date: new Date(now.getTime() - 1000 * 3600 * 2), // Mock generated 2 hours ago
        });
      }
    });

    // Sort by most recent
    notifs.sort((a, b) => b.date.getTime() - a.date.getTime());
    return notifs;
  }, [myPurchases]);

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
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 text-center opacity-50">
               <Bell size={32} className="text-gray-600 mb-3" />
               <p className="text-gray-400 text-sm">Aucune notification pour le moment</p>
            </div>
          ) : (
            notifications.map(n => (
              <div key={n.id} className="bg-[#13132A] rounded-2xl p-4 flex items-start gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${n.color}`}>
                  <n.icon size={18} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm font-semibold mb-0.5">{n.title}</p>
                  <p className="text-gray-400 text-xs">{n.body}</p>
                </div>
                <span className="text-gray-600 text-xs flex-shrink-0 capitalize">
                  {formatDistanceToNow(n.date, { addSuffix: true, locale: fr })}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
