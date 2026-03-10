# Student Learning Experience — Architecture

## Summary

The student experience is **teacher-led** and **checkpoint-driven**. The UI extends the existing `studentJourneyMockup.tsx` layout (sidebar, journey map, mascot) and wires it to real lesson state derived from `class_lesson_state` (teacher unlocks) and `student_lesson_progress` (video, game, mission).

## State Machine (per lesson)

| State | Condition |
|-------|-----------|
| locked | Teacher has not unlocked (no intro_completed_at for class) |
| available | Teacher unlocked; student can open lesson (video) |
| done | mission_validated_at set (or game_completed for display) |

Node styling: locked (gray), current (sky/yellow), done (green). Mascot copy by state.

## Data Layer

- getStudentJourneyData(): session, student's first class, lessons, class_lesson_state, student_lesson_progress, profile (total_xp). Derive per-lesson state and currentLessonId.

## UI

- Keep mockup layout. Nodes from journey data; link to /aluno/aulas/[id]. Mascot message from state. Sidebar: Jornada, Coleção (/aluno/cards), Missões, Perfil.

## Files

- lib/auth/student-journey-data.ts — getStudentJourneyData()
- src/ui/studentJourneyMockup.tsx — extend with journeyData prop
- app/aluno/page.tsx — use journey as main view
