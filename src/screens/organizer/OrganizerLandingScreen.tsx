import { ChevronLeft, BarChart3, Ticket, QrCode, Shield } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { StatusBar } from '../../components/StatusBar';

const FEATURES = [
  { icon: BarChart3, title: 'Tableau de bord', desc: 'Suivez vos ventes en temps réel' },
  { icon: Ticket, title: 'Gestion des billets', desc: 'Créez différents types de billets' },
  { icon: QrCode, title: 'Scanner QR', desc: 'Validez les entrées facilement' },
  { icon: Shield, title: 'Sécurisé', desc: 'Protection des données garantie' },
];

export function OrganizerLandingScreen() {
  const { navigate, goBack, user } = useApp();

  return (
    <div className="absolute inset-0 bg-[#06060F] flex flex-col overflow-hidden">
      <StatusBar />
      <div className="flex items-center px-5 pt-2 pb-4">
        <button onClick={goBack} className="w-9 h-9 bg-white/10 rounded-full flex items-center justify-center">
          <ChevronLeft size={20} className="text-white" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto pb-32 px-6">
        {/* Hero */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-gradient-to-br from-violet-600 to-pink-600 rounded-3xl flex items-center justify-center mx-auto mb-4">
            <BarChart3 size={36} className="text-white" />
          </div>
          <h1 className="text-white text-2xl font-black mb-2">Espace Organisateur</h1>
          <p className="text-gray-400 text-sm leading-relaxed">
            Gérez vos événements en toute simplicité
          </p>
        </div>

        {/* Features */}
        <div className="grid grid-cols-2 gap-3 mb-8">
          {FEATURES.map(f => (
            <div key={f.title} className="bg-[#13132A] rounded-2xl p-4">
              <div className="w-10 h-10 bg-violet-600/20 rounded-xl flex items-center justify-center mb-3">
                <f.icon size={20} className="text-violet-400" />
              </div>
              <p className="text-white font-semibold text-sm mb-1">{f.title}</p>
              <p className="text-gray-500 text-xs">{f.desc}</p>
            </div>
          ))}
        </div>

        {/* Illustration */}
        <div className="bg-[#13132A] rounded-2xl overflow-hidden h-36 mb-8 relative">
          <img
            src="https://images.pexels.com/photos/1540406/pexels-photo-1540406.jpeg"
            alt="Concert"
            className="w-full h-full object-cover opacity-50"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-violet-900/60 to-pink-900/40 flex items-center p-5">
            <div>
              <p className="text-white font-black text-lg">Créez des</p>
              <p className="text-amber-400 font-black text-lg">expériences inoubliables</p>
            </div>
          </div>
        </div>
      </div>

      {/* CTAs */}
      <div className="absolute bottom-0 left-0 right-0 bg-[#06060F] border-t border-white/10 px-5 py-4 pb-6">
        <button
          onClick={() => user ? navigate('organizer-register') : navigate('login')}
          className="w-full py-4 bg-violet-600 text-white font-bold rounded-2xl mb-3"
        >
          Créer un compte organisateur
        </button>
        <button
          onClick={() => user ? navigate('organizer-dashboard') : navigate('login')}
          className="w-full py-3 bg-transparent border border-white/20 text-gray-300 font-medium rounded-2xl text-sm"
        >
          Se connecter
        </button>
      </div>
    </div>
  );
}
