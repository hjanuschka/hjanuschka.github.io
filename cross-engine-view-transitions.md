---
title: "Scoped View Transitions Across Three Engines"
category: "Web Platform"
tech: "C++ / WebKit / Gecko / WPT"
---

*Bringing `Element.startViewTransition()` to WebKit and Firefox against the same WPT suite.*

**Status:** 🚧 In Progress

## What It Looks Like

Three engines, same scenario: a scope escapes its own clip region but stays inside an ancestor's `overflow: hidden` box. Before is the unpatched / baseline build, after is the scoped-VT implementation.

```snippet
<div style="margin: 24px 0;">
  <div style="font-size: 13px; color: var(--text-muted); margin: 0 0 8px;">Firefox - Bugzilla 2075158</div>
  <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 20px;">
    <figure style="margin: 0;">
      <figcaption style="font-size: 12px; color: var(--text-muted); margin-bottom: 4px;">before (pref off)</figcaption>
      <video autoplay loop muted playsinline style="width: 100%; border: 1px solid var(--border); border-radius: 6px; background: #121212;">
        <source src="https://static.januschka.com/firefox/i-2075158/vtg-clip-before.webm" type="video/webm">
        <source src="https://static.januschka.com/firefox/i-2075158/vtg-clip-before.mp4" type="video/mp4">
      </video>
    </figure>
    <figure style="margin: 0;">
      <figcaption style="font-size: 12px; color: var(--text-muted); margin-bottom: 4px;">after (patched)</figcaption>
      <video autoplay loop muted playsinline style="width: 100%; border: 1px solid var(--border); border-radius: 6px; background: #121212;">
        <source src="https://static.januschka.com/firefox/i-2075158/vtg-clip-after.webm" type="video/webm">
        <source src="https://static.januschka.com/firefox/i-2075158/vtg-clip-after.mp4" type="video/mp4">
      </video>
    </figure>
  </div>

  <div style="font-size: 13px; color: var(--text-muted); margin: 0 0 8px;">WebKit - PR #81741</div>
  <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 20px;">
    <figure style="margin: 0;">
      <figcaption style="font-size: 12px; color: var(--text-muted); margin-bottom: 4px;">before (pref off)</figcaption>
      <video autoplay loop muted playsinline style="width: 100%; border: 1px solid var(--border); border-radius: 6px; background: #121212;">
        <source src="https://static.januschka.com/webkit/i-pr81741/before2.webm" type="video/webm">
        <source src="https://static.januschka.com/webkit/i-pr81741/before2.mp4" type="video/mp4">
      </video>
    </figure>
    <figure style="margin: 0;">
      <figcaption style="font-size: 12px; color: var(--text-muted); margin-bottom: 4px;">after (patched)</figcaption>
      <video autoplay loop muted playsinline style="width: 100%; border: 1px solid var(--border); border-radius: 6px; background: #121212;">
        <source src="https://static.januschka.com/webkit/i-pr81741/after2.webm" type="video/webm">
        <source src="https://static.januschka.com/webkit/i-pr81741/after2.mp4" type="video/mp4">
      </video>
    </figure>
  </div>

  <div style="font-size: 13px; color: var(--text-muted); margin: 0 0 8px;">Chromium - baseline on <code>main</code></div>
  <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
    <figure style="margin: 0;">
      <figcaption style="font-size: 12px; color: var(--text-muted); margin-bottom: 4px;">before</figcaption>
      <video autoplay loop muted playsinline style="width: 100%; border: 1px solid var(--border); border-radius: 6px; background: #121212;">
        <source src="https://static.januschka.com/vt/chromium/nested-clip-before.webm" type="video/webm">
        <source src="https://static.januschka.com/vt/chromium/nested-clip-before.mp4" type="video/mp4">
      </video>
    </figure>
    <figure style="margin: 0;">
      <figcaption style="font-size: 12px; color: var(--text-muted); margin-bottom: 4px;">after (same build)</figcaption>
      <video autoplay loop muted playsinline style="width: 100%; border: 1px solid var(--border); border-radius: 6px; background: #121212;">
        <source src="https://static.januschka.com/vt/chromium/nested-clip-after.webm" type="video/webm">
        <source src="https://static.januschka.com/vt/chromium/nested-clip-after.mp4" type="video/mp4">
      </video>
    </figure>
  </div>
</div>
```

Full tracking page with all four canonical scenarios per engine: <https://static.januschka.com/vt/>.

## The Feature

Level 1 ships `document.startViewTransition()`: one transition at a time, snapshotting the whole viewport. Level 2 adds `Element.startViewTransition()` so a transition can be scoped to a subtree, multiple scopes can run concurrently, and `view-transition-name` on descendants resolves per scope.

```js
const transition = card.startViewTransition(() => updateCard());
await transition.finished;
```

