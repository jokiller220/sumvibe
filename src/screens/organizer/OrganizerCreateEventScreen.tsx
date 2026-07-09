import { useState } from 'react';
import { ChevronLeft, Plus, Trash2 } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { supabase } from '../../lib/supabase';
import { StatusBar } from '../../components/StatusBar';

const CATEGORIES = ['Concerts', 'Soirées', 'Festivals', 'Plage', 'Sport', 'Théâtres', 'Conférences', 'Autres'];

interface TicketTypeInput { name: string; price: string; capacity: string }

export function OrganizerCreateEventScreen() {
  const { organizer, navigate, goBack, loadEvents } = useApp();
  const [step, setStep] = useState<'info' | 'tickets' | 'recap'>('info');
  const [form, setForm] = useState({
    title: '', category: 'Concerts', location: '', city: 'Lomé',
    date: '', time: '', description: '', image_url: '',
    total_capacity: '500',
  });
  const [tickets, setTickets] = useState<TicketTypeInput[]>([
    { name: 'Entrée Standard', price: '3000', capacity: '1000' },
  ]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const setField = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }));

  const setTicket = (i: number, k: keyof TicketTypeInput) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setTickets(ts => ts.map((t, idx) => idx === i ? { ...t, [k]: e.target.value } : t));
  };

  const addTicket = () => setTickets(ts => [...ts, { name: '', price: '', capacity: '' }]);
  const removeTicket = (i: number) => setTickets(ts => ts.filter((_, idx) => idx !== i));

  const handlePublish = async () => {
    if (!organizer) return;
    if (!form.title || !form.location || !form.date) { setError('Remplissez tous les champs obligatoires'); return; }
    setLoading(true);
    setError('');

    const dateTime = form.time ? `${form.date}T${form.time}:00+00:00` : `${form.date}T20:00:00+00:00`;

    const { data: event, error: err } = await supabase.from('sv_events').insert({
      organizer_id: organizer.id,
      title: form.title,
      description: form.description || null,
      category: form.category,
      location: form.location,
      city: form.city,
      date: dateTime,
      image_url: form.image_url || 'https://images.pexels.com/photos/1190298/pexels-photo-1190298.jpeg',
      is_featured: false,
      is_published: true,
      total_capacity: parseInt(form.total_capacity) || 500,
    }).select().single();

    if (err || !event) { setError(err?.message || 'Erreur'); setLoading(false); return; }

    // Insert ticket types
    const validTickets = tickets.filter(t => t.name && t.price && t.capacity);
    if (validTickets.length > 0) {
      await supabase.from('sv_ticket_types').insert(
        validTickets.map(t => ({
          event_id: event.id,
          name: t.name,
          price: parseInt(t.price),
          capacity: parseInt(t.capacity),
          sold: 0,
        }))
      );
    }

    await loadEvents();
    setLoading(false);
    navigate('organizer-my-events');
  };

  const tabs = ['Informations', 'Billets', 'Récapitulatif'];
  const stepIdx = { info: 0, tickets: 1, recap: 2 }[step];

  return (
    <div className="absolute inset-0 bg-[#06060F] flex flex-col overflow-hidden">
      <StatusBar />
      <div className="flex items-center px-5 pt-2 pb-3 gap-3">
        <button onClick={goBack} className="w-9 h-9 bg-white/10 rounded-full flex items-center justify-center">
          <ChevronLeft size={20} className="text-white" />
        </button>
        <h1 className="text-white font-bold text-lg flex-1">Créer un événement</h1>
      </div>

      {/* Steps */}
      <div className="flex px-5 mb-4 gap-1">
        {tabs.map((tab, i) => (
          <div key={tab} className="flex-1 flex flex-col items-center gap-1">
            <div className={`h-1 w-full rounded-full transition-colors ${i <= stepIdx ? 'bg-violet-500' : 'bg-white/10'}`} />
            <span className={`text-xs ${i === stepIdx ? 'text-violet-400 font-semibold' : 'text-gray-600'}`}>{tab}</span>
          </div>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto pb-28 px-5">
        {step === 'info' && (
          <div className="flex flex-col gap-4">
            {[
              { label: "Nom de l'événement *", key: 'title', type: 'text', placeholder: 'Big Chill Beach Party' },
              { label: 'Lieu *', key: 'location', type: 'text', placeholder: 'Blue Turtle Beach' },
              { label: 'Ville', key: 'city', type: 'text', placeholder: 'Lomé' },
              { label: 'Date *', key: 'date', type: 'date', placeholder: '' },
              { label: 'Heure', key: 'time', type: 'time', placeholder: '' },
              { label: 'URL de l\'image', key: 'image_url', type: 'url', placeholder: 'https://...' },
            ].map(({ label, key, type, placeholder }) => (
              <div key={key}>
                <label className="text-xs text-gray-400 mb-1.5 block">{label}</label>
                <input
                  type={type}
                  value={form[key as keyof typeof form]}
                  onChange={setField(key as keyof typeof form)}
                  placeholder={placeholder}
                  className="w-full bg-[#13132A] border border-white/10 rounded-xl px-4 py-3.5 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-violet-500 transition-colors"
                />
              </div>
            ))}

            <div>
              <label className="text-xs text-gray-400 mb-1.5 block">Catégorie</label>
              <select
                value={form.category}
                onChange={setField('category')}
                className="w-full bg-[#13132A] border border-white/10 rounded-xl px-4 py-3.5 text-white text-sm focus:outline-none focus:border-violet-500"
              >
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            <div>
              <label className="text-xs text-gray-400 mb-1.5 block">Description</label>
              <textarea
                value={form.description}
                onChange={setField('description')}
                placeholder="Décrivez votre événement..."
                rows={3}
                className="w-full bg-[#13132A] border border-white/10 rounded-xl px-4 py-3.5 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-violet-500 resize-none transition-colors"
              />
            </div>
          </div>
        )}

        {step === 'tickets' && (
          <div className="flex flex-col gap-4">
            <p className="text-gray-400 text-sm">Ticket types</p>
            {tickets.map((ticket, i) => (
              <div key={i} className="bg-[#13132A] rounded-2xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-white font-semibold text-sm">Type {i + 1}</span>
                  {tickets.length > 1 && (
                    <button onClick={() => removeTicket(i)} className="text-red-400">
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
                <div className="flex flex-col gap-3">
                  <input
                    type="text"
                    value={ticket.name}
                    onChange={setTicket(i, 'name')}
                    placeholder="Nom (ex: Entrée Standard)"
                    className="w-full bg-[#06060F] border border-white/10 rounded-xl px-3 py-3 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-violet-500"
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="number"
                      value={ticket.price}
                      onChange={setTicket(i, 'price')}
                      placeholder="Prix (FCFA)"
                      className="w-full bg-[#06060F] border border-white/10 rounded-xl px-3 py-3 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-violet-500"
                    />
                    <input
                      type="number"
                      value={ticket.capacity}
                      onChange={setTicket(i, 'capacity')}
                      placeholder="Capacité"
                      className="w-full bg-[#06060F] border border-white/10 rounded-xl px-3 py-3 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-violet-500"
                    />
                  </div>
                </div>
              </div>
            ))}
            <button
              onClick={addTicket}
              className="flex items-center justify-center gap-2 py-3.5 border-2 border-dashed border-white/20 rounded-2xl text-violet-400 text-sm font-medium"
            >
              <Plus size={16} />
              Ajouter un type de billet
            </button>
            <div className="bg-[#13132A] rounded-2xl p-4">
              <p className="text-gray-400 text-xs mb-2">Total des places</p>
              <p className="text-white font-bold text-lg">
                {tickets.reduce((a, t) => a + (parseInt(t.capacity) || 0), 0).toLocaleString()}
              </p>
            </div>
          </div>
        )}

        {step === 'recap' && (
          <div className="flex flex-col gap-4">
            {form.image_url && (
              <div className="rounded-2xl overflow-hidden h-36">
                <img src={form.image_url} alt="preview" className="w-full h-full object-cover" />
              </div>
            )}
            <div className="bg-[#13132A] rounded-2xl p-4">
              <h3 className="text-white font-bold mb-3">{form.title}</h3>
              {[
                { label: 'Catégorie', value: form.category },
                { label: 'Lieu', value: `${form.location}, ${form.city}` },
                { label: 'Date', value: `${form.date} ${form.time}` },
              ].map(({ label, value }) => (
                <div key={label} className="flex justify-between py-2 border-b border-white/5">
                  <span className="text-gray-400 text-sm">{label}</span>
                  <span className="text-white text-sm font-medium">{value}</span>
                </div>
              ))}
            </div>
            <div className="bg-[#13132A] rounded-2xl p-4">
              <h4 className="text-white font-semibold mb-3">Billets</h4>
              {tickets.filter(t => t.name).map((t, i) => (
                <div key={i} className="flex justify-between py-2 border-b border-white/5">
                  <span className="text-gray-400 text-sm">{t.name}</span>
                  <span className="text-amber-400 text-sm font-semibold">{parseInt(t.price || '0').toLocaleString()} FCFA</span>
                </div>
              ))}
            </div>
            {error && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3 text-red-400 text-xs">{error}</div>
            )}
          </div>
        )}
      </div>

      <div className="absolute bottom-0 left-0 right-0 bg-[#06060F] border-t border-white/10 px-5 py-4 pb-6">
        <div className="flex gap-3">
          {step !== 'info' && (
            <button
              onClick={() => setStep(step === 'recap' ? 'tickets' : 'info')}
              className="flex-1 py-4 bg-[#13132A] border border-white/10 text-white font-semibold rounded-2xl"
            >
              Retour
            </button>
          )}
          <button
            onClick={() => {
              if (step === 'info') setStep('tickets');
              else if (step === 'tickets') setStep('recap');
              else handlePublish();
            }}
            disabled={loading}
            className="flex-1 py-4 bg-violet-600 text-white font-bold rounded-2xl disabled:opacity-60"
          >
            {step === 'recap' ? (loading ? 'Publication...' : 'Publier l\'événement') : 'Suivant'}
          </button>
        </div>
      </div>
    </div>
  );
}
