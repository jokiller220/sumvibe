import { useState } from 'react';
import { ChevronLeft, Shield, Smartphone, CreditCard } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { supabase } from '../lib/supabase';
import { StatusBar } from '../components/StatusBar';
import { formatPrice } from '../lib/utils';

const PAYMENT_METHODS = [
  {
    id: 'pawapay',
    name: 'Mobile Money',
    desc: 'T-Money, Flooz, MTN, Orange, Moov',
    icon: Smartphone,
    color: '#F59E0B',
    gradient: 'from-amber-600/20 to-orange-600/20',
  },
  {
    id: 'wave',
    name: 'Wave',
    desc: 'Paiement via Wave',
    icon: Smartphone,
    color: '#3B82F6',
    gradient: 'from-blue-600/20 to-cyan-600/20',
  },
  {
    id: 'card',
    name: 'Carte Bancaire',
    desc: 'Visa, Mastercard',
    icon: CreditCard,
    color: '#8B5CF6',
    gradient: 'from-violet-600/20 to-purple-600/20',
  }
];

export function PaymentScreen() {
  const { cart, user, navigate, goBack, loadMyPurchases, loadEvents } = useApp();
  const [method, setMethod] = useState('pawapay');
  const [countryCode, setCountryCode] = useState('+228');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [pendingValidation, setPendingValidation] = useState(false);
  const [popupOpen, setPopupOpen] = useState(false);

  if (!cart) return null;

  const total = Math.round(cart.price * cart.quantity * 1.05);
  const fee = total - cart.price * cart.quantity;

  const handlePay = async () => {
    if (!user) return;
    setLoading(true);
    setError('');

    try {
      if ((method === 'pawapay' || method === 'wave') && !phone) {
        throw new Error("Veuillez entrer votre numéro de téléphone (sans l'indicatif)");
      }

      // 1. Ouvrir le popup de manière SYNCHRONE avant l'appel API
      // Cela empêche les navigateurs (Chrome, Safari) de bloquer le popup
      const width = 500;
      const height = 700;
      const left = window.screen.width / 2 - width / 2;
      const top = window.screen.height / 2 - height / 2;
      
      const popup = window.open(
        "about:blank",
        "GeniusPayCheckout",
        `width=${width},height=${height},left=${left},top=${top}`
      );

      if (!popup) {
        throw new Error("Votre navigateur a bloqué la fenêtre de paiement. Veuillez autoriser les popups pour ce site.");
      }

      // Afficher un message d'attente dans le popup
      popup.document.write(`
        <div style="font-family: sans-serif; display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; background-color: #f9f9f9;">
          <h2>Connexion sécurisée en cours...</h2>
          <p>Veuillez patienter.</p>
        </div>
      `);

      setPopupOpen(true);
      const fullPhone = phone ? `${countryCode}${phone.replace(/^0+/, '')}` : undefined;

      const { data, error: functionError } = await supabase.functions.invoke('create-geniuspay-checkout', {
        body: {
          amount: total,
          description: `${cart.eventTitle} — ${cart.ticketTypeName} × ${cart.quantity}`,
          customerEmail: user.email,
          customerName: user.user_metadata?.full_name || '',
          paymentMethod: method,
          customerPhone: fullPhone
        }
      });

      if (functionError) {
        popup.close();
        throw new Error(functionError.message || "Erreur de communication avec le serveur de paiement");
      }

      if (data && data.error) {
        popup.close();
        throw new Error(data.message || "Erreur retournée par GeniusPay");
      }

      const checkoutUrl = data?.checkout_url || data?.payment_url;

      if (!checkoutUrl) {
        popup.close();
        throw new Error("L'API n'a pas retourné de lien de paiement.");
      }

      localStorage.setItem('pending_geniuspay_purchase', JSON.stringify({
        cart,
        method: 'GeniusPay'
      }));

      // 2. Rediriger le popup vers l'URL GeniusPay
      popup.location.href = checkoutUrl;

      // 3. Vérifier le statut du popup en continu
      const checkClosed = setInterval(() => {
        try {
          if (popup.closed) {
            clearInterval(checkClosed);
            setPopupOpen(false);
            setLoading(false);
            return;
          }
          
          const popupUrl = popup.location.href;
          
          if (popupUrl.includes('/payment-success')) {
            clearInterval(checkClosed);
            popup.close();
            setPopupOpen(false);
            setLoading(false);
            navigate('payment-success');
          } else if (popupUrl.includes('/payment-cancel')) {
            clearInterval(checkClosed);
            popup.close();
            setPopupOpen(false);
            setLoading(false);
            setError('Paiement annulé, échoué ou délai dépassé.');
          }
        } catch (e) {
          // Ignorer les erreurs "cross-origin" normales
        }
      }, 500);

    } catch (err: any) {
      setError(err.message || 'Erreur lors de la communication avec GeniusPay');
      setLoading(false);
      setPopupOpen(false);
    }
  };

  return (
    <div className="absolute inset-0 bg-[#06060F] flex flex-col overflow-hidden">
      <StatusBar />
      <div className="flex items-center px-5 pt-2 pb-4 gap-3">
        <button onClick={goBack} className="w-9 h-9 bg-white/10 rounded-full flex items-center justify-center">
          <ChevronLeft size={20} className="text-white" />
        </button>
        <h1 className="text-white font-bold text-lg">Paiement</h1>
      </div>

      <div className="flex-1 overflow-y-auto pb-28 px-5">
        <p className="text-gray-400 text-sm mb-5">Choisissez votre méthode de paiement</p>

        {/* Methods */}
        <div className="flex flex-col gap-3 mb-6">
          {PAYMENT_METHODS.map(m => {
            const Icon = m.icon;
            return (
              <button
                key={m.id}
                onClick={() => setMethod(m.id)}
                className={`flex items-center gap-4 p-4 rounded-2xl border-2 transition-all ${
                  method === m.id
                    ? 'bg-violet-600/10 border-violet-500'
                    : 'bg-[#13132A] border-transparent'
                }`}
              >
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center bg-gradient-to-br ${m.gradient}`}>
                  <Icon size={22} style={{ color: m.color }} />
                </div>
                <div className="flex-1 text-left">
                  <p className="text-white font-semibold text-sm">{m.name}</p>
                  <p className="text-gray-500 text-xs">{m.desc}</p>
                </div>
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${method === m.id ? 'border-violet-500' : 'border-gray-600'}`}>
                  {method === m.id && <div className="w-2.5 h-2.5 bg-violet-500 rounded-full" />}
                </div>
              </button>
            );
          })}
        </div>

        {(method === 'pawapay' || method === 'wave') && (
          <div className="mb-6 animate-fade-in">
            <label className="text-white text-sm font-semibold mb-2 block">Numéro de téléphone</label>
            <div className="flex gap-2">
              <select
                value={countryCode}
                onChange={(e) => setCountryCode(e.target.value)}
                className="bg-[#13132A] text-white p-4 rounded-xl border border-gray-800 focus:border-violet-500 outline-none w-28 transition-all"
              >
                <option value="+228">🇹🇬 +228</option>
                <option value="+225">🇨🇮 +225</option>
                <option value="+221">🇸🇳 +221</option>
                <option value="+229">🇧🇯 +229</option>
                <option value="+226">🇧🇫 +226</option>
                <option value="+223">🇲🇱 +223</option>
                <option value="+237">🇨🇲 +237</option>
              </select>
              <input
                type="tel"
                placeholder="XX XX XX XX"
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/[^0-9\s]/g, ''))}
                className="flex-1 bg-[#13132A] text-white p-4 rounded-xl border border-gray-800 focus:border-violet-500 outline-none transition-all"
              />
            </div>
            <p className="text-xs text-gray-500 mt-2">Saisissez votre numéro sans le 0 au début</p>
          </div>
        )}

        {/* Order summary */}
        <div className="bg-[#13132A] rounded-2xl p-4 mb-4">
          <h3 className="text-white font-bold mb-3">Résumé de la commande</h3>
          <div className="flex justify-between text-sm mb-2">
            <span className="text-gray-400">{cart.eventTitle}</span>
          </div>
          <div className="flex justify-between text-sm mb-2">
            <span className="text-gray-400">{cart.ticketTypeName} × {cart.quantity}</span>
            <span className="text-white">{formatPrice(cart.price * cart.quantity)}</span>
          </div>
          <div className="flex justify-between text-sm mb-2">
            <span className="text-gray-400">Frais de service (5%)</span>
            <span className="text-gray-400">{formatPrice(fee)}</span>
          </div>
          <div className="h-px bg-white/10 my-3" />
          <div className="flex justify-between">
            <span className="text-white font-bold">Total à payer</span>
            <span className="text-amber-400 font-black text-lg">{formatPrice(total)}</span>
          </div>
        </div>

        {/* GeniusPay badge */}
        <div className="flex items-center justify-center gap-2 px-4 py-3 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl mb-3">
          <Shield size={16} className="text-emerald-400 flex-shrink-0" />
          <span className="text-emerald-400 text-xs">Paiement 100% sécurisé via GeniusPay</span>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl">
            <p className="text-red-400 text-sm text-center">{error}</p>
          </div>
        )}
      </div>

      {/* Footer / Pay Button */}
      <div className="absolute bottom-0 left-0 right-0 p-5 bg-[#06060F]/80 backdrop-blur-xl border-t border-white/5">
        <button
          onClick={handlePay}
          disabled={loading || pendingValidation || popupOpen}
          className="w-full bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white font-bold py-4 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-opacity flex items-center justify-center gap-2"
        >
          {loading ? (
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : popupOpen ? (
            'Paiement en cours dans la fenêtre...'
          ) : (
            `Payer ${formatPrice(total)}`
          )}
        </button>
        <p className="text-center text-xs text-gray-500 mt-3 font-medium">Powered by GeniusPay</p>
      </div>
    </div>
  );
}
