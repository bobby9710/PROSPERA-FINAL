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
    (NEW.id, 'Salário', 'salary.svg', '#10B981', 'income', true),
    (NEW.id, 'Investimentos', 'earning_investments.svg', '#3B82F6', 'income', true),
    (NEW.id, 'Empréstimos', 'loans.svg', '#8B5CF6', 'income', true),
    (NEW.id, 'Outros', 'other_earnings.svg', '#6B7280', 'income', true);
  
  -- Expense categories
  INSERT INTO public.categories (user_id, name, icon, color, type, is_default) VALUES
    (NEW.id, 'Alimentação', 'food.svg', '#EF4444', 'expense', true),
    (NEW.id, 'Transporte', 'transportation.svg', '#3B82F6', 'expense', true),
    (NEW.id, 'Moradia', 'home.svg', '#8B5CF6', 'expense', true),
    (NEW.id, 'Saúde', 'health.svg', '#10B981', 'expense', true),
    (NEW.id, 'Lazer', 'entertainment.svg', '#EC4899', 'expense', true),
    (NEW.id, 'Compras', 'shopping.svg', '#F97316', 'expense', true),
    (NEW.id, 'Pets', 'pets.svg', '#8B4513', 'expense', true),
    (NEW.id, 'Educação', 'education.svg', '#6366F1', 'expense', true),
    (NEW.id, 'Outros', 'other.svg', '#6B7280', 'expense', true);
  
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
-- Name: automation_rules; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.automation_rules (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    name text NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    trigger_type text NOT NULL,
    trigger_value text,
    action_type text NOT NULL,
    action_value text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: badges; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.badges (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    badge_type text NOT NULL,
    earned_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: bank_connections; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.bank_connections (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    bank_code text NOT NULL,
    bank_name text NOT NULL,
    account_number text,
    status text DEFAULT 'pending'::text NOT NULL,
    last_sync_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT bank_connections_status_check CHECK ((status = ANY (ARRAY['pending'::text, 'connected'::text, 'disconnected'::text, 'error'::text])))
);


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
-- Name: challenges; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.challenges (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    title text NOT NULL,
    description text,
    type text NOT NULL,
    target_value numeric,
    target_category_id uuid,
    target_goal_id uuid,
    start_date date DEFAULT CURRENT_DATE NOT NULL,
    end_date date NOT NULL,
    current_progress numeric DEFAULT 0 NOT NULL,
    status text DEFAULT 'active'::text NOT NULL,
    points_reward integer DEFAULT 100 NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: chat_conversations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.chat_conversations (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    title text DEFAULT 'Nova conversa'::text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: chat_messages; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.chat_messages (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    conversation_id uuid NOT NULL,
    user_id uuid NOT NULL,
    role text NOT NULL,
    content text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT chat_messages_role_check CHECK ((role = ANY (ARRAY['user'::text, 'assistant'::text])))
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
-- Name: financial_insights; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.financial_insights (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    type text NOT NULL,
    period text,
    title text NOT NULL,
    content jsonb NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT financial_insights_type_check CHECK ((type = ANY (ARRAY['monthly_analysis'::text, 'spending_pattern'::text, 'recommendation'::text])))
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
-- Name: imported_transactions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.imported_transactions (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    bank_connection_id uuid,
    external_id text NOT NULL,
    amount numeric(12,2) NOT NULL,
    description text NOT NULL,
    date date NOT NULL,
    status text DEFAULT 'pending'::text NOT NULL,
    matched_transaction_id uuid,
    match_score integer,
    raw_data jsonb,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT imported_transactions_status_check CHECK ((status = ANY (ARRAY['pending'::text, 'matched'::text, 'imported'::text, 'ignored'::text])))
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
-- Name: user_achievements; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.user_achievements (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    total_points integer DEFAULT 0 NOT NULL,
    level integer DEFAULT 1 NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: automation_rules automation_rules_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.automation_rules
    ADD CONSTRAINT automation_rules_pkey PRIMARY KEY (id);


--
-- Name: badges badges_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.badges
    ADD CONSTRAINT badges_pkey PRIMARY KEY (id);


--
-- Name: badges badges_user_id_badge_type_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.badges
    ADD CONSTRAINT badges_user_id_badge_type_key UNIQUE (user_id, badge_type);


--
-- Name: bank_connections bank_connections_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.bank_connections
    ADD CONSTRAINT bank_connections_pkey PRIMARY KEY (id);


--
-- Name: categories categories_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT categories_pkey PRIMARY KEY (id);


--
-- Name: challenges challenges_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.challenges
    ADD CONSTRAINT challenges_pkey PRIMARY KEY (id);


--
-- Name: chat_conversations chat_conversations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.chat_conversations
    ADD CONSTRAINT chat_conversations_pkey PRIMARY KEY (id);


--
-- Name: chat_messages chat_messages_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.chat_messages
    ADD CONSTRAINT chat_messages_pkey PRIMARY KEY (id);


--
-- Name: credit_cards credit_cards_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.credit_cards
    ADD CONSTRAINT credit_cards_pkey PRIMARY KEY (id);


--
-- Name: financial_insights financial_insights_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.financial_insights
    ADD CONSTRAINT financial_insights_pkey PRIMARY KEY (id);


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
-- Name: imported_transactions imported_transactions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.imported_transactions
    ADD CONSTRAINT imported_transactions_pkey PRIMARY KEY (id);


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
-- Name: user_achievements user_achievements_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_achievements
    ADD CONSTRAINT user_achievements_pkey PRIMARY KEY (id);


--
-- Name: user_achievements user_achievements_user_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_achievements
    ADD CONSTRAINT user_achievements_user_id_key UNIQUE (user_id);


--
-- Name: idx_chat_conversations_user; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_chat_conversations_user ON public.chat_conversations USING btree (user_id);


--
-- Name: idx_chat_messages_conversation; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_chat_messages_conversation ON public.chat_messages USING btree (conversation_id);


--
-- Name: idx_financial_insights_user_type; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_financial_insights_user_type ON public.financial_insights USING btree (user_id, type);


--
-- Name: idx_imported_transactions_bank; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_imported_transactions_bank ON public.imported_transactions USING btree (bank_connection_id);


--
-- Name: idx_imported_transactions_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_imported_transactions_status ON public.imported_transactions USING btree (status);


--
-- Name: goal_contributions on_goal_contribution; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER on_goal_contribution AFTER INSERT ON public.goal_contributions FOR EACH ROW EXECUTE FUNCTION public.update_goal_amount();


--
-- Name: automation_rules update_automation_rules_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_automation_rules_updated_at BEFORE UPDATE ON public.automation_rules FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: bank_connections update_bank_connections_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_bank_connections_updated_at BEFORE UPDATE ON public.bank_connections FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: challenges update_challenges_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_challenges_updated_at BEFORE UPDATE ON public.challenges FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: chat_conversations update_chat_conversations_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_chat_conversations_updated_at BEFORE UPDATE ON public.chat_conversations FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


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
-- Name: user_achievements update_user_achievements_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_user_achievements_updated_at BEFORE UPDATE ON public.user_achievements FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: categories categories_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT categories_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: challenges challenges_target_category_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.challenges
    ADD CONSTRAINT challenges_target_category_id_fkey FOREIGN KEY (target_category_id) REFERENCES public.categories(id) ON DELETE SET NULL;


--
-- Name: challenges challenges_target_goal_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.challenges
    ADD CONSTRAINT challenges_target_goal_id_fkey FOREIGN KEY (target_goal_id) REFERENCES public.goals(id) ON DELETE SET NULL;


--
-- Name: chat_messages chat_messages_conversation_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.chat_messages
    ADD CONSTRAINT chat_messages_conversation_id_fkey FOREIGN KEY (conversation_id) REFERENCES public.chat_conversations(id) ON DELETE CASCADE;


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
-- Name: imported_transactions imported_transactions_bank_connection_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.imported_transactions
    ADD CONSTRAINT imported_transactions_bank_connection_id_fkey FOREIGN KEY (bank_connection_id) REFERENCES public.bank_connections(id) ON DELETE CASCADE;


--
-- Name: imported_transactions imported_transactions_matched_transaction_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.imported_transactions
    ADD CONSTRAINT imported_transactions_matched_transaction_id_fkey FOREIGN KEY (matched_transaction_id) REFERENCES public.transactions(id) ON DELETE SET NULL;


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
-- Name: user_achievements Users can create their own achievements; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can create their own achievements" ON public.user_achievements FOR INSERT WITH CHECK ((auth.uid() = user_id));


--
-- Name: automation_rules Users can create their own automation rules; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can create their own automation rules" ON public.automation_rules FOR INSERT WITH CHECK ((auth.uid() = user_id));


--
-- Name: badges Users can create their own badges; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can create their own badges" ON public.badges FOR INSERT WITH CHECK ((auth.uid() = user_id));


--
-- Name: bank_connections Users can create their own bank connections; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can create their own bank connections" ON public.bank_connections FOR INSERT WITH CHECK ((auth.uid() = user_id));


--
-- Name: challenges Users can create their own challenges; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can create their own challenges" ON public.challenges FOR INSERT WITH CHECK ((auth.uid() = user_id));


--
-- Name: chat_conversations Users can create their own conversations; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can create their own conversations" ON public.chat_conversations FOR INSERT WITH CHECK ((auth.uid() = user_id));


--
-- Name: imported_transactions Users can create their own imported transactions; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can create their own imported transactions" ON public.imported_transactions FOR INSERT WITH CHECK ((auth.uid() = user_id));


--
-- Name: financial_insights Users can create their own insights; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can create their own insights" ON public.financial_insights FOR INSERT WITH CHECK ((auth.uid() = user_id));


--
-- Name: chat_messages Users can create their own messages; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can create their own messages" ON public.chat_messages FOR INSERT WITH CHECK ((auth.uid() = user_id));


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
-- Name: automation_rules Users can delete their own automation rules; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can delete their own automation rules" ON public.automation_rules FOR DELETE USING ((auth.uid() = user_id));


--
-- Name: bank_connections Users can delete their own bank connections; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can delete their own bank connections" ON public.bank_connections FOR DELETE USING ((auth.uid() = user_id));


--
-- Name: challenges Users can delete their own challenges; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can delete their own challenges" ON public.challenges FOR DELETE USING ((auth.uid() = user_id));


--
-- Name: chat_conversations Users can delete their own conversations; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can delete their own conversations" ON public.chat_conversations FOR DELETE USING ((auth.uid() = user_id));


--
-- Name: imported_transactions Users can delete their own imported transactions; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can delete their own imported transactions" ON public.imported_transactions FOR DELETE USING ((auth.uid() = user_id));


--
-- Name: financial_insights Users can delete their own insights; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can delete their own insights" ON public.financial_insights FOR DELETE USING ((auth.uid() = user_id));


--
-- Name: chat_messages Users can delete their own messages; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can delete their own messages" ON public.chat_messages FOR DELETE USING ((auth.uid() = user_id));


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
-- Name: user_achievements Users can update their own achievements; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update their own achievements" ON public.user_achievements FOR UPDATE USING ((auth.uid() = user_id));


--
-- Name: automation_rules Users can update their own automation rules; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update their own automation rules" ON public.automation_rules FOR UPDATE USING ((auth.uid() = user_id));


--
-- Name: bank_connections Users can update their own bank connections; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update their own bank connections" ON public.bank_connections FOR UPDATE USING ((auth.uid() = user_id));


--
-- Name: challenges Users can update their own challenges; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update their own challenges" ON public.challenges FOR UPDATE USING ((auth.uid() = user_id));


--
-- Name: chat_conversations Users can update their own conversations; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update their own conversations" ON public.chat_conversations FOR UPDATE USING ((auth.uid() = user_id));


--
-- Name: imported_transactions Users can update their own imported transactions; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update their own imported transactions" ON public.imported_transactions FOR UPDATE USING ((auth.uid() = user_id));


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
-- Name: user_achievements Users can view their own achievements; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view their own achievements" ON public.user_achievements FOR SELECT USING ((auth.uid() = user_id));


--
-- Name: automation_rules Users can view their own automation rules; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view their own automation rules" ON public.automation_rules FOR SELECT USING ((auth.uid() = user_id));


--
-- Name: badges Users can view their own badges; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view their own badges" ON public.badges FOR SELECT USING ((auth.uid() = user_id));


--
-- Name: bank_connections Users can view their own bank connections; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view their own bank connections" ON public.bank_connections FOR SELECT USING ((auth.uid() = user_id));


--
-- Name: challenges Users can view their own challenges; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view their own challenges" ON public.challenges FOR SELECT USING ((auth.uid() = user_id));


--
-- Name: chat_conversations Users can view their own conversations; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view their own conversations" ON public.chat_conversations FOR SELECT USING ((auth.uid() = user_id));


--
-- Name: imported_transactions Users can view their own imported transactions; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view their own imported transactions" ON public.imported_transactions FOR SELECT USING ((auth.uid() = user_id));


--
-- Name: financial_insights Users can view their own insights; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view their own insights" ON public.financial_insights FOR SELECT USING ((auth.uid() = user_id));


--
-- Name: chat_messages Users can view their own messages; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view their own messages" ON public.chat_messages FOR SELECT USING ((auth.uid() = user_id));


--
-- Name: automation_rules; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.automation_rules ENABLE ROW LEVEL SECURITY;

--
-- Name: badges; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.badges ENABLE ROW LEVEL SECURITY;

--
-- Name: bank_connections; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.bank_connections ENABLE ROW LEVEL SECURITY;

--
-- Name: categories; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

--
-- Name: challenges; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.challenges ENABLE ROW LEVEL SECURITY;

--
-- Name: chat_conversations; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.chat_conversations ENABLE ROW LEVEL SECURITY;

--
-- Name: chat_messages; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

--
-- Name: credit_cards; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.credit_cards ENABLE ROW LEVEL SECURITY;

--
-- Name: financial_insights; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.financial_insights ENABLE ROW LEVEL SECURITY;

--
-- Name: goal_contributions; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.goal_contributions ENABLE ROW LEVEL SECURITY;

--
-- Name: goals; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.goals ENABLE ROW LEVEL SECURITY;

--
-- Name: imported_transactions; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.imported_transactions ENABLE ROW LEVEL SECURITY;

--
-- Name: profiles; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

--
-- Name: transactions; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

--
-- Name: user_achievements; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.user_achievements ENABLE ROW LEVEL SECURITY;

--
-- PostgreSQL database dump complete
--




COMMIT;