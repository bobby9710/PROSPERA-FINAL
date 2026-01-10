-- Create function to add default categories for new users
CREATE OR REPLACE FUNCTION public.create_default_categories()
RETURNS TRIGGER AS $$
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
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger to add default categories on user signup
CREATE TRIGGER on_auth_user_created_categories
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.create_default_categories();