-- Create table to track email analysis usage
CREATE TABLE public.analysis_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    email_snippet TEXT, -- First 100 chars of email for reference (no sensitive data)
    classification TEXT NOT NULL,
    severity_score INTEGER NOT NULL,
    detected_issues_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    user_email TEXT -- Store email for anonymous tracking
);

-- Enable Row Level Security
ALTER TABLE public.analysis_history ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own analysis history
CREATE POLICY "Users can view their own analysis history"
ON public.analysis_history
FOR SELECT
USING (auth.uid() = user_id);

-- Policy: Anyone can insert analysis history (for both logged in and anonymous users)
CREATE POLICY "Anyone can insert analysis history"
ON public.analysis_history
FOR INSERT
WITH CHECK (true);

-- Policy: Admins can view all analysis history (for dashboard)
-- We'll create a simple admin check later

-- Create index for faster queries
CREATE INDEX idx_analysis_history_user_id ON public.analysis_history(user_id);
CREATE INDEX idx_analysis_history_created_at ON public.analysis_history(created_at DESC);