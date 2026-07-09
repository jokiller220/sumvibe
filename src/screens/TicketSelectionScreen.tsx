import { useState } from 'react';
import { ChevronLeft, Minus, Plus } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { StatusBar } from '../components/StatusBar';
import { formatDate, formatPrice } from '../lib/utils';

export function TicketSelectionScreen() {
  const { events, params, navigate, goBack, setCart } = useApp();
  const event = events.find(e => e.id === params.eventId as string);
  const ticketTypes = event?.sv_ticket_types || [];

  const [selectedId, setSelectedId] = useState(ticketTypes[0]?.id || '');
  const [quantity, setQuantity] = useState(1);

  if (!event) return null;

  const selected = ticketTypes.find(t => t.id === selectedId);
  const total = selected ? selected.price * quantity : 0;

  const handleContinue = () => {
    if (!selected) return;
    setCart({
      ticketTypeId: selected.id,
      ticketTypeName: selected.name,
      price: selected.price,
      quantity,
      eventId: event.id,
      eventTitle: event.title,
    });
    navigate('payment', { eventId: event.id });
  };

  return (
    <div className="absolute inset-0 bg-[#06060F] flex flex-col overflow-hidden">
      <StatusBar />
      <div className="flex items-center px-5 pt-2 pb-4 gap-3">
        <button onClick={goBack} className="w-9 h-9 bg-white/10 rounded-full flex items-center justify-center">
          <ChevronLeft size={20} className="text-white" />
        </button>
        <h1 className="text-white font-bold text-lg flex-1">Choix du billet</h1>
      </div>

      <div className="flex-1 overflow-y-auto pb-28 px-5">
        {/* Event summary */}
        <div className="rounded-2xl overflow-hidden mb-6 relative h-32">
          <img src={event.image_url || ''} alt={event.title} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 to-transparent flex items-end p-4">
            <div>
              <h2 className="text-white font-bold text-base leading-tight">{event.title}</h2>
              <p className="text-gray-300 text-xs mt-0.5">{formatDate(event.date)}</p>
              <p className="text-gray-400 text-xs">{event.location}, {event.city}</p>
            </div>
          </div>
        </div>

        <p className="text-gray-400 text-sm mb-4">Choisissez votre type de billet</p>

        {/* Ticket types */}
        <div className="flex flex-col gap-3 mb-6">
          {ticketTypes.map(t => {
            const available = Math.max(0, t.capacity - (t.sold || 0));
            const isSoldOut = available <= 0;
            const isSelected = t.id === selectedId;
            return (
              <button
                key={t.id}
                onClick={() => {
                  if (!isSoldOut) {
                    setSelectedId(t.id);
                    setQuantity(1); // Reset quantity when changing ticket type
                  }
                }}
                disabled={isSoldOut}
                className={`w-full rounded-2xl p-4 border-2 text-left transition-all ${
                  isSoldOut
                    ? 'bg-gray-900/50 border-transparent opacity-50 cursor-not-allowed'
                    : isSelected
                      ? 'bg-violet-600/10 border-violet-500'
                      : 'bg-[#13132A] border-transparent'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-3">
                    <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${isSelected ? 'border-violet-500' : 'border-gray-600'}`}>
                      {isSelected && <div className="w-2 h-2 bg-violet-500 rounded-full" />}
                    </div>
                    <span className={`font-semibold text-sm ${isSelected ? 'text-white' : 'text-gray-300'}`}>{t.name}</span>
                  </div>
                  <span className="text-amber-400 font-bold text-sm">{formatPrice(t.price)}</span>
                </div>
                <div className="ml-7 text-gray-500 text-xs">
                  {available > 0 ? `${available} billets restants` : 'Épuisé'}
                </div>
              </button>
            );
          })}
        </div>

        {/* Quantity */}
        <div className="bg-[#13132A] rounded-2xl p-4 mb-6">
          <div className="flex items-center justify-between">
            <span className="text-white font-semibold text-sm">Quantité</span>
            <div className="flex items-center gap-4">
              <button
                onClick={() => setQuantity(q => Math.max(1, q - 1))}
                className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center active:bg-white/20"
              >
                <Minus size={14} className="text-white" />
              </button>
              <span className="text-white font-bold text-lg w-6 text-center">{quantity}</span>
              <button
                onClick={() => {
                  const maxAvailable = selected ? Math.max(0, selected.capacity - (selected.sold || 0)) : 10;
                  setQuantity(q => Math.min(Math.min(10, maxAvailable), q + 1));
                }}
                disabled={!selected || quantity >= (selected.capacity - (selected.sold || 0)) || quantity >= 10}
                className="w-8 h-8 bg-violet-600 rounded-full flex items-center justify-center disabled:opacity-50 disabled:bg-gray-600 active:bg-violet-500"
              >
                <Plus size={14} className="text-white" />
              </button>
            </div>
          </div>
        </div>

        {/* Total */}
        {selected && (
          <div className="bg-[#13132A] rounded-2xl p-4">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-gray-400">{selected.name} × {quantity}</span>
              <span className="text-white">{formatPrice(selected.price * quantity)}</span>
            </div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-400">Frais de service</span>
              <span className="text-gray-400">{formatPrice(Math.round(total * 0.05))}</span>
            </div>
            <div className="h-px bg-white/10 my-3" />
            <div className="flex justify-between">
              <span className="text-white font-bold">Total</span>
              <span className="text-amber-400 font-black text-lg">{formatPrice(Math.round(total * 1.05))}</span>
            </div>
          </div>
        )}
      </div>

      {/* CTA */}
      <div className="absolute bottom-0 left-0 right-0 bg-[#06060F] border-t border-white/10 px-5 py-4 pb-6">
        <button
          onClick={handleContinue}
          disabled={!selected}
          className="w-full py-4 bg-gradient-to-r from-violet-600 to-violet-500 text-white font-bold rounded-2xl disabled:opacity-40 transition-opacity"
        >
          Continuer — {formatPrice(Math.round(total * 1.05))}
        </button>
      </div>
    </div>
  );
}
