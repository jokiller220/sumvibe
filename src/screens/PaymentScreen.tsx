import { useState } from 'react';
import { ChevronLeft, Shield } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { supabase } from '../lib/supabase';
import { StatusBar } from '../components/StatusBar';
import { formatPrice } from '../lib/utils';

const PAYMENT_METHODS = [
  {
    id: 'Flooz',
    name: 'Flooz',
    desc: 'Payez avec Flooz',
    color: '#FF6B35',
    logo: '🟠',
  },
  {
    id: 'T-Money',
    name: 'T-Money',
    desc: 'Payez avec T-Money',
    color: '#E31E24',
    logo: '🔴',
  },
  {
    id: 'Wave',
    name: 'Wave',
    desc: 'Payez avec Wave',
    color: '#1DC9F4',
    logo: '🔵',
  },
];

export function PaymentScreen() {
  const { cart, user, navigate, goBack, loadMyPurchases } = useApp();
  const [method, setMethod] = useState('Flooz');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!cart) return null;

  const total = Math.round(cart.price * cart.quantity * 1.05);
  const fee = total - cart.price * cart.quantity;

  const handlePay = async () => {
    if (!user) return;
    setLoading(true);
    setError('');
    const { error: err } = await supabase.from('sv_purchases').insert({
      user_id: user.id,
      event_id: cart.eventId,
      ticket_type_id: cart.ticketTypeId,
      quantity: cart.quantity,
      total_amount: total,
      payment_method: method,
      status: 'active',
    });
    if (err) {
      setError('Paiement échoué. Réessayez.');
      setLoading(false);
      return;
    }
    // Update sold count
    supabase.rpc('increment_ticket_sold', {
      p_ticket_type_id: cart.ticketTypeId,
      p_quantity: cart.quantity
    }).then(() => {});
    await loadMyPurchases();
    setLoading(false);
    navigate('payment-success');
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
          {PAYMENT_METHODS.map(m => (
            <button
              key={m.id}
              onClick={() => setMethod(m.id)}
              className={`flex items-center gap-4 p-4 rounded-2xl border-2 transition-all ${
                method === m.id
                  ? 'bg-violet-600/10 border-violet-500'
                  : 'bg-[#13132A] border-transparent'
              }`}
            >
              <div
                className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl"
                style={{ background: m.color + '20' }}
              >
                {m.logo}
              </div>
              <div className="flex-1 text-left">
                <p className="text-white font-semibold text-sm">{m.name}</p>
                <p className="text-gray-500 text-xs">{m.desc}</p>
              </div>
              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${method === m.id ? 'border-violet-500' : 'border-gray-600'}`}>
                {method === m.id && <div className="w-2.5 h-2.5 bg-violet-500 rounded-full" />}
              </div>
            </button>
          ))}
        </div>

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

        {/* Security note */}
        <div className="flex items-center gap-2 px-4 py-3 bg-green-500/10 border border-green-500/20 rounded-2xl">
          <Shield size={16} className="text-green-400 flex-shrink-0" />
          <span className="text-green-400 text-xs">Paiement 100% sécurisé</span>
        </div>

        {error && (
          <div className="mt-3 bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3 text-red-400 text-xs">
            {error}
          </div>
        )}
      </div>

      {/* CTA */}
      <div className="absolute bottom-0 left-0 right-0 bg-[#06060F] border-t border-white/10 px-5 py-4 pb-6">
        <button
          onClick={handlePay}
          disabled={loading}
          className="w-full py-4 bg-gradient-to-r from-violet-600 to-pink-600 text-white font-bold rounded-2xl text-base disabled:opacity-60 transition-opacity"
        >
          {loading ? 'Traitement...' : `Payer ${formatPrice(total)}`}
        </button>
      </div>
    </div>
  );
}
