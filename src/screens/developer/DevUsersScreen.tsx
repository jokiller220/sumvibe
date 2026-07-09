import { useState, useEffect } from 'react';
import { ArrowLeft, User, Search, Trash2 } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { supabase } from '../../lib/supabase';
import { StatusBar } from '../../components/StatusBar';

interface UserProfile {
  id: string;
  full_name: string | null;
  phone: string | null;
  is_organizer: boolean;
  is_developer: boolean;
  created_at: string;
}

export function DevUsersScreen() {
  const { navigate, user } = useApp();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (!user) {
      navigate('dev-login');
      return;
    }
    fetchUsers();
  }, [user]);

  async function fetchUsers() {
    try {
      const { data, error } = await supabase
        .from('sv_user_profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setUsers(data || []);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  }

  async function deleteUser(id: string) {
    if (!window.confirm("Êtes-vous sûr de vouloir supprimer cet utilisateur ? Cette action est irréversible.")) return;
    
    try {
      // Deletes the profile. (Note: Supabase auth.users can only be deleted via Admin API, 
      // but deleting the profile will cascade or break login if enforced)
      const { error } = await supabase.from('sv_user_profiles').delete().eq('id', id);
      if (error) throw error;
      
      setUsers(users.filter(u => u.id !== id));
    } catch (error) {
      console.error('Error deleting user:', error);
      alert('Erreur lors de la suppression.');
    }
  }

  async function toggleDeveloper(id: string, currentStatus: boolean) {
    try {
      const { error } = await supabase
        .from('sv_user_profiles')
        .update({ is_developer: !currentStatus })
        .eq('id', id);
        
      if (error) throw error;
      
      setUsers(users.map(u => u.id === id ? { ...u, is_developer: !currentStatus } : u));
    } catch (error) {
      console.error('Error toggling developer status:', error);
    }
  }

  const filteredUsers = users.filter(u => 
    (u.full_name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
    (u.phone?.toLowerCase() || '').includes(searchTerm.toLowerCase())
  );

  return (
    <div className="absolute inset-0 bg-[#06060F] flex flex-col overflow-hidden">
      <StatusBar />
      
      <div className="px-5 pt-2 pb-4 border-b border-white/5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate('dev-dashboard')} className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-white bg-white/5 rounded-full transition-colors">
              <ArrowLeft size={18} />
            </button>
            <div>
              <h1 className="text-white font-bold text-xl">Utilisateurs</h1>
              <p className="text-gray-400 text-xs">{users.length} comptes inscrits</p>
            </div>
          </div>
        </div>

        <div className="relative">
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">
            <Search size={18} />
          </div>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Rechercher par nom ou téléphone..."
            className="w-full bg-[#13132A] text-white pl-11 pr-4 py-3 rounded-xl border border-white/5 focus:outline-none focus:border-red-500 transition-colors text-sm"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-4">
        {loading ? (
          <div className="flex justify-center py-10">
            <div className="w-6 h-6 border-2 border-red-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {filteredUsers.map(u => (
              <div key={u.id} className="bg-[#13132A] border border-white/5 rounded-2xl p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-gray-400 shrink-0">
                      <User size={20} />
                    </div>
                    <div>
                      <h3 className="text-white font-bold text-sm">{u.full_name || 'Sans nom'}</h3>
                      <p className="text-gray-400 text-xs">{u.phone || 'Pas de téléphone'}</p>
                    </div>
                  </div>
                  
                  <button 
                    onClick={() => deleteUser(u.id)}
                    className="w-8 h-8 flex items-center justify-center text-red-400 bg-red-500/10 rounded-lg hover:bg-red-500/20 transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
                
                <div className="flex gap-2 mt-4 pt-4 border-t border-white/5">
                  <span className={`text-xs px-2 py-1 rounded-md ${u.is_organizer ? 'bg-purple-500/20 text-purple-400' : 'bg-gray-800 text-gray-400'}`}>
                    {u.is_organizer ? 'Organisateur' : 'Utilisateur'}
                  </span>
                  
                  <button 
                    onClick={() => toggleDeveloper(u.id, u.is_developer)}
                    className={`text-xs px-2 py-1 rounded-md transition-colors ${u.is_developer ? 'bg-red-500/20 text-red-400' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'}`}
                  >
                    {u.is_developer ? 'Développeur (Admin)' : 'Rendre Admin'}
                  </button>
                </div>
              </div>
            ))}
            
            {filteredUsers.length === 0 && (
              <div className="text-center py-10">
                <p className="text-gray-500 text-sm">Aucun utilisateur trouvé.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
