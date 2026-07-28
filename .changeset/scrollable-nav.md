---
"the-burger": patch
---

Make the menu usable when the list is taller than the window.

The panel is the scroll container now. It was an auto-height fixed box with
`overflow: visible` while the page behind it was `overflow: hidden`, so anything
past the fold was unreachable: the wheel did nothing, and focusing a clipped link
could not scroll it into view either. Eight links on a landscape phone lost the
last two (WCAG 1.4.10 Reflow). `.b-nav` is `inset: 0` with `overflow-y: auto` and
`overscroll-behavior: contain`, so the list scrolls, the page behind it stays put,
and reaching the end of the list does not chain the gesture to the document. The
toggle stays pinned, so the close button can never be scrolled off screen.

Nav links now meet the 44px touch target WCAG 2.5.5 asks for. They were bare
inline `<a>` boxes 28px tall — the height of the text.

The hover indent is compositor-only. It animated `padding-inline-start`, a layout
property recalculated every frame; the indicator bar moved to the list item as a
pseudo-element so the label can slide with `translate` while the bar stays put.
Hover is also gated behind `(hover: hover) and (pointer: fine)`, so tapping a link
on a touchscreen no longer leaves it stuck in a hover state, and it runs at 0.15s
rather than the menu's 0.4s because hovering is constant and has to feel immediate.

The brand link gets the same 44px floor as the nav links; it was 28px for the same
reason they were.

Safe-area insets are honoured where the host page opts into `viewport-fit=cover`:
the toggle and the end of the list keep clear of a notch and the home indicator.
`env()` resolves to 0 otherwise, so nothing changes on other devices.
