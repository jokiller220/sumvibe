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
