import {
  ChevronRight, Ticket, Heart, Bell, Settings, HelpCircle, LogOut, User as UserIcon, Building2, CreditCard
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { BottomNav } from '../components/BottomNav';
import { StatusBar } from '../components/StatusBar';

export function ProfileScreen() {
  const { user, profile, myPurchases, favoriteIds, navigate, signOut, organizer } = useApp();

  if (!user) {
    return (
      <div className="absolute inset-0 bg-[#06060F] flex flex-col">
        <StatusBar />
        <div className="flex-1 flex flex-col items-center justify-center px-6 text-center">
          <div className="w-20 h-20 bg-violet-600/20 rounded-full flex items-center justify-center mb-4">
            <UserIcon size={36} className="text-violet-400" />
          </div>
          <h2 className="text-white font-bold text-xl mb-2">Mon Profil</h2>
          <p className="text-gray-400 text-sm mb-6">Connectez-vous pour accéder à votre profil</p>
          <button onClick={() => navigate('login')} className="w-full py-4 bg-violet-600 text-white font-semibold rounded-2xl mb-3">
            Se connecter
          </button>
          <button onClick={() => navigate('register')} className="w-full py-4 bg-[#13132A] border border-white/10 text-white font-semibold rounded-2xl">
            Créer un compte
          </button>
        </div>
        <BottomNav />
      </div>
    );
  }

  const name = profile?.full_name || user.user_metadata?.full_name || user.email?.split('@')[0] || 'Utilisateur';
  const initials = name.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase();

  const menuItems = [
    { icon: Ticket, label: 'Mes tickets', count: myPurchases.length, screen: 'my-tickets' as const },
    { icon: Heart, label: 'Favoris', count: favoriteIds.size, screen: 'favorites' as const },
    { icon: Bell, label: 'Notifications', screen: 'notifications' as const },
    { icon: CreditCard, label: 'Mes paiements', screen: 'my-payments' as const },
  ];

  const settingsItems = [
    { icon: UserIcon, label: 'Informations personnelles', screen: 'personal-info' as const },
    { icon: Settings, label: 'Paramètres', screen: 'settings' as const },
    { icon: HelpCircle, label: 'Aide et support', screen: 'help' as const },
  ];

  return (
    <div className="absolute inset-0 bg-[#06060F] flex flex-col overflow-hidden">
      <StatusBar />
      <div className="flex-1 overflow-y-auto pb-24">
        {/* Header */}
        <div className="px-5 pt-2 pb-6">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-white font-bold text-xl">Profil</h1>
            <button onClick={() => navigate('settings')} className="w-9 h-9 bg-[#13132A] rounded-full flex items-center justify-center">
              <Settings size={18} className="text-gray-400" />
            </button>
          </div>

          {/* Avatar */}
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-gradient-to-br from-violet-600 to-pink-600 rounded-full flex items-center justify-center text-white font-black text-2xl">
              {initials}
            </div>
            <div>
              <h2 className="text-white font-bold text-lg">{name}</h2>
              <p className="text-gray-400 text-sm">{user.email}</p>
              {organizer && (
                <span className="text-xs text-violet-400 font-medium">Organisateur</span>
              )}
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="px-5 mb-6">
          <div className="bg-[#13132A] rounded-2xl p-4 grid grid-cols-3 gap-4 text-center">
            {[
              { label: 'Tickets', value: myPurchases.length },
              { label: 'Favoris', value: favoriteIds.size },
              { label: 'Événements', value: new Set(myPurchases.map(p => p.event_id)).size },
            ].map(({ label, value }) => (
              <div key={label}>
                <p className="text-white font-bold text-xl">{value}</p>
                <p className="text-gray-500 text-xs">{label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Menu */}
        <div className="px-5 mb-4">
          <div className="bg-[#13132A] rounded-2xl overflow-hidden">
            {menuItems.map((item, i) => (
              <button
                key={item.label}
                onClick={() => navigate(item.screen)}
                className={`w-full flex items-center justify-between px-4 py-3.5 active:bg-white/5 transition-colors ${i > 0 ? 'border-t border-white/5' : ''}`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-violet-600/20 rounded-xl flex items-center justify-center">
                    <item.icon size={16} className="text-violet-400" />
                  </div>
                  <span className="text-white text-sm font-medium">{item.label}</span>
                </div>
                <div className="flex items-center gap-2">
                  {item.count !== undefined && item.count > 0 && (
                    <span className="bg-violet-600 text-white text-xs px-2 py-0.5 rounded-full">{item.count}</span>
                  )}
                  <ChevronRight size={16} className="text-gray-600" />
                </div>
              </button>
            ))}
          </div>
        </div>



        {/* Settings */}
        <div className="px-5 mb-4">
          <div className="bg-[#13132A] rounded-2xl overflow-hidden">
            {settingsItems.map((item, i) => (
              <button
                key={item.label}
                onClick={() => navigate(item.screen)}
                className={`w-full flex items-center justify-between px-4 py-3.5 active:bg-white/5 ${i > 0 ? 'border-t border-white/5' : ''}`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-white/5 rounded-xl flex items-center justify-center">
                    <item.icon size={16} className="text-gray-400" />
                  </div>
                  <span className="text-white text-sm font-medium">{item.label}</span>
                </div>
                <ChevronRight size={16} className="text-gray-600" />
              </button>
            ))}
          </div>
        </div>

        {/* Sign out */}
        <div className="px-5 pb-4">
          <button
            onClick={signOut}
            className="w-full flex items-center gap-3 px-4 py-3.5 bg-red-500/10 border border-red-500/20 rounded-2xl mb-6"
          >
            <LogOut size={16} className="text-red-400" />
            <span className="text-red-400 text-sm font-medium">Se déconnecter</span>
          </button>

          <div className="flex justify-center pb-8">
            <button 
              onClick={() => navigate('dev-login')}
              className="text-[10px] text-gray-700 font-mono active:text-violet-500 transition-colors"
            >
              v1.0.0
            </button>
          </div>
        </div>
      </div>
      <BottomNav />
    </div>
  );
}
