---
title: "Touch Drag-and-Drop on Linux"
category: "Chromium"
tech: "C++ / Linux / Input"
---

*Why a long-press on Linux opens a menu instead of picking up the thing you wanted to drag*

**Status:** 🚧 In Review

## The Problem

Touch drag-and-drop behaves differently depending on the platform.

On Windows, you long-press an image with your finger and it starts a drag - the intuitive gesture. On Linux, the same long-press triggers the context menu instead, while a short press appears to start a drag. The result is that dragging by touch on Linux is inconsistent and surprising, and the context menu fights the drag gesture.

There is already a knob for this in the codebase - `touch_dragend_context_menu` - meant to control whether the context menu shows at the end of a touch drag. On Linux it was not wired to the touch drag-and-drop feature, so setting it had no useful effect.

**Bug**: [451651623](https://issues.chromium.org/issues/451651623)

## The Investigation

Two pieces decide what happens when your finger lifts after a long press:

- `touch_dragend_context_menu` in [`chrome_content_browser_client.cc`](https://source.chromium.org/chromium/chromium/src/+/main:chrome/browser/chrome_content_browser_client.cc?q=touch_dragend_context_menu) - the browser-side preference that says whether a touch drag should end in a context menu.
- `GetTouchDragEndContextMenu()` in [`gesture_manager.cc`](https://source.chromium.org/chromium/chromium/src/+/main:third_party/blink/renderer/core/input/gesture_manager.cc?q=GetTouchDragEndContextMenu) - the Blink side that consumes it.

On Windows the preference tracks the touch drag-and-drop feature, so long-press drag works and the context menu stays out of the way. On Linux the two were decoupled, which is why the gesture felt broken.

## The Fix

<span style="background: #3b82f6; color: white; padding: 2px 8px; border-radius: 12px; font-size: 11px; font-weight: bold;">IN REVIEW</span> [**Enable touch drag-and-drop defaults on Linux**](https://chromium-review.googlesource.com/c/chromium/src/+/7824980)

Make `touch_dragend_context_menu` follow `kTouchDragAndDrop` on Linux, matching the Windows behavior, so a long-press drag does what you expect instead of popping the context menu. The change adds coverage in `ChromeContentBrowserClientAIPrefsTest` so the Linux default stays tied to the feature flag and does not silently regress.

## The Demo

Long-press an image, drag it, drop it - on Linux, with the change in place. From the [interactive sampler](https://static.januschka.com/i-451651623/index.html), which also has a live drag link, drag image, and drop zone you can try yourself.

```snippet
<div class="youtube-embed">
  <iframe src="https://www.youtube.com/embed/y5j1Oq66eqQ" title="Touch drag-and-drop on Linux" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>
</div>
```

## Support Matrix

The browser-side change is only half the story. Chromium asks for touch drag-and-drop, but the compositor still has to forward touch focus correctly while a drag is in flight. On X11 and the major Wayland compositors this works; the wlroots-based compositors needed their own fixes (see below).

| Environment | Touch drag-and-drop | Notes |
|---|---|---|
| X11 (Xorg) | Supported | Works with the Chromium change |
| Wayland - GNOME (Mutter) | Supported | Works with the Chromium change |
| Wayland - Hyprland | Needs compositor fix | Upstream Hyprland patch below |
| Wayland - Sway (wlroots) | Needs compositor fix | Upstream Sway patch below |

## Upstream Compositor Fixes

wlroots-based compositors were dropping or not updating touch focus mid-drag, so the drop never reached the right surface. I sent fixes upstream so touch drag-and-drop works there too:

- <span style="background: #3b82f6; color: white; padding: 2px 8px; border-radius: 12px; font-size: 11px; font-weight: bold;">IN REVIEW</span> [**Hyprland: dnd - fix touch-driven drag-and-drop**](https://github.com/hyprwm/Hyprland/pull/15077)
- <span style="background: #3b82f6; color: white; padding: 2px 8px; border-radius: 12px; font-size: 11px; font-weight: bold;">IN REVIEW</span> [**Sway: input/seatop_down - update touch drag focus while dragging**](https://github.com/swaywm/sway/pull/9182)

## Why It Is Worth Doing

Touch on Linux desktops is increasingly common - convertibles, touchscreens, kiosk setups. Matching the established Windows gesture means one less platform-specific surprise for users and for web authors who rely on HTML5 drag-and-drop. The honest caveat in the bug still stands: Linux touch conventions are not as settled as Windows, so this aligns the obvious case (long-press to drag) while leaving room to refine the edges.

## Links

- [Chromium Bug 451651623](https://issues.chromium.org/issues/451651623)
- [Interactive sampler + demo video](https://static.januschka.com/i-451651623/index.html)
- [Hyprland PR 15077 - touch drag-and-drop fix](https://github.com/hyprwm/Hyprland/pull/15077)
- [Sway PR 9182 - update touch drag focus while dragging](https://github.com/swaywm/sway/pull/9182)
- [chrome_content_browser_client.cc - touch_dragend_context_menu](https://source.chromium.org/chromium/chromium/src/+/main:chrome/browser/chrome_content_browser_client.cc?q=touch_dragend_context_menu)
- [gesture_manager.cc - GetTouchDragEndContextMenu](https://source.chromium.org/chromium/chromium/src/+/main:third_party/blink/renderer/core/input/gesture_manager.cc?q=GetTouchDragEndContextMenu)
