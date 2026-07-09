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
