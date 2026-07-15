---
title: "Shipping Request.isReloadNavigation"
category: "Chromium"
tech: "C++ / Web Platform"
---

*A small fetch API attribute, and the full path from spec to enabled-by-default*

**Status:** 🎉 Shipped (enabled by default)

## The Gap

The Fetch spec defines [`Request.isReloadNavigation`](https://fetch.spec.whatwg.org/#dom-request-isreloadnavigation): inside a service worker, a navigation request can tell you whether it came from a reload. The attribute had been in the spec for years and Firefox already shipped it - Chromium did not, which left a hole in cross-browser service worker code.

The use case is straightforward. A service worker deciding between cache-first and network-first can treat an explicit reload as a signal that the user wants fresh content:

```js
self.addEventListener('fetch', (event) => {
  if (event.request.isReloadNavigation) {
    // User hit reload - bypass the cache
    event.respondWith(fetch(event.request));
    return;
  }
  event.respondWith(caches.match(event.request) || fetch(event.request));
});
```

Before this shipped, the common workaround was sniffing `event.request.cache === 'no-cache'` - which conflates reloads with other cache modes and does not express intent.

**Bug**: [40487194](https://issues.chromium.org/issues/40487194)

## The Implementation

- <span style="background: #10b981; color: white; padding: 2px 8px; border-radius: 12px; font-size: 11px; font-weight: bold;">MERGED</span> [**Add Request.isReloadNavigation attribute**](https://crrev.com/c/7137783)
- <span style="background: #10b981; color: white; padding: 2px 8px; border-radius: 12px; font-size: 11px; font-weight: bold;">MERGED</span> [**Ship RequestIsReloadNavigation**](https://crrev.com/c/7806333)

The interesting part is where the bit comes from. Whether a navigation is a reload is decided in the browser process, not the renderer, so the flag has to travel with the navigation:

1. The browser process classifies the navigation (`ReloadType`) and sets the flag on the request as it is handed to the renderer
2. Blink stores it on the `Request` object created for the service worker `FetchEvent`
3. The IDL attribute simply exposes the stored value - it is `false` for anything that is not a main-resource navigation request

The attribute was implemented behind a runtime feature flag, with web platform tests covering reload, non-reload navigation, and non-navigation requests.

## The Shipping Process

Landing the code is half of it. Getting it enabled by default meant the Blink launch process:

1. Implementation behind `RequestIsReloadNavigation`, off by default
2. [Intent to Ship on blink-dev](https://groups.google.com/a/chromium.org/g/blink-dev/) with spec link, interop status (Firefox: shipped, Safari: implemented in WebKit but not enabled), and WPT results
3. API owner approvals
4. The final one-line CL promoting the feature to stable

The gap between the two CLs - implementation in January, ship in May - is mostly this process, not code. For a spec-backed attribute that another engine already ships, the review is light, but it still requires the paper trail.

## Takeaway

There is a long tail of small, fully-specced web platform features that only need someone to walk them through the pipeline. The [Chromium web platform predictability](https://www.chromium.org/blink/platform-predictability/) effort tracks interop gaps like this one - most are far less work than a new feature, and each one closes a real cross-browser difference.

## Thanks

Thanks to reviewers **Adam Rice**, **Daniel Cheng**, **Alex Moshchuk**, **Crisrael Lucero** and **Mike Taylor** for the implementation and ship reviews.

## Links

- [Fetch spec: isReloadNavigation](https://fetch.spec.whatwg.org/#dom-request-isreloadnavigation)
- [Chromium Bug 40487194](https://issues.chromium.org/issues/40487194)
- [MDN: Request.isReloadNavigation](https://developer.mozilla.org/en-US/docs/Web/API/Request/isReloadNavigation)
