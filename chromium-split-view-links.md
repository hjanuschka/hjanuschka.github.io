---
title: "Ctrl+Alt+Click: Opening Links in Split View"
category: "Chromium"
tech: "C++"
---

*Adding a new window-open disposition through the whole navigation pipeline*

**Status:** 🎉 Landed

## The Idea

Chrome's split view lets two tabs share a window side by side. There was already a way to get a link into it: right-click the link and pick "Open in split view" from the context menu. But the context menu is the slow path. The other link destinations have direct modifier gestures - Ctrl+Click for a background tab, Shift+Click for a new window - and split view had no equivalent: two clicks and a menu scan instead of one gesture.

This change adds the missing shortcut: **Ctrl+Alt+Click** (Cmd+Opt+Click on macOS) opens the link directly in a split view next to the current tab, no menu involved.

**Bug**: [456470504](https://issues.chromium.org/issues/456470504)

## Why This Touches Three Layers

A modifier-click on a link starts its life in the renderer, and the decision about what to do with it is encoded as a `WindowOpenDisposition` - `NEW_BACKGROUND_TAB`, `NEW_WINDOW`, and so on. Adding a new disposition means threading it through every layer that inspects the enum:

- <span style="background: #10b981; color: white; padding: 2px 8px; border-radius: 12px; font-size: 11px; font-weight: bold;">MERGED</span> [**Add Ctrl+Alt+Click to open links in split view**](https://crrev.com/c/7557431)
- <span style="background: #10b981; color: white; padding: 2px 8px; border-radius: 12px; font-size: 11px; font-weight: bold;">MERGED</span> [**content: allow NEW_SPLIT_VIEW renderer disposition**](https://crrev.com/c/7735743)
- <span style="background: #10b981; color: white; padding: 2px 8px; border-radius: 12px; font-size: 11px; font-weight: bold;">MERGED</span> [**Cache split-view feature check in navigation policy**](https://crrev.com/c/7776727)

1. **Blink** maps the modifier combination to `NEW_SPLIT_VIEW` in the navigation policy that classifies input events
2. **content/** carries the disposition across the renderer/browser boundary
3. **chrome/** handles it in the browser: create the neighboring tab and form the split

The main CL collected reviewers from each layer - input handling, navigation, security, and the split view feature itself - which is typical for anything that widens a cross-process enum.

## The Renderer Kill Bug

Bugs surfaced after the initial landing - and this one is the instructive kind. The browser process validates every disposition a renderer sends: anything unexpected is treated as a compromised renderer, and the process is killed with a `RFH_OPEN_URL_INVALID_DISPOSITION` bad message.

`NEW_SPLIT_VIEW` was wired into the click path, but one `OpenURL` route still reached `IsValidRendererDisposition` without the new value in its allowlist. Result: a Cmd+Opt+Click that took that route killed the renderer - the tab just crashed. The fix is a one-liner adding the disposition to the validation, plus a test asserting the navigation survives.

It is a good illustration of how the mojo boundary works in Chromium: the browser does not trust the renderer's claims, so every new enum value must be explicitly allowed everywhere it can arrive, not just where it was first plumbed.

## The Hot-Path Cleanup

A smaller cleanup also came out of post-landing review feedback: the split-view feature check was being evaluated repeatedly inside `NavigationPolicyFromEvent`, which runs for every classified input event. Computing it once and passing it down removes the repeated feature lookups from a hot path without changing behavior.

## Thanks

Special thanks to **Garry Klassen** for the help and support along the way.

Thanks to reviewers **Mike West**, **Daniel Cheng**, **Sergey Ulanov**, **ccameron**, **Darryl James**, **April Zhou**, **Rakina Zata Amni** and **Takashi Toyoshima** for reviews spanning input, content, security, and split view.

## Links

- [Chromium Bug 456470504](https://issues.chromium.org/issues/456470504)
- [WindowOpenDisposition](https://source.chromium.org/chromium/chromium/src/+/main:ui/base/window_open_disposition.h)
