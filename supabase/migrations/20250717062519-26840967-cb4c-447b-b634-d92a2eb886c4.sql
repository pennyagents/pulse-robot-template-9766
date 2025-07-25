-- Create cash_transactions table for tracking cash movements
CREATE TABLE public.cash_transactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  transaction_type VARCHAR(20) NOT NULL CHECK (transaction_type IN ('cash_in', 'cash_transfer', 'expense_cash')),
  amount DECIMAL(10,2) NOT NULL,
  from_date DATE NULL,
  to_date DATE NULL,
  remarks TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by TEXT -- reference to admin who created the transaction
);

-- Create expenses table for tracking all expenses
CREATE TABLE public.expenses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  amount DECIMAL(10,2) NOT NULL,
  payment_method VARCHAR(10) NOT NULL CHECK (payment_method IN ('cash', 'bank')),
  remarks TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by TEXT -- reference to admin who created the expense
);

-- Create cash_summary table for tracking current balances
CREATE TABLE public.cash_summary (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  cash_in_hand DECIMAL(10,2) NOT NULL DEFAULT 0,
  cash_at_bank DECIMAL(10,2) NOT NULL DEFAULT 0,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Insert initial record for cash summary
INSERT INTO public.cash_summary (cash_in_hand, cash_at_bank) VALUES (0, 0);

-- Enable Row Level Security
ALTER TABLE public.cash_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cash_summary ENABLE ROW LEVEL SECURITY;

-- Create policies for admin access
CREATE POLICY "Admins can manage cash transactions" 
ON public.cash_transactions 
FOR ALL 
USING (is_admin_context()) 
WITH CHECK (is_admin_context());

CREATE POLICY "Admins can manage expenses" 
ON public.expenses 
FOR ALL 
USING (is_admin_context()) 
WITH CHECK (is_admin_context());

CREATE POLICY "Admins can manage cash summary" 
ON public.cash_summary 
FOR ALL 
USING (is_admin_context()) 
WITH CHECK (is_admin_context());

-- Create function to update cash balances
CREATE OR REPLACE FUNCTION public.update_cash_balance()
RETURNS TRIGGER AS $$
BEGIN
  -- Update cash summary based on transaction type
  IF TG_TABLE_NAME = 'cash_transactions' THEN
    IF NEW.transaction_type = 'cash_transfer' THEN
      -- Deduct from cash in hand, add to cash at bank
      UPDATE public.cash_summary 
      SET 
        cash_in_hand = cash_in_hand - NEW.amount,
        cash_at_bank = cash_at_bank + NEW.amount,
        updated_at = now();
    ELSIF NEW.transaction_type = 'expense_cash' THEN
      -- Deduct from cash in hand for cash expenses
      UPDATE public.cash_summary 
      SET 
        cash_in_hand = cash_in_hand - NEW.amount,
        updated_at = now();
    END IF;
  ELSIF TG_TABLE_NAME = 'expenses' THEN
    IF NEW.payment_method = 'cash' THEN
      -- Deduct from cash in hand
      UPDATE public.cash_summary 
      SET 
        cash_in_hand = cash_in_hand - NEW.amount,
        updated_at = now();
    ELSIF NEW.payment_method = 'bank' THEN
      -- Deduct from cash at bank
      UPDATE public.cash_summary 
      SET 
        cash_at_bank = cash_at_bank - NEW.amount,
        updated_at = now();
    END IF;
  ELSIF TG_TABLE_NAME = 'registrations' AND NEW.status = 'approved' AND OLD.status != 'approved' THEN
    -- Add to cash in hand when registration is approved and fee is paid
    IF NEW.fee_paid > 0 THEN
      UPDATE public.cash_summary 
      SET 
        cash_in_hand = cash_in_hand + NEW.fee_paid,
        updated_at = now();
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers
CREATE TRIGGER update_cash_on_transaction
  AFTER INSERT ON public.cash_transactions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_cash_balance();

CREATE TRIGGER update_cash_on_expense
  AFTER INSERT ON public.expenses
  FOR EACH ROW
  EXECUTE FUNCTION public.update_cash_balance();

CREATE TRIGGER update_cash_on_registration_approval
  AFTER UPDATE ON public.registrations
  FOR EACH ROW
  EXECUTE FUNCTION public.update_cash_balance();

-- Add timestamp triggers
CREATE TRIGGER update_cash_transactions_updated_at
  BEFORE UPDATE ON public.cash_transactions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_expenses_updated_at
  BEFORE UPDATE ON public.expenses
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();