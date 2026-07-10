export type Screen =
  | 'splash'
  | 'onboarding'
  | 'login'
  | 'register'
  | 'home'
  | 'event-detail'
  | 'ticket-selection'
  | 'payment'
  | 'payment-success'
  | 'my-tickets'
  | 'my-payments'
  | 'ticket-detail'
  | 'search'
  | 'categories'
  | 'favorites'
  | 'profile'
  | 'notifications'
  | 'settings'
  | 'help'
  | 'filter'
  | 'share-event'
  | 'public-profile'
  | 'organizer-landing'
  | 'organizer-register'
  | 'organizer-dashboard'
  | 'organizer-my-events'
  | 'organizer-create-event'
  | 'organizer-scanner'
  | 'organizer-ticket-validated'
  | 'organizer-sales'
  | 'organizer-payments'
  | 'organizer-profile'
  | 'organizer-agents'
  | 'organizer-add-agent'
  | 'dev-login'
  | 'dev-dashboard'
  | 'dev-users'
  | 'dev-events'
  | 'dev-agents';

export interface Agent {
  id: string;
  full_name: string;
  login_code: string;
  temp_password: string;
  event_id: string | null;
  role: string;
  is_active: boolean;
  avatar_initials: string | null;
  member_since: string;
  created_at: string;
}

export interface Event {
  id: string;
  organizer_id: string;
  title: string;
  description: string | null;
  category: string;
  location: string;
  city: string;
  date: string;
  end_date: string | null;
  image_url: string | null;
  is_featured: boolean;
  is_published: boolean;
  total_capacity: number;
  created_at: string;
  sv_organizers?: Organizer;
  sv_ticket_types?: TicketType[];
}

export interface Organizer {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  logo_url: string | null;
  email: string | null;
  phone: string | null;
  verified: boolean;
  member_since: string;
  created_at: string;
}

export interface TicketType {
  id: string;
  event_id: string;
  name: string;
  price: number;
  capacity: number;
  sold: number;
  description: string | null;
  created_at: string;
}

export interface Purchase {
  id: string;
  user_id: string;
  event_id: string;
  ticket_type_id: string;
  quantity: number;
  total_amount: number;
  payment_method: string;
  qr_code: string;
  status: string;
  scanned_at: string | null;
  created_at: string;
  sv_events?: Event;
  sv_ticket_types?: TicketType;
}

export interface UserProfile {
  id: string;
  full_name: string | null;
  phone: string | null;
  avatar_url: string | null;
  is_organizer: boolean;
  is_developer?: boolean;
  created_at: string;
}
