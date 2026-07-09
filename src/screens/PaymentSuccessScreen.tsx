import { CheckCircle, Download, Share2 } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { StatusBar } from '../components/StatusBar';
import { formatPrice } from '../lib/utils';

export function PaymentSuccessScreen() {
  const { cart, myPurchases, navigate } = useApp();
  const latestPurchase = myPurchases[0];

  return (
    <div className="absolute inset-0 bg-[#06060F] flex flex-col overflow-hidden">
      <StatusBar />

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
              <QRCodePlaceholder value={latestPurchase.qr_code} />
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
