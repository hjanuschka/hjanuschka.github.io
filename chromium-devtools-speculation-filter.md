---
title: "Adding Filtering to DevTools Speculation Rules"
category: "Chromium"
tech: "TypeScript / DevTools"
---

*Production testing produced a small DevTools requirement: find one speculative load in a long list.*

**Status:** 🎉 Landed

## Testing Prerender Until Script

At [krone.at](https://krone.at), article navigation is a useful place to evaluate speculative loading. The site joined the [Prerender Until Script origin trial](https://developer.chrome.com/blog/prerender-until-script-origin-trial?hl=de), which allows a page to be prerendered while delaying JavaScript execution until activation.

That reduces the script side effects a site has to account for during speculation, while still doing much of the navigation work ahead of time.

## The Debugging Problem

The Speculation Rules panel in Chrome DevTools lists prefetch and prerender attempts. On a page with many candidate article links, the list quickly becomes difficult to inspect:

- no text filter for a route or URL fragment;
- no quick way to isolate a failed attempt;
- repeated visual scanning while adjusting rules.

Debugging why `/artikel/12345` was not prerendered meant searching a long list by hand.

## The Fix

After discussing the UI with [Barry Pollard](https://github.com/tunetheweb), the panel gained a text filter using the existing DevTools filtering patterns.

- <span style="background: #10b981; color: white; padding: 2px 8px; border-radius: 12px; font-size: 11px; font-weight: bold;">MERGED</span> [**Add text filter to the Speculation Rules panel**](https://chromium-review.googlesource.com/c/devtools/devtools-frontend/+/7520087)

**Bug:** [479524246](https://issues.chromium.org/issues/479524246)

## What It Changes

The filter helps with the ordinary questions that come up while testing speculation rules:

- Which URLs were considered?
- Did a specific route prefetch or prerender?
- Which attempts failed?
- Did a rule change affect the intended section of the site?

The change is intentionally small. The panel already had the relevant status and URL data; it only needed a way to narrow the visible rows.

## Collaboration

Barry helped validate the interaction and align it with existing DevTools conventions. Testing on a production site supplied the scale that made the missing filter noticeable, while review kept the solution consistent with the rest of DevTools.

## Links

- [Chromium Bug 479524246](https://issues.chromium.org/issues/479524246)
- [Add text filter to Speculation Rules panel](https://chromium-review.googlesource.com/c/devtools/devtools-frontend/+/7520087)
- [Prerender Until Script origin trial](https://developer.chrome.com/blog/prerender-until-script-origin-trial?hl=de)
- [Debugging Speculation Rules in DevTools](https://developer.chrome.com/docs/devtools/application/debugging-speculation-rules)
- [Barry Pollard on GitHub](https://github.com/tunetheweb)
