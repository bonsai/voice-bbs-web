# Voice BBS Web — Design System

> Voice-first product UI system for `bonsai/voice-bbs-web`.
>
> **Meaning** is defined by `bonsai/ecosystem/domains/voice-bbs-web.yaml`. This document defines the visual, interaction, responsive, accessibility, and component contract used to implement that domain.

## 1. System boundary

```text
Domain Ontology
  -> Product UX Pattern
    -> Design System Primitive
      -> Vue Component
        -> Screen
          -> Evidence
```

The design system is the bridge between product meaning and implementation. It is a reusable contract, not a screenshot collection.

## 2. Principles

1. **Voice first** — audio is the primary user-generated object.
2. **Bubble is an audio object** — a voice bubble communicates identity, state, and playback affordance without depending on text.
3. **Immediate feedback** — pointer/touch/keyboard activation produces visible state feedback immediately.
4. **Minimal instruction** — affordance and state teach the interaction.
5. **Anonymous by default** — avoid persistent profile/account assumptions; device ownership is enough for the product model.
6. **Touch first** — mobile is the baseline; desktop expands density without changing semantics.
7. **Accessible state** — focus, keyboard, loading, error, empty, offline, and reduced-motion behavior are first-class.

## 3. Foundations

### 3.1 Color

Semantic tokens already implemented in `apps/web-vue/src/style.css` are the baseline:

| Token | Meaning |
|---|---|
| `bg` | application background |
| `surface` | primary elevated surface |
| `surface-2` | secondary elevated surface |
| `line` | border/divider |
| `owner` | current device's voice |
| `playing` | playback emphasis |
| `cat-want` | want category |
| `cat-search` | search category |
| `cat-trouble` | trouble category |
| `cat-motetai` | motetai category |
| `cat-none` | neutral category |

Color expresses semantic state rather than arbitrary decoration. State must remain understandable without color alone.

### 3.2 Shape

- Voice Bubble: fully circular (`radius-bubble`).
- Sheet: large rounded corners (`radius-sheet`).
- Card: medium rounded corners (`radius-card`).
- Touch controls: reuse the established shape scale; avoid one-off radii.

### 3.3 Motion

Motion exists to communicate voice state or spatial context.

- Ambient bubbles may float.
- Playback may use restrained glow/pulse.
- Recording uses a clear active indicator.
- `prefers-reduced-motion: reduce` disables non-essential animation while preserving state via static styling.

### 3.4 Typography

- Page title: strong hierarchy, concise.
- Room/category label: medium emphasis.
- Voice metadata: secondary emphasis.
- Error/help: explicit and readable.
- Never communicate an essential distinction by color alone.

### 3.5 Spacing

Use the Tailwind spacing scale consistently. A new arbitrary value requires a concrete interaction or layout reason. Repeated values should become a token or shared component rule.

### 3.6 Responsive contract

- **Mobile portrait:** primary target; one-handed use, bottom sheets, safe-area insets.
- **Mobile landscape:** preserve the bubble field and recorder/player controls.
- **Desktop:** increase room/lobby density without changing interaction semantics.

Prefer flexible layout, `min()`, `max()`, `clamp()`, and safe-area handling over device-specific hacks.

## 4. Product primitives

| Primitive | Semantic role | Core states |
|---|---|---|
| Voice Bubble | audio message | idle, focused, playing, loading, error, deleted, owner |
| Room | conversation space | active, inactive, empty |
| Voice Recorder | creates audio | idle, recording, recorded, encoding, uploading, error |
| Voice Player | plays audio | idle, loading, playing, ended, error |
| Playback State | audio lifecycle | idle, loading, playing, ended, error |
| Recording State | capture lifecycle | idle, recording, encoding, uploading, posted, error |
| Connection State | runtime connectivity | online, offline, reconnecting |
| Category | room classification | selected, unselected |
| Device Identity | anonymous ownership | current, other |

## 5. Component contract

### Button / Icon Button

States: `default`, `hover`, `active`, `focus-visible`, `disabled`, `loading`, `error`.

Touch-primary controls target at least 44×44 CSS pixels.

### Voice Bubble

Required:
- accessible name/action;
- keyboard activation equivalent to pointer activation;
- visible focus state;
- state indication that does not depend only on animation or color;
- owner styling that is not the only ownership signal.

### Room Card

Communicates room title, category, activity, and entry affordance. Decorative effects may be disabled without losing meaning.

### Recorder

```text
idle -> recording -> recorded -> encoding -> uploading -> posted
                     \-> error -> retry
```

Permission denial, unsupported microphone APIs, and upload failure are explicit errors.

### Player

```text
idle -> loading -> playing -> ended
                 \-> error
```

### Bottom Sheet / Dialog

- focus management appropriate to modal behavior;
- Escape closes when applicable;
- explicit close action;
- safe-area insets on mobile;
- reduced-motion support;
- does not unnecessarily obscure the primary voice interaction.

### Toast / Banner

Use for transient/contextual feedback. Blocking or destructive errors must not rely on a toast alone.

## 6. State system

Each interactive component defines the applicable subset of:

`default | hover | active | focus-visible | disabled | loading | empty | error | recording | playing | offline`

State transitions must be observable without relying only on color, motion, or sound.

## 7. UX patterns

### P1 — Discover Room

`category/query -> room list -> select room`

### P2 — Touch to Speak

`voice bubble -> pointer/keyboard activation -> immediate playback feedback`

### P3 — Record Voice

`open recorder -> permission -> record -> process -> post`

### P4 — Retry Failure

`failure -> explanation -> retry -> success/error`

### P5 — Anonymous Ownership

Current-device UI exposes only necessary ownership actions such as self-delete. Do not introduce account/profile semantics into the product without a domain change.

## 8. Accessibility

- Keyboard equivalent for every pointer interaction.
- Visible `:focus-visible` indicator.
- Native semantic controls for actions.
- Accessible names for icon-only controls.
- Do not rely on color, glow, movement, or sound alone.
- Respect `prefers-reduced-motion`.
- Maintain readable contrast for text and controls.
- Errors explain what failed and what action is possible next.

## 9. Implementation rules

1. Add/change a semantic token before introducing a repeated visual value.
2. Reuse primitives/components before creating screen-local styles.
3. Keep domain semantics in mapping/component contracts, not arbitrary CSS names.
4. `apps/web-vue` is the primary implementation surface; `apps/web-next` is legacy.
5. A new reusable pattern or state updates this document and `docs/ontology-ui.yaml`.

## 10. Single Source of Truth

| Concern | Source |
|---|---|
| Domain meaning | `bonsai/ecosystem/domains/voice-bbs-web.yaml` |
| Design rules | `docs/design-system.md` |
| Semantic tokens | `apps/web-vue/src/style.css` |
| UI mapping | `docs/ontology-ui.yaml` |
| Vue implementation | `apps/web-vue/src/components/` |

When these disagree, resolve the semantic contract first, then update implementation.

## 11. Verification

A UI change is design-system compliant when:

- its semantic primitive/pattern is identified;
- relevant states are defined;
- responsive behavior is defined;
- accessibility behavior is defined;
- existing tokens/components are reused or intentionally extended;
- tests, typecheck, and build pass;
- visual review covers at least mobile portrait and desktop.
