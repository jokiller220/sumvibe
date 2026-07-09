
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


-- Table for Validation Agents
CREATE TABLE IF NOT EXISTS sv_agents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name TEXT NOT NULL,
  login_code TEXT UNIQUE NOT NULL,
  temp_password TEXT NOT NULL,
  event_id UUID REFERENCES sv_events(id),
  role TEXT NOT NULL DEFAULT 'validator',
  is_active BOOLEAN NOT NULL DEFAULT true,
  avatar_initials TEXT,
  member_since TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Table for Scan Logs
CREATE TABLE IF NOT EXISTS sv_scan_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  purchase_id UUID REFERENCES sv_purchases(id),
  event_id UUID NOT NULL REFERENCES sv_events(id),
  agent_id UUID NOT NULL REFERENCES sv_agents(id),
  scanned_at TIMESTAMPTZ DEFAULT now(),
  result TEXT NOT NULL,
  ticket_number_attempted TEXT,
  agent_name TEXT,
  synced BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_sv_scan_logs_event_id ON sv_scan_logs(event_id);
CREATE INDEX IF NOT EXISTS idx_sv_scan_logs_scanned_at ON sv_scan_logs(scanned_at);
CREATE INDEX IF NOT EXISTS idx_sv_agents_login_code ON sv_agents(login_code);

-- RLS Policies
ALTER TABLE sv_agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE sv_scan_logs ENABLE ROW LEVEL SECURITY;

-- Agents can be read/updated by anon (since the app uses custom agent auth, not Supabase auth)
-- BUT in a real-world scenario, we might want to restrict this. For now, matching the previous Valticket logic:
CREATE POLICY "sv_select_agents" ON sv_agents FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "sv_insert_agents" ON sv_agents FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "sv_update_agents" ON sv_agents FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "sv_delete_agents" ON sv_agents FOR DELETE TO anon, authenticated USING (true);

-- Scan logs public access (for the validator app)
CREATE POLICY "sv_select_scan_logs" ON sv_scan_logs FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "sv_insert_scan_logs" ON sv_scan_logs FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "sv_update_scan_logs" ON sv_scan_logs FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "sv_delete_scan_logs" ON sv_scan_logs FOR DELETE TO anon, authenticated USING (true);

-- Also, update sv_purchases to make sure anon can SELECT and UPDATE (to mark as scanned)
-- because validators use custom auth and connect as anon.
CREATE POLICY "sv_select_purchases_anon" ON sv_purchases FOR SELECT TO anon USING (true);
CREATE POLICY "sv_update_purchases_anon" ON sv_purchases FOR UPDATE TO anon USING (true) WITH CHECK (true);

-- And we need anon to read sv_events and sv_ticket_types
CREATE POLICY "sv_select_events_anon" ON sv_events FOR SELECT TO anon USING (true);
CREATE POLICY "sv_select_ticket_types_anon" ON sv_ticket_types FOR SELECT TO anon USING (true);
-- 1. Add is_developer column to sv_user_profiles
ALTER TABLE sv_user_profiles ADD COLUMN IF NOT EXISTS is_developer BOOLEAN DEFAULT FALSE;

-- 2. Add Developer Policies for sv_events
CREATE POLICY "sv_all_events_developer" ON sv_events 
FOR ALL TO authenticated 
USING (
  EXISTS (
    SELECT 1 FROM sv_user_profiles 
    WHERE sv_user_profiles.id = auth.uid() 
    AND sv_user_profiles.is_developer = true
  )
) 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM sv_user_profiles 
    WHERE sv_user_profiles.id = auth.uid() 
    AND sv_user_profiles.is_developer = true
  )
);

-- 3. Add Developer Policies for sv_user_profiles
CREATE POLICY "sv_all_profiles_developer" ON sv_user_profiles 
FOR ALL TO authenticated 
USING (
  EXISTS (
    SELECT 1 FROM sv_user_profiles AS p 
    WHERE p.id = auth.uid() 
    AND p.is_developer = true
  )
) 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM sv_user_profiles AS p 
    WHERE p.id = auth.uid() 
    AND p.is_developer = true
  )
);

-- 4. Add Developer Policies for sv_organizers
CREATE POLICY "sv_all_organizers_developer" ON sv_organizers 
FOR ALL TO authenticated 
USING (
  EXISTS (
    SELECT 1 FROM sv_user_profiles 
    WHERE sv_user_profiles.id = auth.uid() 
    AND sv_user_profiles.is_developer = true
  )
) 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM sv_user_profiles 
    WHERE sv_user_profiles.id = auth.uid() 
    AND sv_user_profiles.is_developer = true
  )
);

-- 5. Add Developer Policies for sv_agents
CREATE POLICY "sv_all_agents_developer" ON sv_agents 
FOR ALL TO authenticated 
USING (
  EXISTS (
    SELECT 1 FROM sv_user_profiles 
    WHERE sv_user_profiles.id = auth.uid() 
    AND sv_user_profiles.is_developer = true
  )
) 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM sv_user_profiles 
    WHERE sv_user_profiles.id = auth.uid() 
    AND sv_user_profiles.is_developer = true
  )
);

-- 6. Add Developer Policies for sv_purchases
CREATE POLICY "sv_all_purchases_developer" ON sv_purchases 
FOR ALL TO authenticated 
USING (
  EXISTS (
    SELECT 1 FROM sv_user_profiles 
    WHERE sv_user_profiles.id = auth.uid() 
    AND sv_user_profiles.is_developer = true
  )
) 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM sv_user_profiles 
    WHERE sv_user_profiles.id = auth.uid() 
    AND sv_user_profiles.is_developer = true
  )
);

-- 7. SET your own account as developer
-- Uncomment the following block and run it after you created your account
/*
UPDATE sv_user_profiles 
SET is_developer = true 
WHERE id = (SELECT id FROM auth.users WHERE email = 'votre-email@exemple.com');
*/
