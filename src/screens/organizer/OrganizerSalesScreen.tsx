import { useEffect, useState } from 'react';
import { ChevronLeft } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { supabase } from '../../lib/supabase';
import { StatusBar } from '../../components/StatusBar';
import { formatPrice } from '../../lib/utils';

interface SaleRecord { id: string; ticket_type: string; amount: number; payment_method: string; created_at: string }

export function OrganizerSalesScreen() {
  const { organizer, goBack } = useApp();
  const [sales, setSales] = useState<SaleRecord[]>([]);
  const [totals, setTotals] = useState({ entrée: 0, vip: 0, vvip: 0, total: 0, tickets: 0 });

  useEffect(() => {
    if (!organizer) return;
    supabase
      .from('sv_purchases')
      .select('*, sv_ticket_types(name, price), sv_events!inner(organizer_id)')
      .eq('sv_events.organizer_id', organizer.id)
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        if (!data) return;
        setSales(data.map(p => ({
          id: p.id,
          ticket_type: p.sv_ticket_types?.name || '—',
          amount: p.total_amount,
          payment_method: p.payment_method,
          created_at: p.created_at,
        })));
        const total = data.reduce((a, p) => a + p.total_amount, 0);
        setTotals({
          entrée: data.filter(p => p.sv_ticket_types?.name === 'Entrée Standard').reduce((a, p) => a + p.total_amount, 0),
          vip: data.filter(p => p.sv_ticket_types?.name === 'VIP').reduce((a, p) => a + p.total_amount, 0),
          vvip: data.filter(p => p.sv_ticket_types?.name === 'VVIP').reduce((a, p) => a + p.total_amount, 0),
          total,
          tickets: data.reduce((a, p) => a + p.quantity, 0),
        });
      });
  }, [organizer]);

  return (
    <div className="absolute inset-0 bg-[#06060F] flex flex-col overflow-hidden">
      <StatusBar />
      <div className="flex items-center px-5 pt-2 pb-4 gap-3">
        <button onClick={goBack} className="w-9 h-9 bg-white/10 rounded-full flex items-center justify-center">
          <ChevronLeft size={20} className="text-white" />
        </button>
        <h1 className="text-white font-bold text-lg flex-1">Ventes</h1>
      </div>

      <div className="flex-1 overflow-y-auto pb-8 px-5">
        {/* Bar chart mock */}
        <div className="bg-[#13132A] rounded-2xl p-4 mb-4">
          <h3 className="text-white font-semibold text-sm mb-3">Ventes des 7 derniers jours</h3>
          <div className="flex items-end gap-2 h-24">
            {[30, 80, 50, 90, 70, 85, 60].map((h, i) => (
              <div key={i} className="flex-1 flex flex-col justify-end">
                <div className="rounded-t bg-gradient-to-t from-violet-700 to-violet-400" style={{ height: `${h}%` }} />
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-2">
            {['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'].map(d => (
              <span key={d} className="flex-1 text-center text-gray-600 text-xs">{d}</span>
            ))}
          </div>
        </div>

        {/* Summary */}
        <div className="bg-[#13132A] rounded-2xl p-4 mb-4">
          <h3 className="text-white font-semibold text-sm mb-3">Résumé</h3>
          {[
            { label: 'Billets vendus', value: totals.tickets.toString() },
            { label: 'Revenus', value: formatPrice(totals.total) },
          ].map(({ label, value }) => (
            <div key={label} className="flex justify-between py-2 border-b border-white/5 last:border-0">
              <span className="text-gray-400 text-sm">{label}</span>
              <span className="text-white font-semibold text-sm">{value}</span>
            </div>
          ))}
        </div>

        {/* Sales list */}
        <h3 className="text-white font-semibold text-sm mb-3">Détails des ventes</h3>
        {sales.length === 0 ? (
          <p className="text-gray-500 text-sm text-center py-8">Aucune vente pour l&apos;instant</p>
        ) : (
          <div className="flex flex-col gap-2">
            {sales.map(sale => (
              <div key={sale.id} className="bg-[#13132A] rounded-2xl p-3 flex items-center justify-between">
                <div>
                  <p className="text-white text-sm font-medium">{sale.ticket_type}</p>
                  <p className="text-gray-500 text-xs">
                    {new Date(sale.created_at).toLocaleDateString('fr-FR')} • {sale.payment_method}
                  </p>
                </div>
                <span className="text-amber-400 font-semibold text-sm">{formatPrice(sale.amount)}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
