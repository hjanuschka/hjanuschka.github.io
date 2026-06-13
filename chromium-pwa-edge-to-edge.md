---
title: "Edge-to-Edge for Fullscreen PWAs on Android"
category: "Chromium"
tech: "C++ / Java / Android"
---

*Getting installed fullscreen PWAs to actually reach into the notch*

**Status:** 🚧 In Review (almost landing)

## The Problem

Install a PWA that asks for the whole screen and it still does not get the whole screen.

The canonical repro is the [interop viewport demo](https://interop-2022-viewport.netlify.app/individual/pwa/cover). It is a PWA with:

- `viewport-fit=cover` in the viewport meta tag
- `display: fullscreen` in the web app manifest

Install it, launch it, and on Android it stops short of the status-bar / camera-notch region instead of drawing under it. A regular web page that calls `document.documentElement.requestFullscreen()` goes truly edge-to-edge, but the installed PWA does not.

This had been reported by authors repeatedly - the expectation is simple: a fullscreen PWA with `viewport-fit=cover` should cover the cutout area just like native fullscreen does.

**Bug**: [407420295](https://issues.chromium.org/issues/407420295)

## The Investigation

Android exposes `LAYOUT_IN_DISPLAY_CUTOUT_MODE_SHORT_EDGES` to let a window lay out into the display cutout on the short edges of the screen. Native fullscreen paths use it; the web app / activity flow did not opt in, so the PWA window was laid out with the default cutout mode and stayed below the notch.

Getting from "default" to "short edges" was not a one-line change. The edge-to-edge state on Android is plumbed through several layers - an edge-to-edge manager, a display cutout controller, and the token bookkeeping that decides when the decor fits system windows. The cutout mode had to be threaded through all of them, gated behind a flag, without disturbing the existing edge-to-edge behavior that other surfaces rely on.

## The Fix

The change landed as a stack so each layer could be reviewed and de-risked on its own:

- <span style="background: #10b981; color: white; padding: 2px 8px; border-radius: 12px; font-size: 11px; font-weight: bold;">MERGED</span> [**Android: refactor edge-to-edge manager plumbing**](https://chromium-review.googlesource.com/c/chromium/src/+/7842853)
- <span style="background: #10b981; color: white; padding: 2px 8px; border-radius: 12px; font-size: 11px; font-weight: bold;">MERGED</span> [**Hide top-toolbar hairline when content offset includes it**](https://chromium-review.googlesource.com/c/chromium/src/+/7792833)
- <span style="background: #10b981; color: white; padding: 2px 8px; border-radius: 12px; font-size: 11px; font-weight: bold;">MERGED</span> [**Android: add WebApp short-edges cutout mode flag**](https://chromium-review.googlesource.com/c/chromium/src/+/7864521)
- <span style="background: #3b82f6; color: white; padding: 2px 8px; border-radius: 12px; font-size: 11px; font-weight: bold;">IN REVIEW</span> [**Android: add short-edges plumbing to display cutout controller**](https://chromium-review.googlesource.com/c/chromium/src/+/7864522)
- <span style="background: #3b82f6; color: white; padding: 2px 8px; border-radius: 12px; font-size: 11px; font-weight: bold;">IN REVIEW</span> [**Android: enable short-edges cutout mode in webapp and activity flows**](https://chromium-review.googlesource.com/c/chromium/src/+/7689791)
- <span style="background: #3b82f6; color: white; padding: 2px 8px; border-radius: 12px; font-size: 11px; font-weight: bold;">IN REVIEW</span> [**Android: rename releaseSetDecorFitsSystemWindowToken callers to releaseEdgeToEdgeToken**](https://chromium-review.googlesource.com/c/chromium/src/+/7900354)

The controller-side CL adds support for `LAYOUT_IN_DISPLAY_CUTOUT_MODE_SHORT_EDGES` behind a delegate bit that defaults to false - a no-op on its own. The webapp/activity-flow CL is the one that actually flips fullscreen PWAs into short-edges mode. The rename CL is mechanical cleanup, moving callers off the deprecated `releaseSetDecorFitsSystemWindowToken` shim to the canonical `releaseEdgeToEdgeToken`.

## Before and After

Captured on-device from the [APK sampler](https://static.januschka.com/i-407420295/index.html). The notch row is the interesting one: unpatched stops below the cutout, patched draws under it.

```snippet
<div style="display:flex;flex-wrap:wrap;gap:24px;justify-content:center;margin:24px 0;">
  <figure style="margin:0;text-align:center;">
    <figcaption style="font-size:12px;text-transform:uppercase;letter-spacing:1px;color:#D35F5F;margin-bottom:8px;">Case 1: Fullscreen - Before</figcaption>
    <img src="https://static.januschka.com/i-407420295/case1-unpatched-notch.png" alt="Case 1 fullscreen unpatched" style="width:220px;max-width:42vw;border:2px solid #D35F5F;border-radius:10px;">
  </figure>
  <figure style="margin:0;text-align:center;">
    <figcaption style="font-size:12px;text-transform:uppercase;letter-spacing:1px;color:#6abf69;margin-bottom:8px;">Case 1: Fullscreen - After</figcaption>
    <img src="https://static.januschka.com/i-407420295/case1-patched-withnotch.png" alt="Case 1 fullscreen patched" style="width:220px;max-width:42vw;border:2px solid #6abf69;border-radius:10px;">
  </figure>
</div>
<div style="display:flex;flex-wrap:wrap;gap:24px;justify-content:center;margin:24px 0;">
  <figure style="margin:0;text-align:center;">
    <figcaption style="font-size:12px;text-transform:uppercase;letter-spacing:1px;color:#D35F5F;margin-bottom:8px;">Case 2: Standalone - Before</figcaption>
    <img src="https://static.januschka.com/i-407420295/case2-unpatched-notch.png" alt="Case 2 standalone unpatched" style="width:220px;max-width:42vw;border:2px solid #D35F5F;border-radius:10px;">
  </figure>
  <figure style="margin:0;text-align:center;">
    <figcaption style="font-size:12px;text-transform:uppercase;letter-spacing:1px;color:#6abf69;margin-bottom:8px;">Case 2: Standalone - After</figcaption>
    <img src="https://static.januschka.com/i-407420295/case2-patched-withnotch.png" alt="Case 2 standalone patched" style="width:220px;max-width:42vw;border:2px solid #6abf69;border-radius:10px;">
  </figure>
</div>
<div style="display:flex;flex-wrap:wrap;gap:24px;justify-content:center;margin:24px 0;">
  <figure style="margin:0;text-align:center;">
    <figcaption style="font-size:12px;text-transform:uppercase;letter-spacing:1px;color:#D35F5F;margin-bottom:8px;">Case 3: Backswipe - Before</figcaption>
    <img src="https://static.januschka.com/i-407420295/case3-unpatched-notch.png" alt="Case 3 backswipe unpatched" style="width:220px;max-width:42vw;border:2px solid #D35F5F;border-radius:10px;">
  </figure>
  <figure style="margin:0;text-align:center;">
    <figcaption style="font-size:12px;text-transform:uppercase;letter-spacing:1px;color:#6abf69;margin-bottom:8px;">Case 3: Backswipe - After</figcaption>
    <img src="https://static.januschka.com/i-407420295/case3-patched-withnotch.png" alt="Case 3 backswipe patched" style="width:220px;max-width:42vw;border:2px solid #6abf69;border-radius:10px;">
  </figure>
</div>
```

Case 4 (`requestFullscreen()`) already worked before the change and is unchanged - it is the control case. The sampler also has the no-notch gallery and downloadable APKs for each case.

## Thanks

Big thanks to my reviewers **Dan Murphy** and **Charles Hager** for the patient back-and-forth across the stack - the layered, flag-gated approach is a direct result of their guidance on keeping a shared Android codepath safe.

## Links

- [Chromium Bug 407420295](https://issues.chromium.org/issues/407420295)
- [APK sampler: all cases, notch + no-notch, downloads](https://static.januschka.com/i-407420295/index.html)
- [Live repro: interop viewport PWA cover demo](https://interop-2022-viewport.netlify.app/individual/pwa/cover)
- [Android LAYOUT_IN_DISPLAY_CUTOUT_MODE_SHORT_EDGES](https://developer.android.com/reference/android/view/WindowManager.LayoutParams#LAYOUT_IN_DISPLAY_CUTOUT_MODE_SHORT_EDGES)
