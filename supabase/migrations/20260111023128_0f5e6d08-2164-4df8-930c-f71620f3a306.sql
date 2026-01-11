-- Create financial_profiles table
CREATE TABLE public.financial_profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  monthly_income DECIMAL(12,2) DEFAULT 0,
  fixed_expenses DECIMAL(12,2) DEFAULT 0,
  dependents INTEGER DEFAULT 0,
  emergency_fund DECIMAL(12,2) DEFAULT 0,
  investments DECIMAL(12,2) DEFAULT 0,
  debts DECIMAL(12,2) DEFAULT 0,
  risk_profile TEXT DEFAULT 'moderate' CHECK (risk_profile IN ('conservative', 'moderate', 'aggressive')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- Create notifications table
CREATE TABLE public.notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('transaction', 'goal_achieved', 'bill_due', 'budget_exceeded', 'challenge_completed', 'monthly_analysis', 'system')),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  action_url TEXT,
  action_label TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create education_content table
CREATE TABLE public.education_content (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  type TEXT NOT NULL CHECK (type IN ('article', 'video', 'quiz')),
  title TEXT NOT NULL,
  description TEXT,
  content TEXT,
  thumbnail_url TEXT,
  video_url TEXT,
  quiz_data JSONB,
  category TEXT NOT NULL,
  difficulty TEXT DEFAULT 'beginner' CHECK (difficulty IN ('beginner', 'intermediate', 'advanced')),
  duration_minutes INTEGER,
  is_premium BOOLEAN DEFAULT false,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create quiz_results table
CREATE TABLE public.quiz_results (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content_id UUID NOT NULL REFERENCES public.education_content(id) ON DELETE CASCADE,
  score INTEGER NOT NULL,
  max_score INTEGER NOT NULL,
  answers JSONB NOT NULL DEFAULT '{}',
  completed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create glossary_terms table
CREATE TABLE public.glossary_terms (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  term TEXT NOT NULL UNIQUE,
  definition TEXT NOT NULL,
  category TEXT,
  related_terms TEXT[],
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.financial_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.education_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.glossary_terms ENABLE ROW LEVEL SECURITY;

-- RLS Policies for financial_profiles
CREATE POLICY "Users can view their own financial profile"
  ON public.financial_profiles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own financial profile"
  ON public.financial_profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own financial profile"
  ON public.financial_profiles FOR UPDATE
  USING (auth.uid() = user_id);

-- RLS Policies for notifications
CREATE POLICY "Users can view their own notifications"
  ON public.notifications FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications"
  ON public.notifications FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own notifications"
  ON public.notifications FOR DELETE
  USING (auth.uid() = user_id);

CREATE POLICY "System can insert notifications"
  ON public.notifications FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for education_content (public read)
CREATE POLICY "Anyone can view education content"
  ON public.education_content FOR SELECT
  USING (true);

-- RLS Policies for quiz_results
CREATE POLICY "Users can view their own quiz results"
  ON public.quiz_results FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own quiz results"
  ON public.quiz_results FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for glossary_terms (public read)
CREATE POLICY "Anyone can view glossary terms"
  ON public.glossary_terms FOR SELECT
  USING (true);

-- Trigger for updated_at on financial_profiles
CREATE TRIGGER update_financial_profiles_updated_at
  BEFORE UPDATE ON public.financial_profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insert sample education content
INSERT INTO public.education_content (type, title, description, content, category, difficulty, duration_minutes, is_premium) VALUES
  ('article', 'Introdução ao Orçamento Pessoal', 'Aprenda os fundamentos de como criar e manter um orçamento pessoal eficiente.', 'Um orçamento pessoal é uma ferramenta essencial para controlar suas finanças...', 'orçamento', 'beginner', 10, false),
  ('article', 'O Poder dos Juros Compostos', 'Entenda como os juros compostos podem trabalhar a seu favor nos investimentos.', 'Os juros compostos são considerados a oitava maravilha do mundo...', 'investimentos', 'beginner', 15, false),
  ('article', 'Como Criar um Fundo de Emergência', 'Guia completo para construir sua reserva de emergência.', 'Um fundo de emergência é essencial para sua segurança financeira...', 'poupança', 'beginner', 12, false),
  ('article', 'Diversificação de Investimentos', 'Aprenda a não colocar todos os ovos na mesma cesta.', 'A diversificação é uma estratégia fundamental para reduzir riscos...', 'investimentos', 'intermediate', 20, true),
  ('video', 'Primeiros Passos na Bolsa de Valores', 'Vídeo introdutório sobre como começar a investir na bolsa.', NULL, 'investimentos', 'beginner', 25, false),
  ('quiz', 'Quiz: Teste seus Conhecimentos Financeiros', 'Avalie seu conhecimento sobre finanças pessoais.', NULL, 'geral', 'beginner', 10, false);

-- Update the quiz with quiz_data
UPDATE public.education_content 
SET quiz_data = '[
  {"question": "O que são juros compostos?", "options": ["Juros simples", "Juros sobre juros", "Taxa de inflação", "Dividendos"], "correct": 1},
  {"question": "Qual a regra básica do orçamento 50-30-20?", "options": ["50% lazer, 30% necessidades, 20% poupança", "50% necessidades, 30% desejos, 20% poupança", "50% poupança, 30% necessidades, 20% lazer", "50% investimentos, 30% gastos, 20% reserva"], "correct": 1},
  {"question": "O que é um fundo de emergência?", "options": ["Investimento em ações", "Reserva para imprevistos", "Conta corrente", "Empréstimo bancário"], "correct": 1}
]'::jsonb
WHERE type = 'quiz';

-- Insert sample glossary terms
INSERT INTO public.glossary_terms (term, definition, category, related_terms) VALUES
  ('Juros Compostos', 'Juros calculados sobre o capital inicial mais os juros acumulados de períodos anteriores.', 'Investimentos', ARRAY['Juros Simples', 'Rentabilidade', 'CDI']),
  ('CDI', 'Certificado de Depósito Interbancário. Taxa de referência para investimentos de renda fixa.', 'Investimentos', ARRAY['Selic', 'Renda Fixa', 'CDB']),
  ('Selic', 'Taxa básica de juros da economia brasileira, definida pelo Banco Central.', 'Economia', ARRAY['CDI', 'Inflação', 'Banco Central']),
  ('Inflação', 'Aumento generalizado dos preços de bens e serviços na economia.', 'Economia', ARRAY['IPCA', 'Poder de compra', 'Correção monetária']),
  ('Renda Fixa', 'Investimentos com rentabilidade previsível, como CDB, Tesouro Direto e LCI.', 'Investimentos', ARRAY['CDB', 'Tesouro Direto', 'LCI']),
  ('Renda Variável', 'Investimentos cuja rentabilidade não é previsível, como ações e fundos imobiliários.', 'Investimentos', ARRAY['Ações', 'FIIs', 'Bolsa de Valores']),
  ('Liquidez', 'Facilidade de converter um ativo em dinheiro sem perda significativa de valor.', 'Investimentos', ARRAY['Resgate', 'Prazo', 'Carência']),
  ('Diversificação', 'Estratégia de distribuir investimentos em diferentes ativos para reduzir riscos.', 'Investimentos', ARRAY['Portfólio', 'Risco', 'Alocação']),
  ('Orçamento', 'Planejamento financeiro que compara receitas e despesas em um período.', 'Finanças Pessoais', ARRAY['Receita', 'Despesa', 'Planejamento']),
  ('Fundo de Emergência', 'Reserva financeira para cobrir despesas imprevistas ou períodos sem renda.', 'Finanças Pessoais', ARRAY['Poupança', 'Segurança financeira', 'Liquidez']);