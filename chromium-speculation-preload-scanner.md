---
title: "What the Browser Sees Before the Parser"
category: "Chromium"
tech: "C++ / DevTools / Performance"
---

*Improving Speculation Rules tooling led into a second problem: the fast parser at the front of the browser was not seeing the same page as the real parser.*

**Status:** 🚧 In Review

## Two Views of the Same Page

Chromium observes a page along more than one path.

DevTools consumes browser events and turns them into an explanation a developer can use. Separately, Blink's preload scanner races ahead of the full HTML parser, recognizes likely resources, and starts fetches early.

Both are deliberately incomplete views. DevTools is a model of browser state, not the state itself. The preload scanner is a fast approximation of the tree builder. Bugs appear when either approximation drifts too far from the real thing.

## A Refresh Button That Does Not Reload

The Speculative Loads panel is event-driven. Its old **Clear speculative loads** button only cleared the frontend model; it did not cancel or clear anything in the browser process. After pressing it, the panel stayed empty until a new preloading event arrived.

Reloading the page forced new events, but destroyed exactly the state being investigated - active prerenders and current preloading decisions.

The fix adds a real **Refresh** action: reset the frontend model, re-enable the Preload CDP domain, and let the backend re-emit its current state without touching the inspected page. The old button becomes the more honest **Clear list**.

- <span style="background: #3b82f6; color: white; padding: 2px 8px; border-radius: 12px; font-size: 11px; font-weight: bold;">IN REVIEW</span> [**Add a refresh button to the Speculative Loads panel**](https://chromium-review.googlesource.com/c/chromium/src/+/8180388)

The filter is getting the same treatment. Typing `status:` or `action:` now offers values from the attempts currently in the panel, including comma-separated status lists. The suggestion builder is a pure function covered by unit tests instead of UI logic hidden inside the toolbar.

- <span style="background: #3b82f6; color: white; padding: 2px 8px; border-radius: 12px; font-size: 11px; font-weight: bold;">IN REVIEW</span> [**Add autocomplete to the Speculation Rules filter**](https://chromium-review.googlesource.com/c/chromium/src/+/7563833)

## Mobile Heuristics Without a Phone

Moderate-eagerness speculation rules use viewport-based navigation heuristics. Those were gated to Android at compile time, even though speculation rules exist on every platform. A developer using desktop DevTools mobile emulation therefore could not test the behavior they were emulating.

Enabling the predictor features on all platforms makes the heuristic reachable through mobile emulation without changing normal desktop behavior.

- <span style="background: #3b82f6; color: white; padding: 2px 8px; border-radius: 12px; font-size: 11px; font-weight: bold;">IN REVIEW</span> [**Enable mobile viewport heuristics in DevTools emulation**](https://chromium-review.googlesource.com/c/chromium/src/+/7800216)

## When the Fast Parser Disagrees

The preload scanner is not a DOM builder, but it has to mimic enough tree-building rules to identify resources correctly.

An SVG `<image>` loads from `href` or legacy `xlink:href`; `src` is irrelevant. The scanner now tracks whether it is inside SVG foreign content, gives `href` precedence, and ignores `src`.

- <span style="background: #3b82f6; color: white; padding: 2px 8px; border-radius: 12px; font-size: 11px; font-weight: bold;">IN REVIEW</span> [**Preload SVG image href and xlink:href**](https://chromium-review.googlesource.com/c/chromium/src/+/8081860)

Inside `<picture>`, a void element such as `<br>` cannot contain the following `<img>`. The real tree builder keeps that image as a direct picture child. The scanner used to leave picture mode and discard the selected `<source>`. It now follows the same structural rule.

- <span style="background: #10b981; color: white; padding: 2px 8px; border-radius: 12px; font-size: 11px; font-weight: bold;">MERGED</span> [**Ignore void elements between picture children**](https://chromium-review.googlesource.com/c/chromium/src/+/8081920)

Security constraints matter too. The experimental meta-CSP work parses `<meta http-equiv="Content-Security-Policy">` in the scanner and checks speculative requests, including nonces, rather than simply abandoning speculative parsing at the first meta policy.

- <span style="background: #3b82f6; color: white; padding: 2px 8px; border-radius: 12px; font-size: 11px; font-weight: bold;">IN REVIEW</span> [**Apply meta CSP to speculative loads**](https://chromium-review.googlesource.com/c/chromium/src/+/8081921)

## The Shared Lesson

Both halves are synchronization problems. DevTools needs a way to re-synchronize its model without destroying the page. The preload scanner needs to stay structurally synchronized with the real parser without becoming as expensive as the real parser.

Fast approximations are useful because they are incomplete. The engineering work is deciding which details they cannot afford to omit.

## Links

- [Original Speculation Rules filter post](/chromium-devtools-speculation-filter.html)
- [Panel refresh](https://chromium-review.googlesource.com/c/chromium/src/+/8180388)
- [Filter autocomplete](https://chromium-review.googlesource.com/c/chromium/src/+/7563833)
- [SVG image preloading](https://chromium-review.googlesource.com/c/chromium/src/+/8081860)
- [Meta CSP in the scanner](https://chromium-review.googlesource.com/c/chromium/src/+/8081921)
