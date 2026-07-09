-- 1. Create a function that bypasses RLS to check developer status
CREATE OR REPLACE FUNCTION public.is_developer()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 
    FROM public.sv_user_profiles 
    WHERE id = auth.uid() 
    AND is_developer = true
  );
$$;

-- 2. Drop the recursive policy
DROP POLICY IF EXISTS "sv_all_profiles_developer" ON public.sv_user_profiles;

-- 3. Recreate the policy using the safe function
CREATE POLICY "sv_all_profiles_developer" ON public.sv_user_profiles 
FOR ALL TO authenticated 
USING ( public.is_developer() ) 
WITH CHECK ( public.is_developer() );
