-- Coluna status em profiles: 'pending' = convite não aceito, 'active' = ativo (convite aceito / e-mail confirmado).
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'pending'
CHECK (status IN ('active', 'pending'));

COMMENT ON COLUMN public.profiles.status IS 'pending = convite não aceito; active = ativo (e-mail confirmado).';

-- Perfis já existentes com e-mail confirmado na Auth: marcar como active.
UPDATE public.profiles p
SET status = 'active'
FROM auth.users u
WHERE p.id = u.id AND u.email_confirmed_at IS NOT NULL AND p.status = 'pending';

-- Função: ao confirmar e-mail em auth.users, marcar profile como active.
CREATE OR REPLACE FUNCTION public.set_profile_active_on_email_confirmed()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF (OLD.email_confirmed_at IS DISTINCT FROM NEW.email_confirmed_at) AND NEW.email_confirmed_at IS NOT NULL THEN
    UPDATE public.profiles SET status = 'active' WHERE id = NEW.id;
  END IF;
  RETURN NEW;
END;
$$;

-- Trigger em auth.users: após update, se email_confirmed_at passou a ser preenchido, atualiza profiles.
DROP TRIGGER IF EXISTS on_auth_user_email_confirmed ON auth.users;
CREATE TRIGGER on_auth_user_email_confirmed
  AFTER UPDATE ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.set_profile_active_on_email_confirmed();
