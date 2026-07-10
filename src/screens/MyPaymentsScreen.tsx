import { ChevronLeft, CreditCard } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { StatusBar } from '../components/StatusBar';
import { formatPrice } from '../lib/utils';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

export function MyPaymentsScreen() {
  const { goBack, myPurchases } = useApp();

  // Sort purchases by date, newest first
  const sortedPurchases = [...myPurchases].sort((a, b) => 
    new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );

  return (
    <div className="absolute inset-0 bg-[#06060F] flex flex-col overflow-hidden">
      <StatusBar />
      <div className="flex items-center px-5 pt-2 pb-4 gap-3 border-b border-white/5">
        <button onClick={goBack} className="w-9 h-9 bg-white/10 rounded-full flex items-center justify-center">
          <ChevronLeft size={20} className="text-white" />
        </button>
        <h1 className="text-white font-bold text-lg flex-1">Mes paiements</h1>
      </div>

      <div className="flex-1 overflow-y-auto px-5 pt-4 pb-8">
        {sortedPurchases.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-center opacity-50">
            <CreditCard size={48} className="text-gray-600 mb-4" />
            <p className="text-gray-400 font-medium">Aucun paiement trouvé</p>
            <p className="text-gray-500 text-sm mt-1">Vos transactions apparaîtront ici.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {sortedPurchases.map((purchase) => {
              const event = purchase.sv_events;
              return (
                <div key={purchase.id} className="bg-[#13132A] rounded-2xl p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="text-white font-bold truncate pr-4">{event?.title || 'Événement inconnu'}</h3>
                      <p className="text-gray-400 text-xs mt-0.5 capitalize">
                        {format(new Date(purchase.created_at), 'EEEE d MMMM yyyy • HH:mm', { locale: fr })}
                      </p>
                    </div>
                    <span className="text-green-400 font-bold whitespace-nowrap bg-green-500/10 px-2 py-1 rounded-lg text-sm">
                      {formatPrice(purchase.total_amount)}
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center border-t border-white/5 pt-3 mt-3">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-violet-500"></span>
                      <span className="text-gray-300 text-xs font-medium uppercase tracking-wider">{purchase.payment_method || 'Mobile Money'}</span>
                    </div>
                    <span className="text-violet-400 text-xs font-semibold bg-violet-500/10 px-2 py-1 rounded-md">
                      Complété
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
