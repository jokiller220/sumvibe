import { ChevronLeft, ChevronRight, Bell, Globe, Shield, Info, LogOut, X } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { StatusBar } from '../components/StatusBar';
import { useState } from 'react';

export function SettingsScreen() {
  const { goBack, signOut } = useApp();
  const [activeModal, setActiveModal] = useState<string | null>(null);

  const sections = [
    {
      title: 'Compte',
      items: [
        { icon: Info, label: 'Informations de l\'organisation', action: () => setActiveModal('organisation') },
        { icon: Bell, label: 'Préférences de notification', action: () => setActiveModal('notifications') },
      ],
    },
    {
      title: 'Application',
      items: [
        { icon: Shield, label: 'Sécurité', action: () => setActiveModal('security') },
        { icon: Globe, label: 'Langue', value: 'Français', action: () => setActiveModal('language') },
      ],
    },
    {
      title: 'Informations',
      items: [
        { icon: Info, label: 'À propos de SUMVIBE', action: () => setActiveModal('about') },
        { icon: Shield, label: 'Conditions d\'utilisation', action: () => setActiveModal('terms') },
        { icon: Shield, label: 'Politique de confidentialité', action: () => setActiveModal('privacy') },
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

      {/* Modals */}
      {activeModal && (
        <div className="absolute inset-0 z-50 flex flex-col bg-[#06060F]/90 backdrop-blur-sm animate-fade-in">
          <div className="flex-1 flex flex-col justify-end">
            <div className="bg-[#13132A] rounded-t-3xl border-t border-white/10 flex flex-col h-[70vh]">
              <div className="flex items-center justify-between p-5 border-b border-white/5">
                <h2 className="text-white font-bold text-lg">
                  {activeModal === 'language' && 'Choisir la langue'}
                  {activeModal === 'about' && 'À propos de SUMVIBE'}
                  {activeModal === 'terms' && 'Conditions d\'utilisation'}
                  {activeModal === 'privacy' && 'Politique de confidentialité'}
                  {activeModal === 'notifications' && 'Préférences de notification'}
                  {activeModal === 'security' && 'Sécurité'}
                  {activeModal === 'organisation' && 'Informations de l\'organisation'}
                </h2>
                <button onClick={() => setActiveModal(null)} className="w-8 h-8 bg-white/5 rounded-full flex items-center justify-center">
                  <X size={20} className="text-white" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-5">
                {activeModal === 'language' && (
                  <div className="flex flex-col gap-3">
                    <button className="w-full text-left px-4 py-3 rounded-xl bg-violet-600/20 border border-violet-500/30 text-white font-medium">Français (Actuel)</button>
                    <button className="w-full text-left px-4 py-3 rounded-xl bg-white/5 text-gray-400 font-medium">English (Coming soon)</button>
                  </div>
                )}
                {activeModal === 'about' && (
                  <div className="text-gray-300 text-sm space-y-4">
                    <p>SUMVIBE est la plateforme de référence pour la découverte et la billetterie d'événements au Togo.</p>
                    <p>Notre mission est de connecter les passionnés avec les meilleures expériences locales (concerts, festivals, ateliers...).</p>
                    <p className="text-center font-bold text-violet-400 mt-6">Version 1.0.0</p>
                  </div>
                )}
                {activeModal === 'terms' && (
                  <div className="text-gray-300 text-sm space-y-4">
                    <h3 className="text-white font-bold">1. Acceptation des conditions</h3>
                    <p>En utilisant SUMVIBE, vous acceptez d'être lié par ces conditions. Si vous n'êtes pas d'accord, veuillez ne pas utiliser l'application.</p>
                    <h3 className="text-white font-bold mt-4">2. Billets et Remboursements</h3>
                    <p>Les billets achetés via SUMVIBE sont soumis aux politiques de remboursement de chaque organisateur. SUMVIBE agit uniquement en tant qu'intermédiaire.</p>
                    <h3 className="text-white font-bold mt-4">3. Responsabilités</h3>
                    <p>SUMVIBE n'est pas responsable des annulations, reports ou modifications des événements listés par les organisateurs tiers.</p>
                  </div>
                )}
                {activeModal === 'privacy' && (
                  <div className="text-gray-300 text-sm space-y-4">
                    <h3 className="text-white font-bold">Collecte de données</h3>
                    <p>Nous collectons votre nom, e-mail et numéro de téléphone pour vous fournir nos services et sécuriser vos billets.</p>
                    <h3 className="text-white font-bold mt-4">Partage de données</h3>
                    <p>Nous ne vendons jamais vos données. Les informations nécessaires sont partagées uniquement avec les organisateurs des événements auxquels vous participez.</p>
                  </div>
                )}
                {['notifications', 'security', 'organisation'].includes(activeModal) && (
                  <div className="flex flex-col items-center justify-center h-48 text-center opacity-50">
                    <Info size={32} className="text-gray-600 mb-3" />
                    <p className="text-gray-400 text-sm">Ce paramètre est déjà optimisé pour vous et géré par votre compte.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
