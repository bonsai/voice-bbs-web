# FE UI Review Note

Backend/API changes are explicitly out of scope for this work.

P0: screen-local CSS and inline styles remain alongside shared UI primitives; migrate them to the Design System.
P0: A/B/C recording modes are still exposed; choose one canonical production interaction and keep alternatives for review/debug only.
P1: make VoiceBubble the visual source of truth for waveform, category, owner, playing, loading and error states.
P1: unify typography, spacing, feedback surfaces, accessibility states and motion rules.
P2: polish portrait/landscape/tablet/desktop composition and final micro-interactions.

Sequence: canonical interaction → VoiceBubble → shared components → typography/spacing → feedback → accessibility/motion → responsive → visual QA.
