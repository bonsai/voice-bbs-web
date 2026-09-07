# FE UI Review — 2026-09-07

Backend/API is out of scope. This review covers only frontend visual and interaction quality.

## Current assessment

The product has a strong visual identity around voice bubbles, rooms and touch-first interaction. The current Vue implementation already uses semantic surface tokens, 44px touch targets and explicit interaction states in several places.

## Findings

### P0 — Visual language is still split across implementation paths

`Lobby.vue` and `RoomView.vue` contain substantial screen-local styling and inline visual rules alongside the new `components/ui` primitives. This makes the Design System the reference, but not yet the only implementation language.

Action: migrate screen-local button/panel/sheet/bubble styling to shared primitives and semantic tokens.

### P0 — UI modes A/B/C are still visible product architecture

The lobby exposes A/B/C mode switching and user-facing hints. These are useful during design exploration but should not remain as the primary product UI once a single interaction model is selected.

Action: keep mode switching as an internal review/debug affordance or remove it from production UI; select one canonical recording interaction.

### P1 — Voice Bubble visual fidelity

`RoomView.vue` currently builds the bubble visual directly with inline `backgroundImage`, border, shadow, transform and animation rules. The new `VoiceBubble` primitive exists but is not yet the single visual source.

Action: make `VoiceBubble` own visual states, waveform surface, category color, owner state and playback glow.

### P1 — Typography and spacing hierarchy

Screen spacing is mostly utility-class driven without a clearly enforced typography scale or layout rhythm. Header, helper text, room cards, notices and controls should share a small documented hierarchy.

Action: define and apply heading/body/meta/button scales and spacing primitives.

### P1 — Feedback hierarchy

Loading, error, notice, install and microphone banners currently use similar ad-hoc surfaces. Their severity and visual priority should be distinguishable without relying only on color.

Action: standardize Notice/Banner/Empty/Error patterns with icon/text/action structure.

### P1 — Accessibility states

Several controls have 44px targets and some focus styles, but keyboard parity, disabled states and semantic state announcements are not consistently centralized.

Action: standardize focus-visible, disabled, pressed and live-region patterns in the shared UI layer.

### P1 — Motion discipline

Floating bubbles and interaction transitions create character, but motion rules are still distributed between tokens and inline styles. Reduced-motion handling should be centralized, and decorative motion should never compete with playback/recording feedback.

Action: classify motion as decorative / interactive / state-critical and apply one tokenized policy.

### P2 — Responsive composition

The implementation is mobile-first in intent, but desktop composition remains mostly a constrained mobile layout. Review the information density, maximum content width, bubble field proportions and fixed CTA placement at desktop/tablet widths.

Action: define responsive layout states for portrait, landscape and desktop rather than only breakpoint-driven width changes.

### P2 — Product polish

Small details can raise perceived quality: consistent iconography, microcopy, empty-state illustrations, press feedback, recording timer treatment, playback indicator, quota indicator and sheet transitions.

Action: perform a dedicated polish pass after structural token migration.

## Review sequence

1. Canonicalize one interaction mode.
2. Make VoiceBubble the visual source of truth.
3. Replace ad-hoc screen controls with shared UI primitives.
4. Normalize typography/spacing and feedback patterns.
5. Normalize accessibility and motion states.
6. Review responsive layouts.
7. Run visual QA across Lobby / Room / Sheet / Bubble / Recorder / Player.

## Out of scope

- Backend API/database/R2/D1 changes
- Authentication model changes
- Infrastructure changes
- New product features

