---
title: "Fixing CSS Zoom and Explicit Inheritance in Blink"
category: "Chromium"
tech: "C++ / Blink / CSS"
---

*The parent says 10px, the child says inherit, and zoom quietly turns that into the wrong number.*

**Status:** 🚧 In Review

## The Unexpected Interaction

CSS `zoom` changes the effective scale used when lengths become computed values. Explicit `inherit` copies a computed value from the parent. Put the two together and Blink has to preserve the author's value while moving it between elements with different effective zoom.

That sounds abstract, but the failure is concrete: a parent computes a length under one zoom, a child with another zoom says `inherit`, and the inherited value is scaled twice or not re-scaled when it should be. The same shared bug appeared across otherwise unrelated length properties.

## Why Property-by-Property Fixes Were Wrong

Early failures looked local: one property serialized incorrectly, another had a bad WPT expectation, SVG text decoration had a special override. Fixing each symptom would leave the inheritance machinery inconsistent.

The general fix marks properties whose computed values are affected by zoom and recomputes explicitly inherited values for the child's effective zoom. That lets the style system handle length properties as one class of problem rather than a collection of exceptions.

- <span style="background: #10b981; color: white; padding: 2px 8px; border-radius: 12px; font-size: 11px; font-weight: bold;">MERGED</span> [**Fix remaining zoom inheritance failures**](https://chromium-review.googlesource.com/c/chromium/src/+/8165187)
- <span style="background: #3b82f6; color: white; padding: 2px 8px; border-radius: 12px; font-size: 11px; font-weight: bold;">IN REVIEW</span> [**Fix explicit inheritance for all length properties**](https://chromium-review.googlesource.com/c/chromium/src/+/8249138)

## A Tree-Scope Trap in animation-timeline

`animation-timeline` exposed a second layer. Its computed-value serialization loses the tree scope attached to the original declaration. Reapplying that serialized value during explicit inheritance reached `CSSToStyleMap::MapAnimationTimeline()` without a scoped value and hit a `DCHECK`.

The fix re-scopes the serialized value to the child element's tree scope and marks the property as zoom-sensitive so pixel insets in `view()` timelines are recomputed correctly.

- <span style="background: #3b82f6; color: white; padding: 2px 8px; border-radius: 12px; font-size: 11px; font-weight: bold;">IN REVIEW</span> [**Rezoom animation-timeline on explicit inheritance**](https://chromium-review.googlesource.com/c/chromium/src/+/8252264)

## Removing an Old SVG Exception

SVG `<text>` still carried a StyleAdjuster override from the SVG Text NG transition that forced `text-decoration-thickness` to `auto`. Removing it let explicit thickness work again, and marking the property zoom-sensitive made inheritance use the child's effective zoom.

- <span style="background: #10b981; color: white; padding: 2px 8px; border-radius: 12px; font-size: 11px; font-weight: bold;">MERGED</span> [**Apply text-decoration-thickness to SVG text and zoom inheritance**](https://chromium-review.googlesource.com/c/chromium/src/+/8179313)

## Testing the Rule, Not the Examples

A computed-value harness now exercises explicit `inherit` across zoom levels. The important part is coverage at the abstraction boundary: any zoom-sensitive length property should obey the same invariant, including future properties not named in the original bug.

- <span style="background: #3b82f6; color: white; padding: 2px 8px; border-radius: 12px; font-size: 11px; font-weight: bold;">IN REVIEW</span> [**Test explicit inherit under zoom in the computed-value harness**](https://chromium-review.googlesource.com/c/chromium/src/+/8261175)

## The Takeaway

When unrelated CSS properties fail the same computed-value pattern, the property implementations are probably not the right layer to patch. The better fix is to identify the shared conversion - here, explicit inheritance across effective zoom - and teach the style system the invariant once.

## Links

- [All length properties](https://chromium-review.googlesource.com/c/chromium/src/+/8249138)
- [animation-timeline scoping and zoom](https://chromium-review.googlesource.com/c/chromium/src/+/8252264)
- [Computed-value harness](https://chromium-review.googlesource.com/c/chromium/src/+/8261175)
