---
title: "Fixing the DevTools Friction I Kept Running Into"
category: "Chromium"
tech: "DevTools / TypeScript"
---

*Not a single headline feature - just several moments where DevTools knew the answer but made the developer work to get it.*

**Status:** 🎉 Landed

The [CSS specificity breakdown](/chromium-devtools-specificity.html) already has its own write-up. These are the other fixes from the same stretch: payloads, storage clearing, XML documents, columns, and flame-chart search.

## Binary Request Bodies You Can Actually Inspect

The Network panel's Response tab already knew how to display binary data as Base64, hex, or UTF-8. The Payload tab did not. A binary or compressed request body therefore appeared as something between unreadable and misleading.

The request payload viewer now uses the same decoding switcher as the response viewer. This is a small addition, but it removes the need to copy bytes into a second tool just to answer "what did the page send?"

- <span style="background: #10b981; color: white; padding: 2px 8px; border-radius: 12px; font-size: 11px; font-weight: bold;">MERGED</span> [**Add Base64/Hex/UTF-8 viewing for request payloads**](https://chromium-review.googlesource.com/c/chromium/src/+/7800882)

## A Clear Button That Says What It Clears

The Storage panel scattered its storage-type checkboxes and clear action. The options now form one **Clear site data** flow, with third-party cookies next to Cookies rather than in a separate conceptual corner.

- <span style="background: #10b981; color: white; padding: 2px 8px; border-radius: 12px; font-size: 11px; font-weight: bold;">MERGED</span> [**Rework Clear site data in the Storage panel**](https://chromium-review.googlesource.com/c/chromium/src/+/7352729)

## The XML Viewer Without Replacing the Document

Showing an XML tree viewer inside an iframe had an awkward constraint: same-origin callers still expect `documentElement` to be the original XML root. Replacing the document with viewer HTML would change the page being inspected.

The viewer is rendered in a user-agent shadow tree instead. The browser gets a friendly tree UI while script continues to see the original XML document.

- <span style="background: #10b981; color: white; padding: 2px 8px; border-radius: 12px; font-size: 11px; font-weight: bold;">MERGED</span> [**Show the XML tree viewer in iframes behind a flag**](https://chromium-review.googlesource.com/c/chromium/src/+/7871092)

## Smaller Things

The Network panel keeps the Request-number column in a predictable first position, and flame-chart search now finds extension-track entries. Neither is exciting in a changelog. Both are obvious the next time you need them.

- <span style="background: #10b981; color: white; padding: 2px 8px; border-radius: 12px; font-size: 11px; font-weight: bold;">MERGED</span> [**Pin Request # to the first column**](https://chromium-review.googlesource.com/c/chromium/src/+/7983845)
- <span style="background: #10b981; color: white; padding: 2px 8px; border-radius: 12px; font-size: 11px; font-weight: bold;">MERGED</span> [**Match extension tracks in flame-chart search**](https://chromium-review.googlesource.com/c/chromium/src/+/8165189)

## The Pattern

These changes started with the same observation: the information was already present somewhere in DevTools or the browser, but the interface stopped one step before making it useful.

That is a productive way to find tooling work. Notice the moment you leave the tool - to calculate specificity, decode bytes, reload a page, or inspect raw XML elsewhere - and ask whether the missing step belongs in DevTools.

## Links

- [Dedicated post: Showing Why a Selector Has Its Specificity](/chromium-devtools-specificity.html)
- [Request payload binary viewer](https://chromium-review.googlesource.com/c/chromium/src/+/7800882)
- [Clear site data flow](https://chromium-review.googlesource.com/c/chromium/src/+/7352729)
- [XML iframe viewer](https://chromium-review.googlesource.com/c/chromium/src/+/7871092)