Spec: [css-view-transitions-2](https://drafts.csswg.org/css-view-transitions-2/). Shared test suite: `css/css-view-transitions/scoped` (93 tests at wpt [`e8ca14556268`](https://github.com/web-platform-tests/wpt/commit/e8ca145562683547fb32faa7cfa9feb4cc99054b)).

## Status

| Engine | Tracking | Suite |
|---|---|---|
| Chromium | baseline on `main`, shipped, no flag | 90/93 |
| Firefox | <span style="background: #6b7280; color: white; padding: 2px 8px; border-radius: 12px; font-size: 11px; font-weight: bold;">IN PROGRESS</span> [Bugzilla 2075158](https://bugzilla.mozilla.org/show_bug.cgi?id=2075158), Phabricator stack in prep | 90/93 |
| WebKit | <span style="background: #3b82f6; color: white; padding: 2px 8px; border-radius: 12px; font-size: 11px; font-weight: bold;">IN REVIEW</span> [PR #81741](https://github.com/WebKit/WebKit/pull/81741) | 93/93 |

Chromium and Firefox fail the same three tests: SVG root, MathML root, replaced-element root. One shared bug across three engines.

## WebKit PR

- <span style="background: #3b82f6; color: white; padding: 2px 8px; border-radius: 12px; font-size: 11px; font-weight: bold;">IN REVIEW</span> [**Add scoped view transitions (Element.startViewTransition)**](https://github.com/WebKit/WebKit/pull/81741)

~5100 added lines across `WebCore`, the inspector protocol, preference plumbing, and every scoped WPT test imported into `LayoutTests`. Passes the full suite (93/93). It stays as one branch for now to prove the end-to-end picture - style, bindings, EWS across iOS/macOS/WPE, and the full suite all green at once - then gets split into reviewable chunks before landing.

What's in it:

- `Element.startViewTransition()` with the Level 2 options bag, concurrent scopes, per-scope name resolution.
- Scope containment: remembered size, pseudo-element borders, sibling offset, display changes, MathML / SVG roots.
- Shadow DOM: `auto` name discovery across shadow trees, cross-tree morphs, nested groups, pairing/collision rules.
- Preference gate for staged rollout.

## Firefox Patches

- <span style="background: #6b7280; color: white; padding: 2px 8px; border-radius: 12px; font-size: 11px; font-weight: bold;">IN PROGRESS</span> [**Bugzilla 2075158 - Implement scoped view transitions**](https://bugzilla.mozilla.org/show_bug.cgi?id=2075158)

Implementation branch sits at 90/93 (91/93 once the WPT display-change fix below propagates). Phabricator stack is being prepared from that branch.

## Chromium

Baseline. `document.startViewTransition()` has shipped; scoped is in active implementation. For the tracking page the Chromium folder is `chromium/src@main` content_shell captures with no patch - before and after are the same clip. When a shipping scoped-VT CL is being tracked the folder gets swapped to a proper `i-<issueid>/` sampler.

## Upstream WPT

Running the same suite on three engines surfaces test issues. Two merged:

- <span style="background: #10b981; color: white; padding: 2px 8px; border-radius: 12px; font-size: 11px; font-weight: bold;">MERGED</span> [**Reftest: scope background stable under ancestor overflow clip**](https://github.com/web-platform-tests/wpt/pull/65510) - the exact scenario the videos above cover; now pinned in the suite.
- <span style="background: #10b981; color: white; padding: 2px 8px; border-radius: 12px; font-size: 11px; font-weight: bold;">MERGED</span> [**Drop `:only-child` qualifier from display-change test**](https://github.com/web-platform-tests/wpt/pull/65518) - the test was gating on a structural selector unrelated to what it was measuring. Firefox picks up one more test as a result, with no engine change.
- <span style="background: #3b82f6; color: white; padding: 2px 8px; border-radius: 12px; font-size: 11px; font-weight: bold;">IN REVIEW</span> [**Concurrent scoped transitions use own group keyframes**](https://github.com/web-platform-tests/wpt/pull/65545) - concurrent scopes produce UA group animations with colliding dynamic names (each scope's `::view-transition-group(root)`). Resolving keyframes against the wrong transition applies the other scope's captured geometry and resizes the snapshot mid-animation. `run_in_parallel.html` cannot catch this (it sets `animation: unset`); the new test asserts each group's `from` keyframe matches its own scope's captured size.

The tracking page uses the same wpt sha and the same denominator on every card. The Firefox sampler previously said WebKit was at 83/93 while WebKit itself reported 87/93; the shared number is what keeps that from happening.

## Next

- WebKit PR #81741: split into reviewable chunks and land one at a time.
- Firefox Bugzilla 2075158: finish the Phabricator stack.
- Chromium: track the shipping scoped-VT CL and swap the baseline folder to a proper issue sampler.
- Drive the three shared failures (svg / mathml / replaced-element scope roots) to zero.
