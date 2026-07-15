---
title: "DevTools: Showing Why a Selector Has Its Specificity"
category: "Chromium"
tech: "C++ / TypeScript"
---

*From a bare (a,b,c) tuple to a per-part breakdown in the selector tooltip*

**Status:** 🎉 Landed

## The Problem

Hovering a selector in the DevTools Styles pane shows its specificity as a `(a, b, c)` tuple. That answers *what* the specificity is, but not *why*. For a selector like:

```css
#nav ul.menu > li:hover a[href^="https"]
```

the tooltip said `(1, 3, 3)` and left you to do the accounting yourself: which parts count as IDs? Does `:hover` go into b or c? What about `[href^="https"]`? For anyone who does not have the [specificity rules](https://developer.mozilla.org/en-US/docs/Web/CSS/Specificity) memorized - which is most people, most of the time - the tuple alone does not help debug why one rule beats another.

**Bug**: [353436867](https://issues.chromium.org/issues/353436867)

## The Fix

- <span style="background: #10b981; color: white; padding: 2px 8px; border-radius: 12px; font-size: 11px; font-weight: bold;">MERGED</span> [**Expose CSS specificity component breakdown via CDP**](https://crrev.com/c/7793254)
- <span style="background: #10b981; color: white; padding: 2px 8px; border-radius: 12px; font-size: 11px; font-weight: bold;">MERGED</span> [**Show CSS specificity breakdown in selector tooltip**](https://crrev.com/c/7645008)

The tooltip now lists which simple selectors contribute to each component:

- **a (1)**: `#nav`
- **b (3)**: `.menu`, `:hover`, `[href^="https"]`
- **c (3)**: `ul`, `li`, `a`

## Why the Breakdown Comes from Blink

The tempting shortcut is to re-parse the selector in the DevTools frontend and classify the parts in TypeScript. That approach was rejected for a simple reason: it means maintaining a second CSS selector parser that will drift from the real one.

The cases that make this hard are exactly the cases where the tooltip is useful:

- `:is()` and `:has()` take the specificity of their most specific argument
- `:where()` contributes zero, regardless of its contents
- `:not()` takes the specificity of its most specific argument, but is not a "pseudo-class" for counting purposes
- `:nth-child(2n of .foo)` combines the pseudo-class count with its selector list argument

Blink already computes all of this correctly in `CSSSelector::Specificity()`. The CDP change walks the selector the same way the engine does and attaches per-simple-selector contributions to the existing `CSS.Specificity` structure in the protocol. The frontend just renders what the engine reports - no client-side parsing, no drift.

Since it is part of the Chrome DevTools Protocol, the breakdown is also available to anything else speaking CDP - editors, linters, or other tooling that wants to explain specificity with engine-accurate numbers.

## Thanks

Thanks to reviewers **Rune Lillesveen** and **Philip Pfaffe** on the Blink/CDP side and **Jack Franklin** on the DevTools frontend side.

## Links

- [Chromium Bug 353436867](https://issues.chromium.org/issues/353436867)
- [MDN: Specificity](https://developer.mozilla.org/en-US/docs/Web/CSS/Specificity)
- [CSS Selectors Level 4: Calculating Specificity](https://www.w3.org/TR/selectors-4/#specificity-rules)
