import { ChevronLeft, CheckCircle, Calendar, MapPin } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { StatusBar } from '../components/StatusBar';
import { formatShortDate, formatPrice } from '../lib/utils';

export function PublicProfileScreen() {
  const { events, params, goBack, navigate } = useApp();

  const organizerEvents = events.filter(e => e.organizer_id === params.organizerId as string);
  const organizer = organizerEvents[0]?.sv_organizers;

  return (
    <div className="absolute inset-0 bg-[#06060F] flex flex-col overflow-hidden">
      <StatusBar />
      <div className="flex items-center px-5 pt-2 pb-4 gap-3">
        <button onClick={goBack} className="w-9 h-9 bg-white/10 rounded-full flex items-center justify-center">
          <ChevronLeft size={20} className="text-white" />
        </button>
        <h1 className="text-white font-bold text-lg flex-1">Profil public</h1>
      </div>

      <div className="flex-1 overflow-y-auto pb-8">
        {/* Organizer header */}
        <div className="px-5 mb-6">
          <div className="bg-[#13132A] rounded-2xl p-5 flex items-center gap-4">
            <div className="w-16 h-16 bg-gradient-to-br from-violet-600 to-pink-600 rounded-2xl flex items-center justify-center text-white font-black text-2xl">
              {organizer?.name.charAt(0) || 'E'}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-white font-bold text-lg">{organizer?.name || 'Event Corp'}</span>
                {organizer?.verified && (
                  <CheckCircle size={16} fill="#7C3AED" stroke="white" strokeWidth={2} />
                )}
              </div>
              <p className="text-gray-400 text-xs">Organisation d&apos;événements</p>
              <p className="text-gray-500 text-xs mt-1">
                Lomé, Togo • Membre depuis{' '}
                {organizer?.member_since
                  ? new Date(organizer.member_since).getFullYear()
                  : '2024'}
              </p>
            </div>
          </div>
          <div className="bg-[#13132A] rounded-2xl p-4 mt-3 grid grid-cols-2 gap-3">
            <div className="text-center">
              <p className="text-white font-bold text-lg">{organizerEvents.length}</p>
              <p className="text-gray-500 text-xs">Événements organisés</p>
            </div>
            <div className="text-center">
              <p className="text-white font-bold text-lg">
                {organizerEvents.reduce((a, e) => a + (e.sv_ticket_types?.reduce((b, t) => b + t.sold, 0) || 0), 0)}
              </p>
              <p className="text-gray-500 text-xs">Billets vendus</p>
            </div>
          </div>
        </div>

        {/* Events */}
        <div className="px-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-white font-bold">Événements organisés</h3>
            <span className="text-gray-500 text-xs">Voir tout</span>
          </div>
          <div className="flex flex-col gap-3">
            {organizerEvents.map(event => {
              const minPrice = event.sv_ticket_types?.length
                ? Math.min(...event.sv_ticket_types.map(t => t.price))
                : 0;
              return (
                <button
                  key={event.id}
                  onClick={() => navigate('event-detail', { eventId: event.id })}
                  className="w-full bg-[#13132A] rounded-2xl overflow-hidden flex gap-3 p-3"
                >
                  <div className="w-16 h-16 rounded-xl overflow-hidden flex-shrink-0">
                    <img src={event.image_url || ''} alt={event.title} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0 text-left">
                    <h4 className="text-white font-semibold text-sm truncate">{event.title}</h4>
                    <div className="flex items-center gap-1">
                      <Calendar size={11} className="text-gray-500" />
                      <span className="text-gray-500 text-xs">{formatShortDate(event.date)}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <MapPin size={11} className="text-gray-500" />
                      <span className="text-gray-500 text-xs truncate">{event.location}</span>
                    </div>
                    <span className="text-amber-400 text-xs font-semibold">{formatPrice(minPrice)}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
