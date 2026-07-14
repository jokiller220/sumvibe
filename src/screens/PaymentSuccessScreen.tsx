import { useEffect, useState } from 'react';
import { CheckCircle, Download, Share2 } from 'lucide-react';
import QRCodeSVG from 'react-qr-code';
import { useApp } from '../context/AppContext';
import { supabase } from '../lib/supabase';
import { StatusBar } from '../components/StatusBar';
import { formatPrice } from '../lib/utils';

export function PaymentSuccessScreen() {
  const { cart, myPurchases, user, navigate, loadMyPurchases, loadEvents } = useApp();
  const [processing, setProcessing] = useState(true);
  const [error, setError] = useState('');
  
  useEffect(() => {
    // Si la page s'ouvre dans un popup (le widget GeniusPay)
    if (window.opener && window.opener !== window) {
      window.opener.postMessage('geniuspay_success', '*');
      window.close();
      return;
    }

    async function processPendingPurchase() {
      const pendingData = localStorage.getItem('pending_geniuspay_purchase');
      if (!pendingData) {
        setProcessing(false);
        return;
      }
      
      try {
        const { cart: pendingCart, method } = JSON.parse(pendingData);
        if (!user || !pendingCart) {
          throw new Error("Utilisateur ou panier invalide.");
        }

        const total = Math.round(pendingCart.price * pendingCart.quantity * 1.05);

        const { error: err } = await supabase.from('sv_purchases').insert({
          user_id: user.id,
          event_id: pendingCart.eventId,
          ticket_type_id: pendingCart.ticketTypeId,
          quantity: pendingCart.quantity,
          total_amount: total,
          payment_method: method,
          status: 'active',
        });
        
        if (err) throw err;
        
        // Nettoyer le localStorage
        localStorage.removeItem('pending_geniuspay_purchase');
        
        // Recharger les données
        await loadMyPurchases();
        await loadEvents();
        
      } catch (err: any) {
        console.error(err);
        setError("Erreur lors de l'enregistrement du billet. Veuillez contacter le support avec votre preuve de paiement.");
      } finally {
        setProcessing(false);
      }
    }

    processPendingPurchase();
  }, [user, loadMyPurchases, loadEvents]);

  const latestPurchase = myPurchases[0];

  return (
    <div className="absolute inset-0 bg-[#06060F] flex flex-col overflow-hidden">
      <StatusBar />

      {processing ? (
        <div className="flex-1 flex flex-col items-center justify-center px-6 text-center">
          <div className="w-12 h-12 border-4 border-violet-500 border-t-transparent rounded-full animate-spin mb-4" />
          <h2 className="text-white font-bold">Validation du paiement...</h2>
          <p className="text-gray-400 text-sm mt-2">Veuillez patienter quelques instants.</p>
        </div>
      ) : error ? (
        <div className="flex-1 flex flex-col items-center justify-center px-6 text-center">
          <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mb-4">
            <span className="text-red-500 text-2xl">⚠️</span>
          </div>
          <h2 className="text-white font-bold text-xl mb-2">Erreur</h2>
          <p className="text-red-400 text-sm">{error}</p>
          <button 
            onClick={() => navigate('home')}
            className="mt-8 py-3 px-6 bg-[#13132A] text-white rounded-xl"
          >
            Retour à l'accueil
          </button>
        </div>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center px-6 text-center">
        {/* Success icon */}
        <div className="relative mb-6">
          <div className="w-24 h-24 bg-green-500/20 rounded-full flex items-center justify-center">
            <div className="w-16 h-16 bg-green-500/30 rounded-full flex items-center justify-center">
              <CheckCircle size={40} className="text-green-400" fill="#22C55E" stroke="white" strokeWidth={1.5} />
            </div>
          </div>
          {/* Sparkles */}
          <div className="absolute -top-1 -right-1 w-4 h-4 bg-amber-400 rounded-full opacity-80 animate-ping" />
          <div className="absolute -bottom-1 -left-2 w-3 h-3 bg-violet-400 rounded-full opacity-60" />
        </div>

        <h1 className="text-white text-2xl font-black mb-2">Paiement réussi ! 🎉</h1>
        <p className="text-gray-400 text-sm mb-2">Votre billet a été confirmé</p>

        {/* Ticket preview */}
        {latestPurchase && (
          <div className="w-full bg-[#13132A] rounded-3xl overflow-hidden mb-6 mt-4">
            {/* QR placeholder */}
            <div className="bg-white m-4 rounded-2xl p-4 flex items-center justify-center">
              <QRCodeSVG value={latestPurchase.qr_code} size={160} bgColor="#ffffff" fgColor="#1a0030" />
            </div>

            <div className="px-5 pb-5 text-center">
              <p className="text-white font-bold text-base mb-1">
                {cart?.eventTitle || latestPurchase.sv_events?.title || 'Événement'}
              </p>
              <div className="grid grid-cols-2 gap-2 mt-3 text-xs">
                <div className="text-left">
                  <p className="text-gray-500">Ticket ID</p>
                  <p className="text-gray-300 font-mono truncate">{latestPurchase.qr_code.slice(0, 16)}</p>
                </div>
                <div className="text-left">
                  <p className="text-gray-500">Type</p>
                  <p className="text-gray-300">{cart?.ticketTypeName}</p>
                </div>
                <div className="text-left">
                  <p className="text-gray-500">Quantité</p>
                  <p className="text-gray-300">{latestPurchase.quantity}</p>
                </div>
                <div className="text-left">
                  <p className="text-gray-500">Total payé</p>
                  <p className="text-amber-400 font-semibold">{formatPrice(latestPurchase.total_amount)}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="flex gap-3 w-full">
          <button
            onClick={() => navigate('my-tickets')}
            className="flex-1 py-3.5 bg-violet-600 text-white font-semibold rounded-2xl flex items-center justify-center gap-2"
          >
            <Download size={16} />
            Mes tickets
          </button>
          <button
            onClick={() => navigate('share-event', { eventId: cart?.eventId })}
            className="flex-1 py-3.5 bg-[#13132A] border border-white/10 text-white font-semibold rounded-2xl flex items-center justify-center gap-2"
          >
            <Share2 size={16} />
            Partager
          </button>
        </div>
        </div>
      )}
    </div>
  );
}

function QRCodePlaceholder({ value }: { value: string }) {
  const size = 140;
  const cells = 21;
  const cellSize = size / cells;

  const pattern = Array.from({ length: cells }, (_, r) =>
    Array.from({ length: cells }, (_, c) => {
      // Corner squares
      if ((r < 7 && c < 7) || (r < 7 && c >= cells - 7) || (r >= cells - 7 && c < 7)) {
        const inner = (r >= 2 && r <= 4 && c >= 2 && c <= 4) ||
          (r >= 2 && r <= 4 && c >= cells - 5 && c <= cells - 3) ||
          (r >= cells - 5 && r <= cells - 3 && c >= 2 && c <= 4);
        const border = (r === 0 || r === 6 || c === 0 || c === 6) ||
          (r === 0 || r === 6 || c === cells - 7 || c === cells - 1) ||
          (r === cells - 7 || r === cells - 1 || c === 0 || c === 6);
        return inner || border;
      }
      // Data pattern based on value hash
      const hash = (value.charCodeAt(r % value.length) + value.charCodeAt(c % value.length) + r * c) % 3;
      return hash === 0;
    })
  );

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {pattern.map((row, r) =>
        row.map((filled, c) =>
          filled ? (
            <rect
              key={`${r}-${c}`}
              x={c * cellSize}
              y={r * cellSize}
              width={cellSize}
              height={cellSize}
              fill="#000"
            />
          ) : null
        )
      )}
    </svg>
  );
}
