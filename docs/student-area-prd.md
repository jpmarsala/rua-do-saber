# Student Area PRD — Rua do Saber

## Objective
Develop the student learning experience platform.

The system is gamified but teacher-controlled.

The teacher orchestrates lesson checkpoints while students interact with the learning journey.

---

## Main Student Flows

### First Access
1. Student receives invitation email
2. Creates password
3. Chooses nickname
4. Selects avatar
5. Enters the platform

This flow only occurs once.

### Lesson Flow
1. Teacher introduces lesson theme
2. Lesson node appears on journey map
3. Mascot introduces lesson
4. Student watches video in cinema room
5. Reward chest appears
6. Student receives collectible card
7. Mascot introduces challenge
8. Student plays until XP bar fills
9. Level up occurs
10. Ability/status card awarded
11. Teacher may pause for classroom activity
12. Mission unlocked
13. Mission validated next class

---

## Core Components

- JourneyMap
- LessonNode
- MascotDialogue
- CinemaRoom
- RewardChest
- ChallengeContainer
- MissionScreen
- StudentDashboard

---

## Lesson States

locked
available
video_unlocked
video_completed
reward_collected
challenge_unlocked
challenge_completed
mission_unlocked
mission_pending_validation
mission_validated
lesson_completed

---

## Teacher Controls

Teacher dashboard actions:

- Unlock lesson
- Pause session
- Resume session
- Unlock mission
- Validate mission
