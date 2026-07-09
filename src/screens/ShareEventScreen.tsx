import { ChevronLeft, Copy, Check } from 'lucide-react';
import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { StatusBar } from '../components/StatusBar';

const SHARE_PLATFORMS = [
  { name: 'WhatsApp', color: '#25D366', emoji: '💬' },
  { name: 'Facebook', color: '#1877F2', emoji: '👤' },
  { name: 'Instagram', color: '#E1306C', emoji: '📸' },
  { name: 'Twitter', color: '#1DA1F2', emoji: '🐦' },
];

export function ShareEventScreen() {
  const { events, params, goBack } = useApp();
  const [copied, setCopied] = useState(false);
  const event = events.find(e => e.id === params.eventId as string);

  const link = `https://sumvibe.tg/event/${event?.id || ''}`;

  const copyLink = () => {
    navigator.clipboard.writeText(link).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="absolute inset-0 bg-[#06060F] flex flex-col overflow-hidden">
      <StatusBar />
      <div className="flex items-center px-5 pt-2 pb-4 gap-3">
        <button onClick={goBack} className="w-9 h-9 bg-white/10 rounded-full flex items-center justify-center">
          <ChevronLeft size={20} className="text-white" />
        </button>
        <h1 className="text-white font-bold text-lg flex-1">Partager l&apos;événement</h1>
      </div>

      <div className="flex-1 px-5 pb-8">
        {event && (
          <div className="relative rounded-2xl overflow-hidden h-40 mb-6">
            <img src={event.image_url || ''} alt={event.title} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/70 flex items-end p-4">
              <div>
                <h2 className="text-white font-bold">{event.title}</h2>
                <p className="text-gray-300 text-sm">{event.location}, {event.city}</p>
              </div>
            </div>
          </div>
        )}

        <h3 className="text-white font-bold text-sm mb-4">Partager via</h3>
        <div className="grid grid-cols-4 gap-3 mb-6">
          {SHARE_PLATFORMS.map(p => (
            <button key={p.name} className="flex flex-col items-center gap-2">
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl"
                style={{ backgroundColor: p.color + '20', border: `1px solid ${p.color}40` }}
              >
                {p.emoji}
              </div>
              <span className="text-gray-400 text-xs">{p.name}</span>
            </button>
          ))}
        </div>

        <h3 className="text-white font-bold text-sm mb-3">Copier le lien</h3>
        <div className="bg-[#13132A] rounded-2xl p-4 flex items-center justify-between gap-3">
          <span className="text-gray-400 text-xs flex-1 truncate">{link}</span>
          <button
            onClick={copyLink}
            className={`flex-shrink-0 flex items-center gap-1.5 text-xs font-semibold ${copied ? 'text-green-400' : 'text-violet-400'}`}
          >
            {copied ? <Check size={14} /> : <Copy size={14} />}
            {copied ? 'Copié!' : 'Copier'}
          </button>
        </div>
      </div>
    </div>
  );
}
