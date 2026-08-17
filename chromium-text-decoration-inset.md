---
title: "Implementing text-decoration-inset in Blink"
category: "Chromium"
tech: "C++ / Blink / CSS"
---

*A CSS property can be easy to parse and difficult to paint. Fragmentation is where the interesting part starts.*

**Status:** 🎉 Landed

## What the Property Does

`text-decoration-inset` trims or extends a text decoration at the start and end of a decorated run. It sounds like two lengths added to an underline. On one unwrapped line, it nearly is.

Blink, however, paints text in fragments. A decorated inline can wrap across lines, be split by forced breaks, live inside SVG text, and use `box-decoration-break: slice` or `clone`. Percentage insets resolve against a run whose total size may span several fragments. Paint invalidation and ink overflow must match the exact geometry.

The feature therefore landed as a vertical slice through style, paint, and overflow.

## First: Carry the Value Through Style

The first change adds parsing, computed-style storage, and `AppliedTextDecoration` plumbing behind the runtime flag. It intentionally changes no pixels. That separation matters: reviewers can validate CSS syntax, inheritance, and serialization before paint code depends on it.

- <span style="background: #10b981; color: white; padding: 2px 8px; border-radius: 12px; font-size: 11px; font-weight: bold;">MERGED</span> [**Add text-decoration-inset style support**](https://chromium-review.googlesource.com/c/chromium/src/+/7993418)

## Then: Paint Fragment Boundaries

Painting applies the start and end inset only at the boundaries of the decorated run. That means knowing whether the current inline fragment is the first, last, or an interior fragment, and whether `box-decoration-break` wants a sliced run or a cloned decoration per fragment.

The implementation carries the decoration data into paint, handles SVG fragments, and enables the WPT rendering cases that were previously expected to fail.

- <span style="background: #10b981; color: white; padding: 2px 8px; border-radius: 12px; font-size: 11px; font-weight: bold;">MERGED</span> [**Implement text-decoration-inset painting**](https://chromium-review.googlesource.com/c/chromium/src/+/7748204)

## The Hard Part: Exact Overflow

A conservative overflow rectangle is safe but wrong in visible ways: it can invalidate too much, miss negative insets that extend beyond the text, or disagree with the line that paint actually draws.

The final change gives overflow calculation the same fragment context as paint - a line cursor at the current fragment with access to neighboring fragments. Paint and ink overflow now make the same geometric decision.

Percentages were trickier. Under `box-decoration-break: slice`, an inset percentage resolves against the **total decorated run**, not each fragment. Computing that requires walking the fragment chain in both directions across soft wraps and forced breaks. If a trim is larger than one fragment, the remainder carries into the next fragment rather than being discarded.

- <span style="background: #10b981; color: white; padding: 2px 8px; border-radius: 12px; font-size: 11px; font-weight: bold;">MERGED</span> [**Resolve overflow and percentages precisely**](https://chromium-review.googlesource.com/c/chromium/src/+/8148940)

The tests cover wrapped runs, forced breaks, percentage resolution, inset accumulation, SVG fragments, and dynamic invalidation when positive or negative insets are added and removed after the first paint.

## The Takeaway

The parser was not the feature. The feature became complete when style, painting, and overflow shared the same definition of a decorated run.

That is a useful rule for rendering work: if paint needs fragment context to draw something, overflow and invalidation probably need the same context to describe it accurately.

## Links

- [Style plumbing](https://chromium-review.googlesource.com/c/chromium/src/+/7993418)
- [Painting](https://chromium-review.googlesource.com/c/chromium/src/+/7748204)
- [Exact overflow and percentage resolution](https://chromium-review.googlesource.com/c/chromium/src/+/8148940)
