
-- Create escrow system tables
CREATE TABLE public.escrow_transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE NOT NULL,
  client_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  freelancer_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  status TEXT CHECK (status IN ('pending', 'held', 'released', 'refunded')) DEFAULT 'pending',
  stripe_payment_intent_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create freelancer balances table
CREATE TABLE public.freelancer_balances (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  freelancer_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL UNIQUE,
  available_balance DECIMAL(10,2) DEFAULT 0.00 NOT NULL,
  pending_balance DECIMAL(10,2) DEFAULT 0.00 NOT NULL,
  total_earned DECIMAL(10,2) DEFAULT 0.00 NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create payout requests table
CREATE TABLE public.payout_requests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  freelancer_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  payment_method TEXT CHECK (payment_method IN ('paypal', 'bank_transfer')) NOT NULL,
  payment_details JSONB NOT NULL, -- Store PayPal email or bank details
  status TEXT CHECK (status IN ('pending', 'approved', 'rejected', 'completed')) DEFAULT 'pending',
  admin_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create project payments table to track project payment status
CREATE TABLE public.project_payments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE NOT NULL UNIQUE,
  client_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  payment_status TEXT CHECK (payment_status IN ('unpaid', 'paid', 'refunded')) DEFAULT 'unpaid',
  stripe_payment_intent_id TEXT,
  paid_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create project milestones table for work approval
CREATE TABLE public.project_milestones (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE NOT NULL,
  freelancer_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  amount DECIMAL(10,2) NOT NULL,
  status TEXT CHECK (status IN ('pending', 'submitted', 'approved', 'rejected', 'paid')) DEFAULT 'pending',
  submitted_at TIMESTAMP WITH TIME ZONE,
  approved_at TIMESTAMP WITH TIME ZONE,
  client_feedback TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable Row Level Security
ALTER TABLE public.escrow_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.freelancer_balances ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payout_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_milestones ENABLE ROW LEVEL SECURITY;

-- RLS Policies for escrow_transactions
CREATE POLICY "Users can view their own escrow transactions" ON public.escrow_transactions
  FOR SELECT USING (auth.uid() = client_id OR auth.uid() = freelancer_id);

CREATE POLICY "System can manage escrow transactions" ON public.escrow_transactions
  FOR ALL USING (true);

-- RLS Policies for freelancer_balances
CREATE POLICY "Freelancers can view their own balance" ON public.freelancer_balances
  FOR SELECT USING (auth.uid() = freelancer_id);

CREATE POLICY "System can manage balances" ON public.freelancer_balances
  FOR ALL USING (true);

-- RLS Policies for payout_requests
CREATE POLICY "Freelancers can view their own payout requests" ON public.payout_requests
  FOR SELECT USING (auth.uid() = freelancer_id);

CREATE POLICY "Freelancers can create payout requests" ON public.payout_requests
  FOR INSERT WITH CHECK (auth.uid() = freelancer_id);

CREATE POLICY "System can manage payout requests" ON public.payout_requests
  FOR ALL USING (true);

-- RLS Policies for project_payments
CREATE POLICY "Project participants can view payments" ON public.project_payments
  FOR SELECT USING (
    auth.uid() = client_id OR 
    auth.uid() IN (SELECT freelancer_id FROM public.proposals WHERE project_id = project_payments.project_id)
  );

CREATE POLICY "System can manage project payments" ON public.project_payments
  FOR ALL USING (true);

-- RLS Policies for project_milestones
CREATE POLICY "Project participants can view milestones" ON public.project_milestones
  FOR SELECT USING (
    auth.uid() = freelancer_id OR 
    auth.uid() IN (SELECT client_id FROM public.projects WHERE id = project_milestones.project_id)
  );

CREATE POLICY "Freelancers can create milestones" ON public.project_milestones
  FOR INSERT WITH CHECK (auth.uid() = freelancer_id);

CREATE POLICY "Project participants can update milestones" ON public.project_milestones
  FOR UPDATE USING (
    auth.uid() = freelancer_id OR 
    auth.uid() IN (SELECT client_id FROM public.projects WHERE id = project_milestones.project_id)
  );

-- Add payment_required column to projects table
ALTER TABLE public.projects ADD COLUMN payment_required BOOLEAN DEFAULT true;
ALTER TABLE public.projects ADD COLUMN payment_status TEXT CHECK (payment_status IN ('unpaid', 'paid')) DEFAULT 'unpaid';

-- Create function to initialize freelancer balance
CREATE OR REPLACE FUNCTION public.initialize_freelancer_balance()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.freelancer_balances (freelancer_id)
  VALUES (NEW.id)
  ON CONFLICT (freelancer_id) DO NOTHING;
  RETURN NEW;
END;
$$;

-- Create trigger to initialize balance for new freelancers
CREATE TRIGGER on_freelancer_created
  AFTER INSERT ON public.profiles
  FOR EACH ROW 
  WHEN (NEW.user_type = 'freelancer')
  EXECUTE PROCEDURE public.initialize_freelancer_balance();
