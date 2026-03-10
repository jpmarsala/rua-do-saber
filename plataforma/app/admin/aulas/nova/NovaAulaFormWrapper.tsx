"use client";

import { useRouter } from "next/navigation";
import { LessonEditorForm } from "@/components/forms/LessonEditorForm";
import type { LessonFormValues } from "@/lib/validators/lesson";

type Option = { id: string; name: string };

export function NovaAulaFormWrapper({
  collections,
  grades,
  pillars,
  skills,
  createLesson,
}: {
  collections: Option[];
  grades: Option[];
  pillars: Option[];
  skills: Option[];
  createLesson: (data: LessonFormValues) => Promise<{ error?: string; data?: { lessonId: string } }>;
}) {
  const router = useRouter();
  return (
    <LessonEditorForm
      defaultValues={{}}
      collections={collections}
      grades={grades}
      pillars={pillars}
      skills={skills}
      onSubmit={createLesson}
      onSuccess={(lessonId) => router.push(`/admin/aulas/${lessonId}`)}
    />
  );
}
