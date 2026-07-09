import { ChevronLeft, Share2, Calendar, MapPin, Clock, Wallet } from 'lucide-react';
import QRCodeSVG from 'react-qr-code';
import { useApp } from '../context/AppContext';
import { StatusBar } from '../components/StatusBar';
import { formatDate, formatTime, formatPrice } from '../lib/utils';

export function TicketDetailScreen() {
  const { myPurchases, params, goBack, navigate } = useApp();
  const purchase = myPurchases.find(p => p.id === params.purchaseId as string);

  if (!purchase) return (
    <div className="absolute inset-0 bg-[#06060F] flex items-center justify-center">
      <span className="text-gray-400">Ticket introuvable</span>
    </div>
  );

  const event = purchase.sv_events;
  const ticketType = purchase.sv_ticket_types;

  return (
    <div className="absolute inset-0 bg-[#06060F] flex flex-col overflow-hidden">
      <StatusBar />
      <div className="flex items-center justify-between px-5 pt-2 pb-4">
        <button onClick={goBack} className="w-9 h-9 bg-white/10 rounded-full flex items-center justify-center">
          <ChevronLeft size={20} className="text-white" />
        </button>
        <h1 className="text-white font-bold text-lg">Mon Ticket</h1>
        <button
          onClick={() => navigate('share-event', { eventId: event?.id })}
          className="w-9 h-9 bg-white/10 rounded-full flex items-center justify-center"
        >
          <Share2 size={16} className="text-white" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto pb-24 px-5">
        {/* Ticket card */}
        <div className="bg-gradient-to-b from-violet-900/40 to-[#13132A] rounded-3xl overflow-hidden">
          {/* Event header */}
          {event && (
            <div className="relative h-40">
              <img src={event.image_url || ''} alt={event.title} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#13132A]" />
              <div className="absolute bottom-0 left-0 right-0 p-4">
                <h2 className="text-white font-black text-lg leading-tight">{event.title}</h2>
                <p className="text-gray-300 text-sm">{event.sv_organizers?.name}</p>
              </div>
            </div>
          )}

          {/* QR Code */}
          <div className="flex flex-col items-center py-6 px-4">
            <div className="bg-white rounded-2xl p-4 mb-4">
              <QRCodeSVG value={purchase.qr_code} size={200} bgColor="#ffffff" fgColor="#1a0030" />
            </div>
            <p className="text-gray-500 text-xs font-mono tracking-wider">{purchase.qr_code.slice(0, 20).toUpperCase()}</p>
          </div>

          {/* Dashed separator */}
          <div className="flex items-center px-4 -my-2">
            <div className="w-5 h-5 -ml-8 bg-[#06060F] rounded-full" />
            <div className="flex-1 border-t-2 border-dashed border-white/10" />
            <div className="w-5 h-5 -mr-8 bg-[#06060F] rounded-full" />
          </div>

          {/* Details */}
          <div className="px-5 py-6">
            {event && (
              <div className="grid grid-cols-2 gap-4">
                {[
                  { icon: Calendar, label: 'Date', value: formatDate(event.date), color: 'text-violet-400' },
                  { icon: Clock, label: 'Heure', value: formatTime(event.date), color: 'text-pink-400' },
                  { icon: MapPin, label: 'Lieu', value: `${event.location}, ${event.city}`, color: 'text-amber-400' },
                  { icon: Wallet, label: 'Payé via', value: purchase.payment_method, color: 'text-green-400' },
                ].map(({ label, value, color }) => (
                  <div key={label}>
                    <div className={`${color} text-xs font-medium mb-0.5`}>{label}</div>
                    <div className="text-white text-xs font-semibold">{value}</div>
                  </div>
                ))}
              </div>
            )}

            <div className="h-px bg-white/10 my-4" />

            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-xs">Type de billet</p>
                <p className="text-white font-semibold text-sm">{ticketType?.name || 'Standard'}</p>
              </div>
              <div className="text-right">
                <p className="text-gray-500 text-xs">Montant payé</p>
                <p className="text-amber-400 font-black text-base">{formatPrice(purchase.total_amount)}</p>
              </div>
            </div>

            <div className="mt-4 flex items-center justify-between bg-[#06060F] rounded-xl p-3">
              <span className="text-gray-400 text-xs">Statut</span>
              <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                purchase.status === 'active'
                  ? 'bg-green-500/20 text-green-400'
                  : 'bg-gray-500/20 text-gray-400'
              }`}>
                {purchase.status === 'active' ? '✓ Valide' : 'Utilisé'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom actions */}
      <div className="absolute bottom-0 left-0 right-0 bg-[#06060F] border-t border-white/10 px-5 py-4 pb-6 flex gap-3">
        <button
          onClick={() => navigate('share-event', { eventId: event?.id })}
          className="flex-1 py-3.5 bg-[#13132A] border border-white/10 text-white font-semibold rounded-2xl flex items-center justify-center gap-2"
        >
          <Share2 size={16} />
          Partager
        </button>
        <button
          onClick={goBack}
          className="flex-1 py-3.5 bg-violet-600 text-white font-semibold rounded-2xl"
        >
          Scanner à l&apos;entrée
        </button>
      </div>
    </div>
  );
}
