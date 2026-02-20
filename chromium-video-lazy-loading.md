---
title: "Lazy Loading for Video & Audio in Chrome"
category: "Chromium"
tech: "C++ / Blink"
---

*The missing piece for video-heavy pages*

**Status:** ✅ Landed in Chromium ([CL 7511253](https://crrev.com/c/7511253) merged Feb 20, 2026)

---

## The Gap

Since 2019, we've had this:

```html
<img src="photo.jpg" loading="lazy">
```

But not this:

```html
<video src="hero.mp4" loading="lazy">  <!-- Nope -->
<audio src="podcast.mp3" loading="lazy">  <!-- Nope -->
```

Six years later, that's finally changing.

## Why It Matters

Think about:

- **Podcast platforms** — 50+ audio players on a single page
- **E-commerce** — Product videos below the fold
- **Landing pages** — Hero video plus 3 more sections with video
- **Documentation** — Embedded tutorial videos throughout

All of these eagerly load every media file upfront. Bandwidth wasted on content users might never scroll to.

## The Effort

This isn't a solo project. [Scott Jehl](https://scottjehl.com/) and the Squarespace team have been driving a proper cross-browser standardization effort:

- **HTML Spec proposal** written and submitted
- **Firefox patch** in review
- **WebKit patch** ready
- **Web Platform Tests** contributed (15+ tests)
- **Mozilla** has an official positive standards position

When Yoav Weiss posted in Chromium Slack that they needed someone for the Chrome side, I figured the Firefox patch and WPTs would make it straightforward to port. They did.

```snippet
<div style="text-align: center; margin: 20px 0;">
  <video controls playsinline style="max-width: 100%; border: 2px solid var(--border); border-radius: 8px;">
    <source src="/lazy-loading-demo.mp4" type="video/mp4">
  </video>
  <p style="color: var(--text-dim); font-size: 12px; margin-top: 10px;">WPTs passing in patched Chromium</p>
</div>
```

## The Behavior

```html
<video loading="lazy" poster="thumb.jpg" autoplay muted>
  <source src="video.mp4" type="video/mp4">
  <track src="captions.vtt" kind="subtitles">
</video>
```

| What | When `loading="lazy"` |
|------|----------------------|
| Video/audio source | Waits for viewport |
| Poster image | Waits for viewport |
| Track elements (captions) | Waits for viewport |
| Autoplay | Queued until visible |

Changes from `lazy` to `eager`? Triggers immediate load.

The implementation reuses Chromium's existing lazy load infrastructure—same intersection observer as images, same network-aware margins.

## Status

| Browser | Patch | Standards Position |
|---------|-------|-------------------|
| Chromium | <span style="background: #10b981; color: white; padding: 2px 8px; border-radius: 12px; font-size: 11px; font-weight: bold;">MERGED</span> [CL 7511253](https://crrev.com/c/7511253) | <span style="background: #10b981; color: white; padding: 2px 8px; border-radius: 12px; font-size: 11px; font-weight: bold;">POSITIVE</span> |
| Firefox | <span style="background: #3b82f6; color: white; padding: 2px 8px; border-radius: 12px; font-size: 11px; font-weight: bold;">IN REVIEW</span> [D278547](https://phabricator.services.mozilla.com/D278547) | <span style="background: #10b981; color: white; padding: 2px 8px; border-radius: 12px; font-size: 11px; font-weight: bold;">POSITIVE</span> |
| WebKit | Ready (not submitted) | <span style="background: #f59e0b; color: white; padding: 2px 8px; border-radius: 12px; font-size: 11px; font-weight: bold;">PENDING</span> |

## Links

**Spec:**
- <span style="background: #3b82f6; color: white; padding: 2px 8px; border-radius: 12px; font-size: 11px; font-weight: bold;">OPEN</span> [**HTML Spec PR #11980**](https://github.com/whatwg/html/pull/11980)

**Tests:**
- <span style="background: #3b82f6; color: white; padding: 2px 8px; border-radius: 12px; font-size: 11px; font-weight: bold;">OPEN</span> [**WPT PR #57051**](https://github.com/web-platform-tests/wpt/pull/57051)

**Tracking:**
- [Chromium 469111735](https://issues.chromium.org/issues/469111735) · [Firefox 2005072](https://bugzilla.mozilla.org/show_bug.cgi?id=2005072) · [WebKit 303995](https://bugs.webkit.org/show_bug.cgi?id=303995)

**Standards Positions:**
- [Mozilla](https://github.com/mozilla/standards-positions/issues/1325) · [WebKit](https://github.com/WebKit/standards-positions/issues/586)

---

*Thanks to Scott Jehl, Brad Frost, Zach Lisobey, and Credo Duarte at Squarespace for driving this. And as always, [Yoav Weiss](https://blog.yoav.ws/) for connecting people and pushing the web platform forward.*
