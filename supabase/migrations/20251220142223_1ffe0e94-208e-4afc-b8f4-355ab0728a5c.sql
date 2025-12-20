-- Create shifts table
CREATE TABLE public.shifts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  opened_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  closed_at TIMESTAMP WITH TIME ZONE,
  opening_cash NUMERIC NOT NULL DEFAULT 0,
  closing_cash NUMERIC,
  expected_cash NUMERIC,
  total_sales NUMERIC DEFAULT 0,
  total_transactions INTEGER DEFAULT 0,
  notes TEXT,
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'closed')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.shifts ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (no auth required for POS)
CREATE POLICY "Allow public read access to shifts"
ON public.shifts
FOR SELECT
USING (true);

CREATE POLICY "Allow public insert to shifts"
ON public.shifts
FOR INSERT
WITH CHECK (true);

CREATE POLICY "Allow public update to shifts"
ON public.shifts
FOR UPDATE
USING (true);

-- Add shift_id to transactions table
ALTER TABLE public.transactions ADD COLUMN shift_id UUID REFERENCES public.shifts(id);