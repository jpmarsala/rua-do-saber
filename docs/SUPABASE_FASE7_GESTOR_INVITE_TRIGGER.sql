-- Fase 7: Ajuste do trigger handle_new_user para convites de professor (gestor)
-- Quando o gestor convida um professor, enviamos role e tenant_id no invite.
-- Ao aceitar o convite, o perfil deve ser criado com role=teacher e tenant_id.
-- Executar no Supabase SQL Editor após Fase 1.

create or replace function public.handle_new_user()
returns trigger as $$
declare
  meta_role text := nullif(trim(new.raw_user_meta_data->>'role'), '');
  meta_tenant_id uuid := (new.raw_user_meta_data->>'tenant_id')::uuid;
  final_role public.app_role := 'student';
  final_tenant_id uuid := null;
begin
  if meta_role in ('teacher', 'manager') and meta_tenant_id is not null then
    final_role := meta_role::public.app_role;
    final_tenant_id := meta_tenant_id;
  end if;

  insert into public.profiles (id, email, full_name, role, tenant_id)
  values (
    new.id,
    new.email,
    coalesce(
      nullif(trim(new.raw_user_meta_data->>'full_name'), ''),
      nullif(trim(new.raw_user_meta_data->>'name'), ''),
      split_part(new.email, '@', 1)
    ),
    final_role,
    final_tenant_id
  );
  return new;
end;
$$ language plpgsql security definer;
