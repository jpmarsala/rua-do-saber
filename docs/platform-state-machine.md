
# Platform State Machine — Rua do Saber

This document defines the **state machine** that controls the learning experience.

The platform is **teacher‑controlled** and **checkpoint‑driven**.

Teacher → Platform → Student

---

# Lesson Lifecycle

A lesson progresses through the following states.

locked
available
video_unlocked
video_completed
reward_available
reward_collected
challenge_unlocked
challenge_completed
activity_paused_by_teacher
mission_unlocked
mission_pending_validation
mission_validated
lesson_completed

---

# State Descriptions

## locked
The lesson is not yet available to the student.

## available
Teacher has introduced the lesson and unlocked it.

## video_unlocked
Student can access the cinema room.

## video_completed
Video has been watched fully.

## reward_available
Treasure chest appears.

## reward_collected
Student collected the animated card.

## challenge_unlocked
Interactive challenge becomes available.

## challenge_completed
XP bar filled and level increased.

## activity_paused_by_teacher
Teacher pauses digital session for classroom activity.

## mission_unlocked
Mascot presents the real‑world mission.

## mission_pending_validation
Student completed mission outside platform.

## mission_validated
Teacher validated the mission in the next class.

## lesson_completed
Lesson cycle finished and next lesson may start.

---

# First Access Flow

invite_sent
first_access_started
password_created
nickname_created
avatar_selected
onboarding_completed

This flow happens **only once**.

---

# Teacher Controls

Teacher dashboard actions:

unlock_lesson
pause_session
resume_session
unlock_mission
validate_mission

These actions trigger state transitions.
