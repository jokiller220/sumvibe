import { ChevronLeft, ChevronDown, MessageCircle, Phone, Mail } from 'lucide-react';
import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { StatusBar } from '../components/StatusBar';

const FAQS = [
  { q: 'Comment acheter un billet?', a: 'Sélectionnez l\'événement, choisissez le type de billet et payez via Flooz, T-Money ou Wave.' },
  { q: 'Comment récupérer mon billet?', a: 'Votre billet QR code est disponible dans la section "Mes tickets" après paiement.' },
  { q: 'Puis-je obtenir un remboursement?', a: 'Les remboursements sont traités selon la politique de l\'organisateur.' },
  { q: 'Comment signaler un problème?', a: 'Contactez notre support via le bouton "Nous contacter" ci-dessous.' },
];

export function HelpScreen() {
  const { goBack } = useApp();
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <div className="absolute inset-0 bg-[#06060F] flex flex-col overflow-hidden">
      <StatusBar />
      <div className="flex items-center px-5 pt-2 pb-4 gap-3">
        <button onClick={goBack} className="w-9 h-9 bg-white/10 rounded-full flex items-center justify-center">
          <ChevronLeft size={20} className="text-white" />
        </button>
        <h1 className="text-white font-bold text-lg flex-1">Aide et support</h1>
      </div>

      <div className="flex-1 overflow-y-auto px-5 pb-8">
        <h3 className="text-white font-bold mb-3">Questions fréquentes</h3>
        <div className="flex flex-col gap-2 mb-6">
          {FAQS.map((faq, i) => (
            <div key={i} className="bg-[#13132A] rounded-2xl overflow-hidden">
              <button
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
                className="w-full flex items-center justify-between px-4 py-3.5"
              >
                <span className="text-white text-sm font-medium text-left">{faq.q}</span>
                <ChevronDown
                  size={16}
                  className={`text-gray-400 flex-shrink-0 transition-transform ${openFaq === i ? 'rotate-180' : ''}`}
                />
              </button>
              {openFaq === i && (
                <div className="px-4 pb-4">
                  <p className="text-gray-400 text-sm leading-relaxed">{faq.a}</p>
                </div>
              )}
            </div>
          ))}
        </div>

        <h3 className="text-white font-bold mb-3">Nous contacter</h3>
        <div className="flex flex-col gap-2">
          {[
            { icon: MessageCircle, label: 'Chat en direct', sub: 'Disponible 24h/7j', color: 'text-violet-400 bg-violet-600/20' },
            { icon: Phone, label: 'Appeler le support', sub: '+228 90 000 000', color: 'text-green-400 bg-green-600/20' },
            { icon: Mail, label: 'Envoyer un email', sub: 'support@sumvibe.tg', color: 'text-amber-400 bg-amber-600/20' },
          ].map(item => (
            <button
              key={item.label}
              className="bg-[#13132A] rounded-2xl p-4 flex items-center gap-4"
            >
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${item.color}`}>
                <item.icon size={18} />
              </div>
              <div className="text-left">
                <p className="text-white font-semibold text-sm">{item.label}</p>
                <p className="text-gray-500 text-xs">{item.sub}</p>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
