import { useState } from 'react';
import { ChevronLeft, CheckCircle, XCircle, QrCode } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { supabase } from '../../lib/supabase';
import { OrganizerBottomNav } from '../../components/BottomNav';
import { StatusBar } from '../../components/StatusBar';
import { formatPrice } from '../../lib/utils';

type ScanResult = 'idle' | 'valid' | 'invalid' | 'already_used';

export function OrganizerScannerScreen() {
  const { navigate } = useApp();
  const [qrInput, setQrInput] = useState('');
  const [result, setResult] = useState<ScanResult>('idle');
  const [purchaseData, setPurchaseData] = useState<{
    name?: string; ticketType?: string; amount?: number; eventTitle?: string;
  } | null>(null);
  const [loading, setLoading] = useState(false);

  const handleScan = async () => {
    if (!qrInput.trim()) return;
    setLoading(true);

    const { data } = await supabase
      .from('sv_purchases')
      .select('*, sv_events(*), sv_ticket_types(*)')
      .eq('qr_code', qrInput.trim())
      .maybeSingle();

    if (!data) {
      setResult('invalid');
      setPurchaseData(null);
      setLoading(false);
      return;
    }

    if (data.scanned_at) {
      setResult('already_used');
      setPurchaseData(null);
      setLoading(false);
      return;
    }

    // Mark as scanned
    await supabase.from('sv_purchases').update({ scanned_at: new Date().toISOString() }).eq('id', data.id);

    setResult('valid');
    setPurchaseData({
      eventTitle: data.sv_events?.title,
      ticketType: data.sv_ticket_types?.name,
      amount: data.total_amount,
    });
    setLoading(false);
  };

  const reset = () => {
    setResult('idle');
    setQrInput('');
    setPurchaseData(null);
  };

  if (result === 'valid' && purchaseData) {
    return (
      <div className="absolute inset-0 bg-[#06060F] flex flex-col items-center justify-center px-6">
        <StatusBar />
        <div className="flex flex-col items-center text-center">
          <div className="w-24 h-24 bg-green-500/20 rounded-full flex items-center justify-center mb-6">
            <CheckCircle size={48} className="text-green-400" fill="#22C55E" stroke="white" strokeWidth={1.5} />
          </div>
          <h2 className="text-white text-2xl font-black mb-1">Ticket validé ✓</h2>
          <p className="text-green-400 font-semibold mb-6">Entrée autorisée — Profitez de l&apos;événement !</p>

          <div className="w-full bg-[#13132A] rounded-2xl p-4 mb-6">
            {[
              { label: 'Événement', value: purchaseData.eventTitle || '—' },
              { label: 'Type', value: purchaseData.ticketType || '—' },
              { label: 'Montant', value: purchaseData.amount ? formatPrice(purchaseData.amount) : '—' },
            ].map(({ label, value }) => (
              <div key={label} className="flex justify-between py-2 border-b border-white/5 last:border-0">
                <span className="text-gray-400 text-sm">{label}</span>
                <span className="text-white text-sm font-semibold">{value}</span>
              </div>
            ))}
          </div>

          <button onClick={reset} className="w-full py-4 bg-violet-600 text-white font-bold rounded-2xl">
            Scanner un autre ticket
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="absolute inset-0 bg-[#06060F] flex flex-col overflow-hidden">
      <StatusBar />
      <div className="flex items-center px-5 pt-2 pb-4 gap-3">
        <button onClick={() => navigate('organizer-dashboard')} className="w-9 h-9 bg-white/10 rounded-full flex items-center justify-center">
          <ChevronLeft size={20} className="text-white" />
        </button>
        <h1 className="text-white font-bold text-lg flex-1">Scanner le ticket</h1>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-6 pb-24">
        {/* Camera frame simulation */}
        <div className="relative w-64 h-64 mb-8">
          <div className="absolute inset-0 rounded-3xl border-2 border-white/20 bg-black/30 flex items-center justify-center">
            <QrCode size={80} className="text-white/20" />
          </div>
          {/* Corner highlights */}
          {[['top-2 left-2', 'border-t-2 border-l-2'], ['top-2 right-2', 'border-t-2 border-r-2'], ['bottom-2 left-2', 'border-b-2 border-l-2'], ['bottom-2 right-2', 'border-b-2 border-r-2']].map(([pos, borders]) => (
            <div key={pos} className={`absolute ${pos} w-8 h-8 border-violet-400 rounded-sm ${borders}`} />
          ))}
          {/* Scan line */}
          <div className="absolute left-4 right-4 h-0.5 bg-violet-400/50 top-1/2 -translate-y-1/2" />
          <p className="absolute -bottom-8 left-0 right-0 text-center text-gray-400 text-sm">
            Placez le QR code dans le cadre
          </p>
        </div>

        {/* Manual input */}
        <div className="w-full">
          <p className="text-gray-400 text-xs mb-2 text-center">Ou entrez le code manuellement</p>
          <input
            type="text"
            value={qrInput}
            onChange={e => setQrInput(e.target.value)}
            placeholder="Code du ticket..."
            className="w-full bg-[#13132A] border border-white/10 rounded-xl px-4 py-3.5 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-violet-500 mb-3 transition-colors"
          />

          {result === 'invalid' && (
            <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 mb-3">
              <XCircle size={16} className="text-red-400" />
              <span className="text-red-400 text-sm">Ticket invalide ou introuvable</span>
            </div>
          )}
          {result === 'already_used' && (
            <div className="flex items-center gap-2 bg-yellow-500/10 border border-yellow-500/20 rounded-xl px-4 py-3 mb-3">
              <XCircle size={16} className="text-yellow-400" />
              <span className="text-yellow-400 text-sm">Ticket déjà utilisé</span>
            </div>
          )}

          <button
            onClick={handleScan}
            disabled={loading || !qrInput.trim()}
            className="w-full py-4 bg-violet-600 text-white font-bold rounded-2xl disabled:opacity-40"
          >
            {loading ? 'Vérification...' : 'Valider le ticket'}
          </button>
        </div>
      </div>

      <OrganizerBottomNav />
    </div>
  );
}
