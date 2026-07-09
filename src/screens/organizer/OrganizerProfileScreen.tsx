import { ChevronRight, Building2, BarChart3, Ticket, QrCode, Settings, HelpCircle, LogOut, CheckCircle } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { OrganizerBottomNav } from '../../components/BottomNav';
import { StatusBar } from '../../components/StatusBar';

export function OrganizerProfileScreen() {
  const { organizer, navigate, signOut } = useApp();

  const menuItems = [
    { icon: Building2, label: 'Tableau de bord', screen: 'organizer-dashboard' as const },
    { icon: Ticket, label: 'Mes événements', screen: 'organizer-my-events' as const },
    { icon: QrCode, label: 'Scanner', screen: 'organizer-scanner' as const },
    { icon: BarChart3, label: 'Ventes', screen: 'organizer-sales' as const },
    { icon: Settings, label: 'Paramètres', screen: 'settings' as const },
    { icon: HelpCircle, label: 'Aide et support', screen: 'help' as const },
  ];

  return (
    <div className="absolute inset-0 bg-[#06060F] flex flex-col overflow-hidden">
      <StatusBar />
      <div className="px-5 pt-2 pb-4 flex items-center justify-between">
        <h1 className="text-white font-bold text-xl">Espace Organisateur</h1>
        <button onClick={() => navigate('settings')} className="w-9 h-9 bg-[#13132A] rounded-full flex items-center justify-center">
          <Settings size={18} className="text-gray-400" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto pb-24 px-5">
        {/* Organizer card */}
        <div className="bg-[#13132A] rounded-2xl p-4 mb-6 flex items-center gap-4">
          <div className="w-16 h-16 bg-gradient-to-br from-violet-600 to-pink-600 rounded-2xl flex items-center justify-center text-white font-black text-2xl">
            {organizer?.name.charAt(0) || 'E'}
          </div>
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <span className="text-white font-bold text-lg">{organizer?.name || 'Event Corp'}</span>
              {organizer?.verified && (
                <CheckCircle size={16} fill="#7C3AED" stroke="white" strokeWidth={2} />
              )}
            </div>
            <p className="text-gray-400 text-xs">Organisation d&apos;événements</p>
            <p className="text-gray-500 text-xs">
              Membre depuis{' '}
              {organizer?.member_since
                ? new Date(organizer.member_since).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })
                : '2024'}
            </p>
          </div>
        </div>

        {/* Menu */}
        <div className="bg-[#13132A] rounded-2xl overflow-hidden mb-4">
          {menuItems.map((item, i) => (
            <button
              key={item.label}
              onClick={() => navigate(item.screen)}
              className={`w-full flex items-center justify-between px-4 py-3.5 active:bg-white/5 ${i > 0 ? 'border-t border-white/5' : ''}`}
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-violet-600/20 rounded-xl flex items-center justify-center">
                  <item.icon size={16} className="text-violet-400" />
                </div>
                <span className="text-white text-sm font-medium">{item.label}</span>
              </div>
              <ChevronRight size={16} className="text-gray-600" />
            </button>
          ))}
        </div>

        <button
          onClick={() => navigate('profile')}
          className="w-full bg-[#13132A] rounded-2xl p-4 flex items-center justify-between mb-4"
        >
          <span className="text-gray-400 text-sm">Profil utilisateur</span>
          <ChevronRight size={16} className="text-gray-600" />
        </button>

        <button
          onClick={signOut}
          className="w-full flex items-center justify-center gap-2 px-4 py-3.5 bg-red-500/10 border border-red-500/20 rounded-2xl"
        >
          <LogOut size={16} className="text-red-400" />
          <span className="text-red-400 text-sm font-medium">Se déconnecter</span>
        </button>
      </div>

      <OrganizerBottomNav />
    </div>
  );
}
