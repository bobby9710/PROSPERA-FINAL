-- Create chat_conversations table for storing conversation history
CREATE TABLE public.chat_conversations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT DEFAULT 'Nova conversa',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create chat_messages table for storing individual messages
CREATE TABLE public.chat_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  conversation_id UUID NOT NULL REFERENCES public.chat_conversations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create bank_connections table for Open Finance (Premium)
CREATE TABLE public.bank_connections (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  bank_code TEXT NOT NULL,
  bank_name TEXT NOT NULL,
  account_number TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'connected', 'disconnected', 'error')),
  last_sync_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create imported_transactions table for Open Finance
CREATE TABLE public.imported_transactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  bank_connection_id UUID REFERENCES public.bank_connections(id) ON DELETE CASCADE,
  external_id TEXT NOT NULL,
  amount DECIMAL(12,2) NOT NULL,
  description TEXT NOT NULL,
  date DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'matched', 'imported', 'ignored')),
  matched_transaction_id UUID REFERENCES public.transactions(id) ON DELETE SET NULL,
  match_score INTEGER,
  raw_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create financial_insights table for storing generated insights
CREATE TABLE public.financial_insights (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('monthly_analysis', 'spending_pattern', 'recommendation')),
  period TEXT,
  title TEXT NOT NULL,
  content JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.chat_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bank_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.imported_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.financial_insights ENABLE ROW LEVEL SECURITY;

-- RLS Policies for chat_conversations
CREATE POLICY "Users can view their own conversations" ON public.chat_conversations FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own conversations" ON public.chat_conversations FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own conversations" ON public.chat_conversations FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own conversations" ON public.chat_conversations FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for chat_messages
CREATE POLICY "Users can view their own messages" ON public.chat_messages FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own messages" ON public.chat_messages FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete their own messages" ON public.chat_messages FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for bank_connections
CREATE POLICY "Users can view their own bank connections" ON public.bank_connections FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own bank connections" ON public.bank_connections FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own bank connections" ON public.bank_connections FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own bank connections" ON public.bank_connections FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for imported_transactions
CREATE POLICY "Users can view their own imported transactions" ON public.imported_transactions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own imported transactions" ON public.imported_transactions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own imported transactions" ON public.imported_transactions FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own imported transactions" ON public.imported_transactions FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for financial_insights
CREATE POLICY "Users can view their own insights" ON public.financial_insights FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own insights" ON public.financial_insights FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete their own insights" ON public.financial_insights FOR DELETE USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX idx_chat_messages_conversation ON public.chat_messages(conversation_id);
CREATE INDEX idx_chat_conversations_user ON public.chat_conversations(user_id);
CREATE INDEX idx_imported_transactions_bank ON public.imported_transactions(bank_connection_id);
CREATE INDEX idx_imported_transactions_status ON public.imported_transactions(status);
CREATE INDEX idx_financial_insights_user_type ON public.financial_insights(user_id, type);

-- Update timestamp trigger for new tables
CREATE TRIGGER update_chat_conversations_updated_at
BEFORE UPDATE ON public.chat_conversations
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_bank_connections_updated_at
BEFORE UPDATE ON public.bank_connections
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();