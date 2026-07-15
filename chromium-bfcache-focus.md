---
title: "Preserving Focus Across the Back-Forward Cache"
category: "Chromium"
tech: "C++"
---

*Pages restored from BFCache now come back with the same element focused*

**Status:** 🎉 Landed

## The Problem

The back-forward cache keeps a fully live page in memory when you navigate away, so that pressing Back restores it instantly instead of reloading. The promise is that the page comes back exactly as you left it - scroll position, form state, JavaScript state.

One thing did not survive the round trip: focus. Fill out a form, focus an input, click a link, press Back - the page is restored instantly, but the input is no longer focused. For keyboard users this means losing your place; a screen reader user is dropped back at the top of the document. This was a [years-old bug](https://issues.chromium.org/issues/40199280) with steady traffic from web developers whose focus-management code broke under BFCache.

The root cause: Blink cleared DOM focus during `pagehide`, without distinguishing a real teardown from a persisted `pagehide` (`event.persisted === true`), where the page is only being frozen into the cache.

**Bug**: [40199280](https://issues.chromium.org/issues/40199280)

## The Fix

- <span style="background: #10b981; color: white; padding: 2px 8px; border-radius: 12px; font-size: 11px; font-weight: bold;">MERGED</span> [**Preserve focus when entering the back-forward cache**](https://crrev.com/c/7829940)

The core change is small: a persisted pagehide keeps DOM focus, so the frozen document still knows which element was focused. On restore, that element is focused again - matching what Safari and Firefox already did.

## The IME Complication

Keeping renderer-side focus alive raises a browser-side problem: text input state. If an `<input>` stays focused in a cached page, the browser process must not keep treating it as the *active* text input - otherwise the IME (software keyboard, composition state) would be tracking a field in a page that is not even visible.

So the fix is deliberately asymmetric:

- **Renderer side**: DOM focus is preserved in the frozen document
- **Browser side**: the active text input target is cleared while the page is in the cache
- **On restore**: a fresh text input state update is forced, so the browser re-learns the focused field and IME state is rebuilt in sync

That last step matters. Without it, the browser and renderer disagree about the focused editable element after restore, which is exactly the kind of desync that produces "keyboard does not appear" or "typing goes nowhere" bugs on Android.

The reviewer list - BFCache, input/IME, security, and HTML - reflects how many subsystems have opinions about what "focused" means across a freeze/restore boundary.

## Testing

The change ships with tests covering the matrix: focus preserved across a cached navigation, IME state refreshed on restore, and no active-input leakage while the page is frozen. WPTs cover the web-observable part - `document.activeElement` after a persisted pageshow.

## Thanks

Thanks to reviewers **Rakina Zata Amni**, **Ken Buchanan**, **Lukasz Anforowicz** and **Joey Arhar** for reviews across BFCache, input, security, and HTML.

## Links

- [Chromium Bug 40199280](https://issues.chromium.org/issues/40199280)
- [web.dev: Back/forward cache](https://web.dev/articles/bfcache)
