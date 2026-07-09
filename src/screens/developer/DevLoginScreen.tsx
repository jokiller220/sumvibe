import { useState, useEffect } from 'react';
import { Shield, ArrowRight } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { supabase } from '../../lib/supabase';
import { StatusBar } from '../../components/StatusBar';

export function DevLoginScreen() {
  const { navigate, user } = useApp();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // If user is already logged in, check if they are a developer
  useEffect(() => {
    if (user) {
      checkDeveloperStatus(user.id);
    }
  }, [user]);

  async function checkDeveloperStatus(userId: string) {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('sv_user_profiles')
        .select('is_developer')
        .eq('id', userId)
        .single();
        
      if (error) throw error;
      
      if (data && data.is_developer) {
        navigate('dev-dashboard');
      } else {
        setError("Accès refusé. Vous n'avez pas les droits de développeur.");
      }
    } catch (err: unknown) {
      console.error(err);
      setError("Erreur lors de la vérification des droits.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="absolute inset-0 bg-[#06060F] flex flex-col justify-center items-center px-6">
      <StatusBar />
      
      <div className="w-20 h-20 bg-red-600/20 border border-red-500 rounded-2xl flex items-center justify-center mb-8">
        <Shield size={40} className="text-red-500" />
      </div>
      
      <h1 className="text-2xl font-bold text-white mb-2 text-center">Super Admin</h1>
      <p className="text-gray-400 text-center mb-8 text-sm">
        Connectez-vous avec votre compte développeur pour accéder au panneau de contrôle.
      </p>

      {error && (
        <div className="bg-red-500/10 border border-red-500/50 p-4 rounded-xl mb-6 w-full max-w-sm">
          <p className="text-red-400 text-sm text-center">{error}</p>
        </div>
      )}

      {!user ? (
        <button 
          onClick={() => navigate('login')}
          className="w-full max-w-sm bg-red-600 hover:bg-red-700 text-white p-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-colors"
        >
          Se connecter
          <ArrowRight size={20} />
        </button>
      ) : (
        <button 
          onClick={() => checkDeveloperStatus(user.id)}
          disabled={loading}
          className="w-full max-w-sm bg-red-600 hover:bg-red-700 text-white p-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
        >
          {loading ? 'Vérification...' : 'Vérifier mes droits'}
        </button>
      )}
      
      <button 
        onClick={() => navigate('home')}
        className="mt-6 text-gray-500 hover:text-white transition-colors text-sm"
      >
        Retour à l'accueil
      </button>
    </div>
  );
}
