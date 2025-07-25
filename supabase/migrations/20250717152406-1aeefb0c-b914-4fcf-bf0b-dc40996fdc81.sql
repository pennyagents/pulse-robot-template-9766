-- Enable RLS on cash_transactions and expenses tables
ALTER TABLE public.cash_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;

-- Create policies for cash_transactions table
CREATE POLICY "Allow admin operations on cash_transactions" 
ON public.cash_transactions 
FOR ALL 
USING (is_admin_context())
WITH CHECK (is_admin_context());

-- Create policies for expenses table
CREATE POLICY "Allow admin operations on expenses" 
ON public.expenses 
FOR ALL 
USING (is_admin_context())
WITH CHECK (is_admin_context());

-- Create policies for cash_summary table
ALTER TABLE public.cash_summary ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow admin operations on cash_summary" 
ON public.cash_summary 
FOR ALL 
USING (is_admin_context())
WITH CHECK (is_admin_context());