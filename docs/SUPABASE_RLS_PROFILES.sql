
-- Permite que cada usuário leia o próprio perfil (necessário para a sessão mostrar o role correto)
-- Rode no SQL Editor do Supabase se ainda aparecer "Aluno" para super_admin.

-- Habilitar RLS na tabela (se ainda não estiver)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Remover política antiga com nome igual, se existir (evita erro de duplicata)
DROP POLICY IF EXISTS "profiles_select_own" ON public.profiles;

-- Usuário pode ler o próprio perfil
CREATE POLICY "profiles_select_own"
  ON public.profiles
  FOR SELECT
  USING (auth.uid() = id);
