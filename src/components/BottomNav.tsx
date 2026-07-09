import { Home, Ticket, Heart, User, Search, LucideIcon } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Screen } from '../lib/types';

const tabs: { icon: LucideIcon; label: string; screen: Screen }[] = [
  { icon: Home, label: 'Accueil', screen: 'home' },
  { icon: Search, label: 'Recherche', screen: 'search' },
  { icon: Ticket, label: 'Tickets', screen: 'my-tickets' },
  { icon: Heart, label: 'Favoris', screen: 'favorites' },
  { icon: User, label: 'Profil', screen: 'profile' },
];

export function BottomNav() {
  const { screen, navigate } = useApp();

  return (
    <div className="absolute bottom-0 left-0 right-0 bg-[#0D0D20] border-t border-white/10 flex pb-5 pt-2 px-2 z-50">
      {tabs.map(tab => {
        const active =
          screen === tab.screen ||
          (tab.screen === 'home' && screen === 'home') ||
          (tab.screen === 'search' && (screen === 'search' || screen === 'categories' || screen === 'filter'));
        return (
          <button
            key={tab.screen}
            onClick={() => navigate(tab.screen)}
            className="flex-1 flex flex-col items-center gap-1"
          >
            <tab.icon
              size={22}
              strokeWidth={active ? 2.5 : 1.8}
            />
            <span
              className={`text-[10px] font-medium ${active ? 'text-violet-400' : 'text-gray-500'}`}
            >
              {tab.label}
            </span>
            {active && (
              <div className="w-1 h-1 rounded-full bg-violet-400 -mt-1" />
            )}
          </button>
        );
      })}
    </div>
  );
}

export function OrganizerBottomNav() {
  const { screen, navigate } = useApp();
  const tabs: { icon: LucideIcon; label: string; screen: Screen }[] = [
    { icon: Home, label: 'Tableau', screen: 'organizer-dashboard' as Screen },
    { icon: Ticket, label: 'Événements', screen: 'organizer-my-events' as Screen },
    { icon: Search, label: 'Scanner', screen: 'organizer-scanner' as Screen },
    { icon: User, label: 'Profil', screen: 'organizer-profile' as Screen },
  ];

  return (
    <div className="absolute bottom-0 left-0 right-0 bg-[#0D0D20] border-t border-white/10 flex pb-5 pt-2 px-2 z-50">
      {tabs.map(tab => {
        const active = screen === tab.screen;
        return (
          <button
            key={tab.screen}
            onClick={() => navigate(tab.screen)}
            className="flex-1 flex flex-col items-center gap-1"
          >
            <tab.icon
              size={22}
              strokeWidth={active ? 2.5 : 1.8}
            />
            <span className={`text-[10px] font-medium ${active ? 'text-violet-400' : 'text-gray-500'}`}>
              {tab.label}
            </span>
            {active && <div className="w-1 h-1 rounded-full bg-violet-400 -mt-1" />}
          </button>
        );
      })}
    </div>
  );
}
