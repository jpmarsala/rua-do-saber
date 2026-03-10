-- Fase 3: Permitir que super_admin e editor criem/editem conteúdo editorial
-- Executar no SQL Editor após a Fase 2.

-- Função auxiliar: usuário é editor ou super_admin
CREATE OR REPLACE FUNCTION public.is_editor()
RETURNS boolean AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role IN ('super_admin', 'editor')
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Grades, pillars, skills, collections: INSERT/UPDATE/DELETE para editores
CREATE POLICY "grades_insert_editor" ON public.grades FOR INSERT TO authenticated WITH CHECK (public.is_editor());
CREATE POLICY "grades_update_editor" ON public.grades FOR UPDATE TO authenticated USING (public.is_editor());
CREATE POLICY "grades_delete_editor" ON public.grades FOR DELETE TO authenticated USING (public.is_editor());

CREATE POLICY "pillars_insert_editor" ON public.pillars FOR INSERT TO authenticated WITH CHECK (public.is_editor());
CREATE POLICY "pillars_update_editor" ON public.pillars FOR UPDATE TO authenticated USING (public.is_editor());
CREATE POLICY "pillars_delete_editor" ON public.pillars FOR DELETE TO authenticated USING (public.is_editor());

CREATE POLICY "skills_insert_editor" ON public.skills FOR INSERT TO authenticated WITH CHECK (public.is_editor());
CREATE POLICY "skills_update_editor" ON public.skills FOR UPDATE TO authenticated USING (public.is_editor());
CREATE POLICY "skills_delete_editor" ON public.skills FOR DELETE TO authenticated USING (public.is_editor());

CREATE POLICY "collections_insert_editor" ON public.collections FOR INSERT TO authenticated WITH CHECK (public.is_editor());
CREATE POLICY "collections_update_editor" ON public.collections FOR UPDATE TO authenticated USING (public.is_editor());
CREATE POLICY "collections_delete_editor" ON public.collections FOR DELETE TO authenticated USING (public.is_editor());

-- Lessons e lesson_versions, lesson_content, lesson_media, lesson_cards, lesson_games
CREATE POLICY "lessons_insert_editor" ON public.lessons FOR INSERT TO authenticated WITH CHECK (public.is_editor());
CREATE POLICY "lessons_update_editor" ON public.lessons FOR UPDATE TO authenticated USING (public.is_editor());
CREATE POLICY "lessons_delete_editor" ON public.lessons FOR DELETE TO authenticated USING (public.is_editor());

CREATE POLICY "lesson_versions_insert_editor" ON public.lesson_versions FOR INSERT TO authenticated WITH CHECK (public.is_editor());
CREATE POLICY "lesson_versions_update_editor" ON public.lesson_versions FOR UPDATE TO authenticated USING (public.is_editor());
CREATE POLICY "lesson_versions_delete_editor" ON public.lesson_versions FOR DELETE TO authenticated USING (public.is_editor());

CREATE POLICY "lesson_content_insert_editor" ON public.lesson_content FOR INSERT TO authenticated WITH CHECK (public.is_editor());
CREATE POLICY "lesson_content_update_editor" ON public.lesson_content FOR UPDATE TO authenticated USING (public.is_editor());
CREATE POLICY "lesson_content_delete_editor" ON public.lesson_content FOR DELETE TO authenticated USING (public.is_editor());

CREATE POLICY "lesson_media_insert_editor" ON public.lesson_media FOR INSERT TO authenticated WITH CHECK (public.is_editor());
CREATE POLICY "lesson_media_update_editor" ON public.lesson_media FOR UPDATE TO authenticated USING (public.is_editor());
CREATE POLICY "lesson_media_delete_editor" ON public.lesson_media FOR DELETE TO authenticated USING (public.is_editor());

CREATE POLICY "lesson_cards_insert_editor" ON public.lesson_cards FOR INSERT TO authenticated WITH CHECK (public.is_editor());
CREATE POLICY "lesson_cards_update_editor" ON public.lesson_cards FOR UPDATE TO authenticated USING (public.is_editor());
CREATE POLICY "lesson_cards_delete_editor" ON public.lesson_cards FOR DELETE TO authenticated USING (public.is_editor());

CREATE POLICY "lesson_games_insert_editor" ON public.lesson_games FOR INSERT TO authenticated WITH CHECK (public.is_editor());
CREATE POLICY "lesson_games_update_editor" ON public.lesson_games FOR UPDATE TO authenticated USING (public.is_editor());
CREATE POLICY "lesson_games_delete_editor" ON public.lesson_games FOR DELETE TO authenticated USING (public.is_editor());
