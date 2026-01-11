CREATE EXTENSION IF NOT EXISTS "pg_graphql";
CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";
CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";
CREATE EXTENSION IF NOT EXISTS "plpgsql";
CREATE EXTENSION IF NOT EXISTS "supabase_vault";
CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";
BEGIN;

--
-- PostgreSQL database dump
--


-- Dumped from database version 17.6
-- Dumped by pg_dump version 18.1

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: public; Type: SCHEMA; Schema: -; Owner: -
--



--
-- Name: create_default_categories(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.create_default_categories() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
BEGIN
  -- Income categories
  INSERT INTO public.categories (user_id, name, icon, color, type, is_default) VALUES
    (NEW.id, 'Salário', '💰', '#10B981', 'income', true),
    (NEW.id, 'Freelance', '💼', '#8B5CF6', 'income', true),
    (NEW.id, 'Investimentos', '📈', '#3B82F6', 'income', true),
    (NEW.id, 'Presente', '🎁', '#EC4899', 'income', true),
    (NEW.id, 'Outros', '📦', '#6B7280', 'income', true);
  
  -- Expense categories
  INSERT INTO public.categories (user_id, name, icon, color, type, is_default) VALUES
    (NEW.id, 'Alimentação', '🍔', '#EF4444', 'expense', true),
    (NEW.id, 'Transporte', '🚗', '#F59E0B', 'expense', true),
    (NEW.id, 'Moradia', '🏠', '#8B5CF6', 'expense', true),
    (NEW.id, 'Saúde', '🏥', '#10B981', 'expense', true),
    (NEW.id, 'Lazer', '🎮', '#EC4899', 'expense', true),
    (NEW.id, 'Compras', '🛍️', '#3B82F6', 'expense', true),
    (NEW.id, 'Assinaturas', '📱', '#6366F1', 'expense', true),
    (NEW.id, 'Educação', '📚', '#14B8A6', 'expense', true),
    (NEW.id, 'Outros', '📦', '#6B7280', 'expense', true);
  
  RETURN NEW;
END;
$$;


--
-- Name: handle_new_user(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.handle_new_user() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
BEGIN
  INSERT INTO public.profiles (user_id, full_name)
  VALUES (NEW.id, NEW.raw_user_meta_data ->> 'full_name');
  RETURN NEW;
END;
$$;


--
-- Name: update_goal_amount(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.update_goal_amount() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
BEGIN
  UPDATE public.goals
  SET current_amount = current_amount + NEW.amount
  WHERE id = NEW.goal_id;
  
  -- Check if goal is completed
  UPDATE public.goals
  SET status = 'completed'
  WHERE id = NEW.goal_id AND current_amount >= target_amount;
  
  RETURN NEW;
END;
$$;


--
-- Name: update_updated_at_column(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.update_updated_at_column() RETURNS trigger
    LANGUAGE plpgsql
    SET search_path TO 'public'
    AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;


SET default_table_access_method = heap;

--
-- Name: categories; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.categories (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    name text NOT NULL,
    icon text DEFAULT '📦'::text NOT NULL,
    color text DEFAULT '#8B5CF6'::text NOT NULL,
    type text NOT NULL,
    is_default boolean DEFAULT false NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT categories_type_check CHECK ((type = ANY (ARRAY['income'::text, 'expense'::text])))
);


--
-- Name: credit_cards; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.credit_cards (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    name text NOT NULL,
    last_digits text NOT NULL,
    brand text DEFAULT 'visa'::text NOT NULL,
    credit_limit numeric(12,2) NOT NULL,
    closing_day integer NOT NULL,
    due_day integer NOT NULL,
    color text DEFAULT '#8B5CF6'::text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT credit_cards_closing_day_check CHECK (((closing_day >= 1) AND (closing_day <= 31))),
    CONSTRAINT credit_cards_credit_limit_check CHECK ((credit_limit > (0)::numeric)),
    CONSTRAINT credit_cards_due_day_check CHECK (((due_day >= 1) AND (due_day <= 31)))
);


--
-- Name: goal_contributions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.goal_contributions (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    goal_id uuid NOT NULL,
    user_id uuid NOT NULL,
    amount numeric(12,2) NOT NULL,
    notes text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT goal_contributions_amount_check CHECK ((amount > (0)::numeric))
);


--
-- Name: goals; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.goals (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    name text NOT NULL,
    target_amount numeric(12,2) NOT NULL,
    current_amount numeric(12,2) DEFAULT 0 NOT NULL,
    icon text DEFAULT '🎯'::text NOT NULL,
    color text DEFAULT '#8B5CF6'::text NOT NULL,
    deadline date,
    priority text DEFAULT 'medium'::text NOT NULL,
    status text DEFAULT 'active'::text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT goals_current_amount_check CHECK ((current_amount >= (0)::numeric)),
    CONSTRAINT goals_priority_check CHECK ((priority = ANY (ARRAY['low'::text, 'medium'::text, 'high'::text]))),
    CONSTRAINT goals_status_check CHECK ((status = ANY (ARRAY['active'::text, 'completed'::text, 'cancelled'::text]))),
    CONSTRAINT goals_target_amount_check CHECK ((target_amount > (0)::numeric))
);


--
-- Name: profiles; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.profiles (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    full_name text,
    avatar_url text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: transactions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.transactions (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    category_id uuid,
    credit_card_id uuid,
    description text NOT NULL,
    amount numeric(12,2) NOT NULL,
    type text NOT NULL,
    date date DEFAULT CURRENT_DATE NOT NULL,
    payment_method text,
    notes text,
    is_recurring boolean DEFAULT false NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT transactions_amount_check CHECK ((amount > (0)::numeric)),
    CONSTRAINT transactions_type_check CHECK ((type = ANY (ARRAY['income'::text, 'expense'::text])))
);


--
-- Name: categories categories_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT categories_pkey PRIMARY KEY (id);


--
-- Name: credit_cards credit_cards_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.credit_cards
    ADD CONSTRAINT credit_cards_pkey PRIMARY KEY (id);


--
-- Name: goal_contributions goal_contributions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.goal_contributions
    ADD CONSTRAINT goal_contributions_pkey PRIMARY KEY (id);


--
-- Name: goals goals_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.goals
    ADD CONSTRAINT goals_pkey PRIMARY KEY (id);


--
-- Name: profiles profiles_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.profiles
    ADD CONSTRAINT profiles_pkey PRIMARY KEY (id);


--
-- Name: profiles profiles_user_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.profiles
    ADD CONSTRAINT profiles_user_id_key UNIQUE (user_id);


--
-- Name: transactions transactions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.transactions
    ADD CONSTRAINT transactions_pkey PRIMARY KEY (id);


--
-- Name: goal_contributions on_goal_contribution; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER on_goal_contribution AFTER INSERT ON public.goal_contributions FOR EACH ROW EXECUTE FUNCTION public.update_goal_amount();


--
-- Name: credit_cards update_credit_cards_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_credit_cards_updated_at BEFORE UPDATE ON public.credit_cards FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: goals update_goals_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_goals_updated_at BEFORE UPDATE ON public.goals FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: profiles update_profiles_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: transactions update_transactions_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_transactions_updated_at BEFORE UPDATE ON public.transactions FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: categories categories_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT categories_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: credit_cards credit_cards_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.credit_cards
    ADD CONSTRAINT credit_cards_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: transactions fk_transactions_credit_card; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.transactions
    ADD CONSTRAINT fk_transactions_credit_card FOREIGN KEY (credit_card_id) REFERENCES public.credit_cards(id) ON DELETE SET NULL;


--
-- Name: goal_contributions goal_contributions_goal_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.goal_contributions
    ADD CONSTRAINT goal_contributions_goal_id_fkey FOREIGN KEY (goal_id) REFERENCES public.goals(id) ON DELETE CASCADE;


--
-- Name: goal_contributions goal_contributions_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.goal_contributions
    ADD CONSTRAINT goal_contributions_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: goals goals_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.goals
    ADD CONSTRAINT goals_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: profiles profiles_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.profiles
    ADD CONSTRAINT profiles_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: transactions transactions_category_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.transactions
    ADD CONSTRAINT transactions_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.categories(id) ON DELETE SET NULL;


--
-- Name: transactions transactions_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.transactions
    ADD CONSTRAINT transactions_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: credit_cards Users can delete own cards; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can delete own cards" ON public.credit_cards FOR DELETE USING ((auth.uid() = user_id));


--
-- Name: categories Users can delete own categories; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can delete own categories" ON public.categories FOR DELETE USING ((auth.uid() = user_id));


--
-- Name: goal_contributions Users can delete own contributions; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can delete own contributions" ON public.goal_contributions FOR DELETE USING ((auth.uid() = user_id));


--
-- Name: goals Users can delete own goals; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can delete own goals" ON public.goals FOR DELETE USING ((auth.uid() = user_id));


--
-- Name: transactions Users can delete own transactions; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can delete own transactions" ON public.transactions FOR DELETE USING ((auth.uid() = user_id));


--
-- Name: credit_cards Users can insert own cards; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can insert own cards" ON public.credit_cards FOR INSERT WITH CHECK ((auth.uid() = user_id));


--
-- Name: categories Users can insert own categories; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can insert own categories" ON public.categories FOR INSERT WITH CHECK ((auth.uid() = user_id));


--
-- Name: goal_contributions Users can insert own contributions; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can insert own contributions" ON public.goal_contributions FOR INSERT WITH CHECK ((auth.uid() = user_id));


--
-- Name: goals Users can insert own goals; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can insert own goals" ON public.goals FOR INSERT WITH CHECK ((auth.uid() = user_id));


--
-- Name: profiles Users can insert own profile; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK ((auth.uid() = user_id));


--
-- Name: transactions Users can insert own transactions; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can insert own transactions" ON public.transactions FOR INSERT WITH CHECK ((auth.uid() = user_id));


--
-- Name: credit_cards Users can update own cards; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update own cards" ON public.credit_cards FOR UPDATE USING ((auth.uid() = user_id));


--
-- Name: categories Users can update own categories; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update own categories" ON public.categories FOR UPDATE USING ((auth.uid() = user_id));


--
-- Name: goals Users can update own goals; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update own goals" ON public.goals FOR UPDATE USING ((auth.uid() = user_id));


--
-- Name: profiles Users can update own profile; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING ((auth.uid() = user_id));


--
-- Name: transactions Users can update own transactions; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update own transactions" ON public.transactions FOR UPDATE USING ((auth.uid() = user_id));


--
-- Name: credit_cards Users can view own cards; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view own cards" ON public.credit_cards FOR SELECT USING ((auth.uid() = user_id));


--
-- Name: categories Users can view own categories; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view own categories" ON public.categories FOR SELECT USING ((auth.uid() = user_id));


--
-- Name: goal_contributions Users can view own contributions; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view own contributions" ON public.goal_contributions FOR SELECT USING ((auth.uid() = user_id));


--
-- Name: goals Users can view own goals; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view own goals" ON public.goals FOR SELECT USING ((auth.uid() = user_id));


--
-- Name: profiles Users can view own profile; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING ((auth.uid() = user_id));


--
-- Name: transactions Users can view own transactions; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view own transactions" ON public.transactions FOR SELECT USING ((auth.uid() = user_id));


--
-- Name: categories; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

--
-- Name: credit_cards; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.credit_cards ENABLE ROW LEVEL SECURITY;

--
-- Name: goal_contributions; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.goal_contributions ENABLE ROW LEVEL SECURITY;

--
-- Name: goals; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.goals ENABLE ROW LEVEL SECURITY;

--
-- Name: profiles; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

--
-- Name: transactions; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

--
-- PostgreSQL database dump complete
--




COMMIT;