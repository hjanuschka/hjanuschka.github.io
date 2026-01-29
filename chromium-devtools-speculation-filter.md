---
title: "From Origin Trial to DevTools Fix: Improving Speculation Rules Debugging"
category: "Chromium"
tech: "TypeScript / DevTools"
---

*When you're testing a Chrome origin trial and the debugging tools don't cut it, you fix them*

**Status:** 🚧 In Review

## The Context: Prerender Until Script at krone.at

At [krone.at](https://krone.at), Austria's largest news website, we're always looking for ways to make our site faster. With millions of daily pageviews and readers constantly jumping between articles, navigation speed directly impacts user experience.

When Google announced the ["Prerender Until Script" origin trial](https://developer.chrome.com/blog/prerender-until-script-origin-trial?hl=de), we jumped on it immediately.

The idea is powerful: prerender pages speculatively, but pause before executing JavaScript. This gives you the performance benefits of prerendering (instant page loads!) without the complexity of handling script side effects during speculation. When the user actually navigates, scripts run normally.

For a high-traffic news site like krone.at with thousands of article links, this is huge. We can prerender article pages as users browse the homepage or section pages, making navigation feel instant.

## The Problem: DevTools Debugging Was Painful

As we started implementing speculation rules for krone.at, I ran into a frustrating UX issue. The Speculation Rules panel in Chrome DevTools (Application → Speculative loads) shows all your prefetch and prerender attempts. Great in theory.

But on a real site with many speculation rules, finding specific entries becomes a nightmare:
- **No filtering** - just a long list of URLs
- **No search** - want to find all failed attempts? Scroll through everything
- **No way to focus** - debugging a specific route means visual scanning

When you're trying to debug why `/artikel/12345` isn't prerendering correctly, scrolling through hundreds of entries isn't fun.

## The Fix: Text Filter for Speculation Rules Panel

I reached out to [Barry Pollard](https://github.com/tunetheweb) (author of the origin trial blog post and a Chrome performance hero) who helped shape the approach. The result: a proper text filter for the Speculations panel.

**Bug**: [479524246](https://issues.chromium.org/issues/479524246)
**CL**: <span style="background: #3b82f6; color: white; padding: 2px 8px; border-radius: 12px; font-size: 11px; font-weight: bold;">IN REVIEW</span> [**Add text filter to Speculation Rules panel**](https://chromium-review.googlesource.com/c/devtools/devtools-frontend/+/7520087)

## Why This Matters

Speculation Rules are the future of web performance. With features like:
- **Prefetch** - fetch resources ahead of time
- **Prerender** - render entire pages speculatively
- **Prerender Until Script** - the new origin trial we're testing at krone.at

Good debugging tools are essential. When you're implementing these features on a production site like krone.at, you need to:
- See which URLs are being prerendered
- Debug failures quickly
- Filter to specific routes or statuses
- Verify your speculation rules work across different article types and sections

This small DevTools improvement makes that workflow much better. What started as a pain point while implementing speculation rules for krone.at became a contribution that will help every developer working with this technology.

## The Collaboration

This is a great example of how the Chrome team supports external contributors. Barry helped validate the approach and ensure the UI patterns matched DevTools conventions. The feature went from idea to implementation in days, not months.

When you're testing a Chrome origin trial and find rough edges in the tooling, file a bug, propose a fix. The team is receptive.

## Current Status

The CL is in review. Once merged, this will ship with Chrome DevTools, available to everyone debugging speculation rules.

## Try It

If you're interested in speculative prerendering:

1. Read the [Prerender Until Script blog post](https://developer.chrome.com/blog/prerender-until-script-origin-trial?hl=de)
2. Check out the [Speculation Rules documentation](https://developer.chrome.com/docs/devtools/application/debugging-speculation-rules)
3. Sign up for the origin trial if you want to test the new features

And once this CL lands, you'll have better filtering to debug your implementation!

---

**Links:**
- [Chromium Bug 479524246](https://issues.chromium.org/issues/479524246)
- <span style="background: #3b82f6; color: white; padding: 2px 8px; border-radius: 12px; font-size: 11px; font-weight: bold;">IN REVIEW</span> [**Add text filter to Speculation Rules panel**](https://chromium-review.googlesource.com/c/devtools/devtools-frontend/+/7520087)
- [Prerender Until Script Origin Trial](https://developer.chrome.com/blog/prerender-until-script-origin-trial?hl=de)
- [Debugging Speculation Rules in DevTools](https://developer.chrome.com/docs/devtools/application/debugging-speculation-rules)
- [Barry Pollard on GitHub](https://github.com/tunetheweb)
