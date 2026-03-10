"use client";

import { useRouter } from "next/navigation";
import { LessonEditorForm } from "@/components/forms/LessonEditorForm";
import type { LessonFormValues } from "@/lib/validators/lesson";

type Option = { id: string; name: string };

export function EditarAulaFormWrapper({
  lessonId,
  defaultValues,
  collections,
  grades,
  pillars,
  skills,
  updateLesson,
}: {
  lessonId: string;
  defaultValues: Partial<LessonFormValues>;
  collections: Option[];
  grades: Option[];
  pillars: Option[];
  skills: Option[];
  updateLesson: (id: string, data: LessonFormValues) => Promise<{ error?: string; data?: { lessonId: string } }>;
}) {
  const router = useRouter();
  return (
    <LessonEditorForm
      defaultValues={defaultValues}
      lessonId={lessonId}
      collections={collections}
      grades={grades}
      pillars={pillars}
      skills={skills}
      onSubmit={(data) => updateLesson(lessonId, data)}
      onSuccess={() => router.refresh()}
    />
  );
}
