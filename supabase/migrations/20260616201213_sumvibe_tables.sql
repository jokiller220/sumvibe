
-- Organizers table
CREATE TABLE IF NOT EXISTS sv_organizers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  logo_url TEXT,
  email TEXT,
  phone TEXT,
  verified BOOLEAN DEFAULT FALSE,
  member_since TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE sv_organizers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "sv_select_organizers" ON sv_organizers FOR SELECT USING (TRUE);
CREATE POLICY "sv_insert_own_organizer" ON sv_organizers FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "sv_update_own_organizer" ON sv_organizers FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "sv_delete_own_organizer" ON sv_organizers FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Events table
CREATE TABLE IF NOT EXISTS sv_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organizer_id UUID REFERENCES sv_organizers(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL DEFAULT 'Concerts',
  location TEXT NOT NULL,
  city TEXT DEFAULT 'Lomé',
  date TIMESTAMPTZ NOT NULL,
  end_date TIMESTAMPTZ,
  image_url TEXT,
  is_featured BOOLEAN DEFAULT FALSE,
  is_published BOOLEAN DEFAULT FALSE,
  total_capacity INTEGER DEFAULT 500,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE sv_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "sv_select_events" ON sv_events FOR SELECT USING (TRUE);
CREATE POLICY "sv_insert_own_event" ON sv_events FOR INSERT TO authenticated WITH CHECK (organizer_id IN (SELECT id FROM sv_organizers WHERE user_id = auth.uid()));
CREATE POLICY "sv_update_own_event" ON sv_events FOR UPDATE TO authenticated USING (organizer_id IN (SELECT id FROM sv_organizers WHERE user_id = auth.uid())) WITH CHECK (organizer_id IN (SELECT id FROM sv_organizers WHERE user_id = auth.uid()));
CREATE POLICY "sv_delete_own_event" ON sv_events FOR DELETE TO authenticated USING (organizer_id IN (SELECT id FROM sv_organizers WHERE user_id = auth.uid()));

-- Ticket types table
CREATE TABLE IF NOT EXISTS sv_ticket_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID REFERENCES sv_events(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  price INTEGER NOT NULL DEFAULT 0,
  capacity INTEGER NOT NULL DEFAULT 100,
  sold INTEGER DEFAULT 0,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE sv_ticket_types ENABLE ROW LEVEL SECURITY;

CREATE POLICY "sv_select_ticket_types" ON sv_ticket_types FOR SELECT USING (TRUE);
CREATE POLICY "sv_insert_ticket_types" ON sv_ticket_types FOR INSERT TO authenticated WITH CHECK (event_id IN (SELECT id FROM sv_events WHERE organizer_id IN (SELECT id FROM sv_organizers WHERE user_id = auth.uid())));
CREATE POLICY "sv_update_ticket_types" ON sv_ticket_types FOR UPDATE TO authenticated USING (event_id IN (SELECT id FROM sv_events WHERE organizer_id IN (SELECT id FROM sv_organizers WHERE user_id = auth.uid())));
CREATE POLICY "sv_delete_ticket_types" ON sv_ticket_types FOR DELETE TO authenticated USING (event_id IN (SELECT id FROM sv_events WHERE organizer_id IN (SELECT id FROM sv_organizers WHERE user_id = auth.uid())));

-- Purchases table
CREATE TABLE IF NOT EXISTS sv_purchases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  event_id UUID REFERENCES sv_events(id) ON DELETE CASCADE NOT NULL,
  ticket_type_id UUID REFERENCES sv_ticket_types(id) ON DELETE CASCADE NOT NULL,
  quantity INTEGER DEFAULT 1,
  total_amount INTEGER NOT NULL,
  payment_method TEXT DEFAULT 'Flooz',
  qr_code TEXT UNIQUE DEFAULT gen_random_uuid()::TEXT,
  status TEXT DEFAULT 'active',
  scanned_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE sv_purchases ENABLE ROW LEVEL SECURITY;

CREATE POLICY "sv_select_own_purchases" ON sv_purchases FOR SELECT TO authenticated USING (auth.uid() = user_id OR event_id IN (SELECT id FROM sv_events WHERE organizer_id IN (SELECT id FROM sv_organizers WHERE user_id = auth.uid())));
CREATE POLICY "sv_insert_own_purchases" ON sv_purchases FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "sv_update_own_purchases" ON sv_purchases FOR UPDATE TO authenticated USING (event_id IN (SELECT id FROM sv_events WHERE organizer_id IN (SELECT id FROM sv_organizers WHERE user_id = auth.uid())));
CREATE POLICY "sv_delete_own_purchases" ON sv_purchases FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Favorites table
CREATE TABLE IF NOT EXISTS sv_favorites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  event_id UUID REFERENCES sv_events(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, event_id)
);

ALTER TABLE sv_favorites ENABLE ROW LEVEL SECURITY;

CREATE POLICY "sv_select_own_favorites" ON sv_favorites FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "sv_insert_own_favorites" ON sv_favorites FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "sv_update_own_favorites" ON sv_favorites FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "sv_delete_own_favorites" ON sv_favorites FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- sv_user_profiles table
CREATE TABLE IF NOT EXISTS sv_user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  phone TEXT,
  avatar_url TEXT,
  is_organizer BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE sv_user_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "sv_select_own_profile" ON sv_user_profiles FOR SELECT TO authenticated USING (auth.uid() = id);
CREATE POLICY "sv_insert_own_profile" ON sv_user_profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);
CREATE POLICY "sv_update_own_profile" ON sv_user_profiles FOR UPDATE TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);
CREATE POLICY "sv_delete_own_profile" ON sv_user_profiles FOR DELETE TO authenticated USING (auth.uid() = id);
