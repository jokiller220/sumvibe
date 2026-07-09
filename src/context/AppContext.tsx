import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { Screen, Event, Purchase, UserProfile, Organizer } from '../lib/types';

interface CartItem {
  ticketTypeId: string;
  ticketTypeName: string;
  price: number;
  quantity: number;
  eventId: string;
  eventTitle: string;
}

interface AppContextType {
  screen: Screen;
  navigate: (screen: Screen, params?: Record<string, unknown>) => void;
  goBack: () => void;
  params: Record<string, unknown>;
  user: User | null;
  profile: UserProfile | null;
  events: Event[];
  myPurchases: Purchase[];
  favoriteIds: Set<string>;
  organizer: Organizer | null;
  cart: CartItem | null;
  setCart: (cart: CartItem | null) => void;
  loadEvents: () => Promise<void>;
  loadMyPurchases: () => Promise<void>;
  loadFavorites: () => Promise<void>;
  toggleFavorite: (eventId: string) => Promise<void>;
  loadOrganizer: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [history, setHistory] = useState<{ screen: Screen; params: Record<string, unknown> }[]>([
    { screen: 'splash', params: {} },
  ]);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [events, setEvents] = useState<Event[]>([]);
  const [myPurchases, setMyPurchases] = useState<Purchase[]>([]);
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set());
  const [organizer, setOrganizer] = useState<Organizer | null>(null);
  const [cart, setCart] = useState<CartItem | null>(null);

  const current = history[history.length - 1];
  const screen = current.screen;
  const params = current.params;

  const navigate = (s: Screen, p: Record<string, unknown> = {}) => {
    setHistory(h => [...h, { screen: s, params: p }]);
  };

  const goBack = () => {
    setHistory(h => (h.length > 1 ? h.slice(0, -1) : h));
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setUser(data.session?.user ?? null);
    });
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    return () => listener.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    loadEvents();
  }, []);

  useEffect(() => {
    if (user) {
      loadProfile();
      loadMyPurchases();
      loadFavorites();
      loadOrganizer();
    } else {
      setProfile(null);
      setMyPurchases([]);
      setFavoriteIds(new Set());
      setOrganizer(null);
    }
  }, [user]);

  const loadProfile = async () => {
    if (!user) return;
    const { data } = await supabase
      .from('sv_user_profiles')
      .select('*')
      .eq('id', user.id)
      .single();
    if (data) setProfile(data);
  };

  const loadEvents = async () => {
    const { data } = await supabase
      .from('sv_events')
      .select('*, sv_organizers(*), sv_ticket_types(*)')
      .eq('is_published', true)
      .order('date', { ascending: true });
    if (data) setEvents(data);
  };

  const loadMyPurchases = async () => {
    if (!user) return;
    const { data } = await supabase
      .from('sv_purchases')
      .select('*, sv_events(*, sv_organizers(*)), sv_ticket_types(*)')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
    if (data) setMyPurchases(data);
  };

  const loadFavorites = async () => {
    if (!user) return;
    const { data } = await supabase
      .from('sv_favorites')
      .select('event_id')
      .eq('user_id', user.id);
    if (data) setFavoriteIds(new Set(data.map(f => f.event_id)));
  };

  const toggleFavorite = async (eventId: string) => {
    if (!user) return;
    if (favoriteIds.has(eventId)) {
      await supabase.from('sv_favorites').delete().eq('user_id', user.id).eq('event_id', eventId);
      setFavoriteIds(prev => { const s = new Set(prev); s.delete(eventId); return s; });
    } else {
      await supabase.from('sv_favorites').insert({ user_id: user.id, event_id: eventId });
      setFavoriteIds(prev => new Set([...prev, eventId]));
    }
  };

  const loadOrganizer = async () => {
    if (!user) return;
    const { data } = await supabase
      .from('sv_organizers')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle();
    if (data) setOrganizer(data);
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setHistory([{ screen: 'splash', params: {} }]);
  };

  return (
    <AppContext.Provider
      value={{
        screen, navigate, goBack, params,
        user, profile, events, myPurchases,
        favoriteIds, organizer, cart, setCart,
        loadEvents, loadMyPurchases, loadFavorites,
        toggleFavorite, loadOrganizer, signOut,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used inside AppProvider');
  return ctx;
}
