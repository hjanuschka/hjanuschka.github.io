---
title: "Scoped View Transitions Across Three Engines"
category: "Web Platform"
tech: "C++ / WebKit / Gecko / WPT"
---

*One feature, three engines, one shared WPT suite - bringing `Element.startViewTransition()` to WebKit and Firefox.*

**Status:** 🚧 In Progress

## The Feature

Level 1 of the View Transitions API shipped `document.startViewTransition()`: one transition at a time, snapshotting the whole viewport. Nice for page-level swaps, useless for anything smaller than the document.

Level 2 fixes that. [CSS View Transitions Module Level 2](https://drafts.csswg.org/css-view-transitions-2/) adds `Element.startViewTransition()` so a transition can be scoped to a single subtree, several of them can run concurrently, and `view-transition-name` on nested elements resolves per scope instead of globally.

```js
const transition = card.startViewTransition(() => updateCard());
await transition.finished;
```

Chromium is actively implementing scoped View Transitions on top of its existing document-level implementation. WebKit and Firefox did not have it yet. The mega-adventure: ship the same spec, judged by the same WPT suite, in all three engines.

## Project Page

The tracking page lives at **<https://static.januschka.com/vt/>**. It compares scores across engines against the same suite (`css/css-view-transitions/scoped`, 93 tests at wpt [`e8ca14556268`](https://github.com/web-platform-tests/wpt/commit/e8ca145562683547fb32faa7cfa9feb4cc99054b)) and links out to one per-engine sampler:

| Engine | Tracking | Scoped suite | Sampler |
|---|---|---|---|
| Chromium | baseline on `main` (shipped, no flag) | 90/93 | [vt/chromium/](https://static.januschka.com/vt/chromium/) |
| Firefox | Bugzilla [2075158](https://bugzilla.mozilla.org/show_bug.cgi?id=2075158), Phabricator stack in prep | 90/93 | [firefox/i-2075158/](https://static.januschka.com/firefox/i-2075158/) |
| WebKit | GitHub PR [#81741](https://github.com/WebKit/WebKit/pull/81741) | 93/93 | [webkit/i-pr81741/](https://static.januschka.com/webkit/i-pr81741/) |

Each sampler has the same four scenarios so the engines can be compared visually:

1. **`case-list`** - reorder a 3-item list with `view-transition-name` per row.
2. **`case-image`** - swap two `<img>` sources inside a scoped element.
3. **`case-nested`** - a scoped element with named descendants (checks per-scope name resolution).
4. **`case-clip`** - a transition inside a `clip-path`/`overflow: hidden` region to show scope isolation.

Every sampler also produces a short **nested-clip video pair** - a scope that escapes its own clip but stays inside an ancestor's `overflow: hidden` region. Rendered as before/after webm+mp4 so the overview page can show real motion from all three engines side by side.

## The WebKit Branch

WebKit [PR #81741](https://github.com/WebKit/WebKit/pull/81741) is the end-to-end proof: ~5100 added lines across `WebCore`, the inspector protocol, preference plumbing, and every scoped WPT test imported into `LayoutTests`. The branch passes the full `css/css-view-transitions/scoped` suite (93/93) and is intended to be split into reviewable chunks before any of it lands. Keeping it as one branch first was the only way to prove the picture actually works together: style, bindings, EWS across iOS/macOS/WPE, and the scoped suite all green at the same time.

Highlights on the WebKit side:

- `Element.startViewTransition()` with the Level 2 options bag, concurrent scopes, and per-scope name resolution.
- Scope containment tests covering remembered size, pseudo-element borders, sibling offset, display changes, and MathML / SVG roots.
- Shadow DOM: `auto` name discovery across shadow trees, cross-tree morphs, nested groups, and the pairing/collision rules.
- A new preference gate so the whole thing can roll out safely.

## The Firefox Branch

Firefox tracks the work under [Bugzilla 2075158](https://bugzilla.mozilla.org/show_bug.cgi?id=2075158). The Phabricator stack is being prepared from the implementation branch currently sitting at 90/93 on the same suite (91/93 once the pending WPT display-change fix lands upstream).

## The Chromium Baseline

Chromium is the only engine where the API already partially exists - `document.startViewTransition()` has been shipping for a while, and scoped is in active implementation. For the cross-engine page, Chromium is the baseline: `chromium/src@main` content_shell captures, no patch, so before and after are the same. When a shipping scoped-VT CL is being tracked, the folder gets swapped to a proper `i-<issueid>/` sampler.

The three failing tests at the moment are the same scope-root-kind bugs the other engines hit: SVG root, MathML root, replaced-element root. One issue in the spec/suite surface, three engines, one shared fix to make.

## Upstream WPT: Tests and Fixes

Running the same suite against three engines surfaces places where the suite itself is engine-specific or spec-ambiguous. Two WPT patches have been merged while building this project:

- <span style="background: #10b981; color: white; padding: 2px 8px; border-radius: 12px; font-size: 11px; font-weight: bold;">MERGED</span> [**[css-view-transitions] Reftest: scope background stable under ancestor overflow clip**](https://github.com/web-platform-tests/wpt/pull/65510) - new reftest for the exact scenario the nested-clip video demos cover: a scope whose content escapes its own clip region should still get painted correctly when an ancestor has `overflow: hidden`. Writing a cross-engine demo kept exposing subtle differences here, so the test now pins the behavior in the suite.
- <span style="background: #10b981; color: white; padding: 2px 8px; border-radius: 12px; font-size: 11px; font-weight: bold;">MERGED</span> [**[scoped-vt] Drop `:only-child` qualifier from display-change test**](https://github.com/web-platform-tests/wpt/pull/65518) - the `display-change-during-transition` test was accidentally gating on a structural selector unrelated to what it was trying to measure. With the qualifier dropped, Firefox picks up one more test (reaches 91/93) without any engine change, because the test is now actually measuring what the spec text describes.

The "shared denominator" rule of the tracking page exists precisely to make this kind of drift visible: the Firefox sampler used to say WebKit was at 83/93 while the WebKit sampler said 87/93, which is the kind of thing that makes cross-browser score claims meaningless. Same suite, same sha, same number on every card.

## Capture Contract

A detail that matters more than it sounds: every sampler uses the same 800x600 viewport, the same dark theme, the same four case ids, and the same file naming (`before-<case>.png`, `after-<case>.png`, nested-clip videos as webm+mp4). Each engine's thread only owns its own folder and its own row on the overview page; nobody touches another engine's captures. That lets me re-run any engine in isolation and have the overview just work.

The contract lives in [`vt/AGENTS.md`](https://static.januschka.com/vt/AGENTS.md) so a cold thread can refresh any engine's sampler without reverse-engineering the other two.

## Why

Cross-engine interop is usually tracked by dashboards that count passes against a suite that only one engine runs regularly. That gives you three numbers that look comparable but are not. Running the same tests on the same sha on all three engines, with a physical sampler page per engine and a shared contract for how screenshots are captured, makes the comparison honest. And it surfaces bugs in the suite itself, which is how the two WPT fixes above happened.

The Level 2 API is small but it unlocks a lot: scoped page updates, concurrent transitions, and shadow-tree behavior that web authors have been asking for since Level 1 shipped. Getting it into all three engines at once - against the same suite, with the same scoring - is the real adventure.

## Next

- WebKit PR #81741: split into reviewable chunks and land them one at a time.
- Firefox Bugzilla 2075158: finish the Phabricator stack and get it into review.
- Chromium: track the shipping scoped-VT CL as it lands and swap the baseline folder to a proper issue sampler.
- Drive the three remaining failures (svg / mathml / replaced-element scope roots) to zero, since all three engines fail the same three tests.

## Thanks

Thanks to:

- The **CSS Working Group** for the Level 2 spec work and reviews that keep these three engines heading toward the same picture.
- The **WPT maintainers** for turning both suite patches around quickly.
