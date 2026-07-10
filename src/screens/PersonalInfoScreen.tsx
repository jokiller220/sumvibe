import { ChevronLeft, User, Mail, Phone, Camera, Save } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { StatusBar } from '../components/StatusBar';
import { useState } from 'react';
import { supabase } from '../lib/supabase';

export function PersonalInfoScreen() {
  const { goBack, user, profile, loadProfile } = useApp();
  
  const [fullName, setFullName] = useState(profile?.full_name || user?.user_metadata?.full_name || '');
  const [phone, setPhone] = useState(profile?.phone || '');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });

  const handleSave = async () => {
    if (!user) return;
    setLoading(true);
    setMessage({ text: '', type: '' });

    try {
      const { error } = await supabase
        .from('sv_user_profiles')
        .update({
          full_name: fullName,
          phone: phone,
        })
        .eq('id', user.id);

      if (error) throw error;

      await loadProfile(user.id);
      setMessage({ text: 'Informations mises à jour avec succès.', type: 'success' });
    } catch (err: any) {
      setMessage({ text: err.message || 'Une erreur est survenue.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const name = profile?.full_name || user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Utilisateur';
  const initials = name.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase();

  return (
    <div className="absolute inset-0 bg-[#06060F] flex flex-col overflow-hidden">
      <StatusBar />
      <div className="flex items-center px-5 pt-2 pb-4 gap-3 border-b border-white/5">
        <button onClick={goBack} className="w-9 h-9 bg-white/10 rounded-full flex items-center justify-center">
          <ChevronLeft size={20} className="text-white" />
        </button>
        <h1 className="text-white font-bold text-lg flex-1">Infos personnelles</h1>
      </div>

      <div className="flex-1 overflow-y-auto px-5 pt-6 pb-8">
        {/* Avatar Section */}
        <div className="flex flex-col items-center mb-8">
          <div className="relative">
            <div className="w-24 h-24 bg-gradient-to-br from-violet-600 to-pink-600 rounded-full flex items-center justify-center text-white font-black text-3xl shadow-lg">
              {initials}
            </div>
            <button className="absolute bottom-0 right-0 w-8 h-8 bg-[#13132A] border border-white/10 rounded-full flex items-center justify-center shadow-lg">
              <Camera size={14} className="text-violet-400" />
            </button>
          </div>
          <p className="text-gray-400 text-xs mt-3">Appuyez pour modifier la photo</p>
        </div>

        {/* Form Section */}
        <div className="space-y-4">
          <div>
            <label className="text-gray-400 text-xs font-medium ml-1 mb-1 block">Nom complet</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <User size={18} className="text-gray-500" />
              </div>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full bg-[#13132A] border border-white/5 text-white rounded-2xl py-3.5 pl-11 pr-4 focus:outline-none focus:border-violet-500 transition-colors"
                placeholder="Votre nom"
              />
            </div>
          </div>

          <div>
            <label className="text-gray-400 text-xs font-medium ml-1 mb-1 block">Adresse e-mail</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Mail size={18} className="text-gray-500" />
              </div>
              <input
                type="email"
                value={user?.email || ''}
                disabled
                className="w-full bg-[#13132A]/50 border border-white/5 text-gray-500 rounded-2xl py-3.5 pl-11 pr-4 focus:outline-none cursor-not-allowed"
              />
            </div>
            <p className="text-gray-500 text-[10px] mt-1 ml-1">L'e-mail ne peut pas être modifié.</p>
          </div>

          <div>
            <label className="text-gray-400 text-xs font-medium ml-1 mb-1 block">Numéro de téléphone</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Phone size={18} className="text-gray-500" />
              </div>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full bg-[#13132A] border border-white/5 text-white rounded-2xl py-3.5 pl-11 pr-4 focus:outline-none focus:border-violet-500 transition-colors"
                placeholder="Votre numéro"
              />
            </div>
          </div>
        </div>

        {message.text && (
          <div className={`mt-6 p-3 rounded-xl text-sm font-medium text-center ${
            message.type === 'success' ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'
          }`}>
            {message.text}
          </div>
        )}
      </div>

      {/* Save Button */}
      <div className="p-5 border-t border-white/5 bg-[#06060F]">
        <button
          onClick={handleSave}
          disabled={loading}
          className="w-full py-4 bg-gradient-to-r from-violet-600 to-violet-500 text-white font-bold rounded-2xl flex items-center justify-center gap-2 active:opacity-90 disabled:opacity-50"
        >
          {loading ? (
            <span className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
          ) : (
            <>
              <Save size={18} />
              Enregistrer les modifications
            </>
          )}
        </button>
      </div>
    </div>
  );
}
