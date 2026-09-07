# FE UI Review

Backend/API is out of scope.

## Findings
- P0 Visual language: Lobby/Room still contain screen-local CSS and inline visual rules next to shared UI primitives.
- P0 Interaction model: A/B/C recording modes are exposed; choose one canonical production interaction and keep alternatives for review/debug only.
- P1 VoiceBubble: make the shared VoiceBubble the sole visual source for category, owner, playing, loading, error and waveform states.
- P1 Typography/spacing: unify heading/body/meta/control hierarchy and spacing rhythm.
- P1 Feedback: standardize loading/error/notice/empty/offline surfaces and actions.
- P1 Accessibility: centralize focus-visible, disabled, pressed and keyboard parity.
- P1 Motion: centralize decorative/interactive/state-critical motion and reduced-motion behavior.
- P2 Responsive: polish portrait, landscape, tablet and desktop composition, bubble density and fixed CTA behavior.
- P2 Finish: iconography, microcopy, empty states, recording timer, playback indicator, quota indicator and sheet transitions.

## Sequence
interaction choice → VoiceBubble → shared components → typography/spacing → feedback → accessibility/motion → responsive → visual QA
