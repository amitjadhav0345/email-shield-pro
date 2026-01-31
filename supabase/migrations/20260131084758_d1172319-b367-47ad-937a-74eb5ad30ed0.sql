-- Drop the overly permissive INSERT policy
DROP POLICY IF EXISTS "Anyone can insert analysis history" ON public.analysis_history;

-- Create a more secure INSERT policy - only authenticated users or service role can insert
CREATE POLICY "Authenticated users can insert analysis history"
ON public.analysis_history
FOR INSERT
WITH CHECK (
  auth.uid() IS NOT NULL AND (user_id IS NULL OR user_id = auth.uid())
);

-- Also allow service role to insert (for edge function)
CREATE POLICY "Service role can insert analysis history"
ON public.analysis_history
FOR INSERT
TO service_role
WITH CHECK (true);