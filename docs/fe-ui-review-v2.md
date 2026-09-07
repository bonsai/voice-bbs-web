# FE UI Review — 2026-09-07

Backend/API is out of scope.

## P0
- Screen-local CSS and inline visual rules remain in Lobby/Room next to shared UI primitives. Migrate to the Design System.
- A/B/C recording modes are exposed to users. Select one canonical production interaction; keep alternatives only for review/debug.

## P1
- Make VoiceBubble the single visual source for waveform, category, owner, playing, loading and error states.
- Unify typography, spacing and feedback surfaces.
- Centralize focus-visible, disabled, pressed, keyboard parity and reduced-motion behavior.
- Separate decorative, interactive and state-critical motion.

## P2
- Polish portrait, landscape, tablet and desktop composition.
- Finish iconography, microcopy, empty states, recording timer, playback indication, quota indication and sheet transitions.

## Sequence
canonical interaction → VoiceBubble → shared components → typography/spacing → feedback → accessibility/motion → responsive → visual QA

## Out of scope
Backend/API, D1/R2, authentication, infrastructure and new product features.
