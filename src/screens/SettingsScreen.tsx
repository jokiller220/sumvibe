import { ChevronLeft, ChevronRight, Bell, Globe, Shield, Info, LogOut } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { StatusBar } from '../components/StatusBar';

export function SettingsScreen() {
  const { goBack, signOut } = useApp();

  const sections = [
    {
      title: 'Compte',
      items: [
        { icon: Info, label: 'Informations de l\'organisation', action: () => {} },
        { icon: Bell, label: 'Préférences de notification', action: () => {} },
      ],
    },
    {
      title: 'Application',
      items: [
        { icon: Shield, label: 'Sécurité', action: () => {} },
        { icon: Globe, label: 'Langue', value: 'Français', action: () => {} },
      ],
    },
    {
      title: 'Informations',
      items: [
        { icon: Info, label: 'À propos de SUMVIBE', action: () => {} },
        { icon: Shield, label: 'Conditions d\'utilisation', action: () => {} },
        { icon: Shield, label: 'Politique de confidentialité', action: () => {} },
      ],
    },
  ];

  return (
    <div className="absolute inset-0 bg-[#06060F] flex flex-col overflow-hidden">
      <StatusBar />
      <div className="flex items-center px-5 pt-2 pb-4 gap-3">
        <button onClick={goBack} className="w-9 h-9 bg-white/10 rounded-full flex items-center justify-center">
          <ChevronLeft size={20} className="text-white" />
        </button>
        <h1 className="text-white font-bold text-lg flex-1">Paramètres</h1>
      </div>

      <div className="flex-1 overflow-y-auto px-5 pb-8">
        {sections.map(section => (
          <div key={section.title} className="mb-5">
            <p className="text-gray-500 text-xs font-semibold uppercase tracking-wider mb-2 px-1">{section.title}</p>
            <div className="bg-[#13132A] rounded-2xl overflow-hidden">
              {section.items.map((item, i) => (
                <button
                  key={item.label}
                  onClick={item.action}
                  className={`w-full flex items-center justify-between px-4 py-3.5 active:bg-white/5 ${i > 0 ? 'border-t border-white/5' : ''}`}
                >
                  <div className="flex items-center gap-3">
                    <item.icon size={16} className="text-gray-400" />
                    <span className="text-white text-sm">{item.label}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {item.value && <span className="text-gray-500 text-xs">{item.value}</span>}
                    <ChevronRight size={16} className="text-gray-600" />
                  </div>
                </button>
              ))}
            </div>
          </div>
        ))}

        <p className="text-center text-gray-600 text-xs mb-4">Version 1.0.0</p>

        <button
          onClick={signOut}
          className="w-full flex items-center justify-center gap-2 px-4 py-3.5 bg-red-500/10 border border-red-500/20 rounded-2xl"
        >
          <LogOut size={16} className="text-red-400" />
          <span className="text-red-400 text-sm font-medium">Se déconnecter</span>
        </button>
      </div>
    </div>
  );
}
