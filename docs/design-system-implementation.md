# Design System Implementation

Issue: #3

## Layers

1. `ecosystem/domains/voice-bbs-web.yaml` — domain semantics and boundaries.
2. `docs/design-system.md` — visual and interaction rules.
3. `docs/ontology-ui.yaml` — semantic object to UX pattern/component mapping.
4. `apps/web-vue/src/components/ui/` — reusable Vue primitives.
5. Product components (`Lobby`, `RoomView`, `CreateRoomSheet`) consume the layer.

## Current primitives

| Primitive | Responsibility | Contract |
|---|---|---|
| `DesignButton` | action | 44px target, variants, focus, disabled, reduced motion |
| `DesignPanel` | surface | semantic surface/border tokens |
| `DesignSheet` | responsive dialog/sheet | mobile bottom sheet, desktop dialog, close affordance |
| `VoiceBubble` | primary audio object | category + playback + ownership states |

## Adoption rule

New screen-level UI should not introduce a new visual primitive inline. Add or extend a component in `components/ui`, document it in `docs/design-system.md`, and map it in `docs/ontology-ui.yaml` when it represents a domain concept.

## Verification

Before closing Issue #3, run:

```bash
npm run test
npm run typecheck
npm run build
```

Then perform visual review on mobile portrait, mobile landscape, and desktop, including keyboard focus and `prefers-reduced-motion`.
