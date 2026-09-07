# FE UI Review — 2026-09-07

Backend/API is out of scope. This review covers only frontend visual and interaction quality.

## Findings

### P0 — Visual language is split
`Lobby.vue` and `RoomView.vue` still contain substantial screen-local styling and inline visual rules alongside `components/ui` primitives.

Action: migrate screen-local controls and visual states to shared primitives and semantic tokens.

### P0 — A/B/C interaction modes are exposed
The lobby exposes A/B/C mode switching and user-facing hints. These are useful for design exploration but should not remain the primary production UI.

Action: select one canonical recording interaction; keep mode switching as review/debug only or remove it.

### P1 — Voice Bubble is not yet the visual source of truth
`RoomView.vue` still owns inline bubble background, border, shadow, transform and animation rules even though `VoiceBubble` now exists.

Action: move bubble appearance, waveform surface, category color, owner state and playback glow into `VoiceBubble`.

### P1 — Typography and spacing hierarchy
Utility classes are used heavily without an enforced typography scale or layout rhythm across header, room cards, notices and controls.

Action: define and apply heading/body/meta/button scales and spacing primitives.

### P1 — Feedback hierarchy
Loading, error, notice, install and microphone banners use similar ad-hoc surfaces.

Action: standardize Notice/Banner/Empty/Error patterns with icon/text/action structure and non-color state cues.

### P1 — Accessibility states
44px targets exist in several controls, but focus, disabled, pressed and announcement behavior are not consistently centralized.

Action: standardize these in shared UI components.

### P1 — Motion discipline
Floating bubbles and transitions are expressive, but motion is split between tokens and inline styles.

Action: classify motion as decorative, interactive or state-critical; centralize reduced-motion behavior.

### P2 — Responsive composition
Mobile-first behavior is clear, but desktop remains close to a constrained mobile composition.

Action: explicitly review portrait, landscape, tablet and desktop composition, bubble-field density and fixed CTA placement.

### P2 — Product polish
Add a final polish pass for iconography, microcopy, empty states, press feedback, recording timer, playback indicator, quota indicator and sheet transitions.

## Review sequence

1. Select canonical interaction mode.
2. Make VoiceBubble the visual source of truth.
3. Replace screen-local UI with shared primitives.
4. Normalize typography, spacing and feedback.
5. Normalize accessibility and motion states.
6. Review responsive layouts.
7. Run visual QA across Lobby / Room / Sheet / Bubble / Recorder / Player.

## Out of scope

- Backend API/database/R2/D1 changes
- Authentication model changes
- Infrastructure changes
- New product features
