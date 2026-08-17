---
title: "Making Installed Web Apps Belong on the Operating System"
category: "Chromium"
tech: "C++ / Java / Web Apps"
---

*Installation is only the beginning. The browser also has to respect notches, system bars, keyboards, desktop files, and whatever macOS decides an icon should look like this year.*

**Status:** 🚧 Ongoing

## A Web App Is Still an App Window

An installed web app stops looking like a tab, but it does not stop depending on browser infrastructure. Android owns the status bar, navigation bar, display cutout, keyboard insets, and immersive mode. Linux expects a correct desktop file and icon path. macOS applies its own icon treatment.

The failures are small in isolation: invisible system-bar buttons, a one-pixel toolbar capture, content under a notch, an icon that gets masked twice. Together they are what makes an installed web app feel like a web page awkwardly pretending to be native.

## Android: Theme the Whole Window

Installed web apps already used a manifest theme color for the status bar but left the navigation bar at the platform default. The first fix reused that color for both bars and moved the update into the shared custom-tab activity so WebApps and WebAPKs followed one path.

- <span style="background: #10b981; color: white; padding: 2px 8px; border-radius: 12px; font-size: 11px; font-weight: bold;">MERGED</span> [**Color the installed web app navigation bar with the theme color**](https://chromium-review.googlesource.com/c/chromium/src/+/8077818)

Dynamic page themes exposed the next bug. Homescreen shortcuts (`ActivityType.WEBAPP`) were excluded from bright/night page theming, and edge-to-edge navigation buttons ignored the page theme entirely. A page switching to a white theme could leave white status icons and light navigation buttons invisible on white.

The system-bar appearance now follows the current page theme and updates when either the theme or edge-to-edge state changes.

- <span style="background: #10b981; color: white; padding: 2px 8px; border-radius: 12px; font-size: 11px; font-weight: bold;">MERGED</span> [**Follow page theme for system-bar appearance**](https://chromium-review.googlesource.com/c/chromium/src/+/8227486)

## Insets Are State, Not a One-Time Setup

A web app can move between fitted and edge-to-edge layouts. It can open an off-origin Custom Tab. The keyboard can resize the viewport without changing the physical display cutout. Treating system-window fitting as something configured once at activity startup breaks as soon as one of those states changes.

The edge-to-edge root wrapper now stays installed and switches whether it consumes insets. Custom Tabs restore their fitted insets after webapp cutout mode, and resizing keyboards no longer pollute CSS safe-area values.

- <span style="background: #10b981; color: white; padding: 2px 8px; border-radius: 12px; font-size: 11px; font-weight: bold;">MERGED</span> [**Support dynamic inset fitting in edge-to-edge layout**](https://chromium-review.googlesource.com/c/chromium/src/+/8117612)
- <span style="background: #10b981; color: white; padding: 2px 8px; border-radius: 12px; font-size: 11px; font-weight: bold;">MERGED</span> [**Restore Custom Tab insets after webapp cutout mode**](https://chromium-review.googlesource.com/c/chromium/src/+/8117613)
- <span style="background: #3b82f6; color: white; padding: 2px 8px; border-radius: 12px; font-size: 11px; font-weight: bold;">IN REVIEW</span> [**Fix standalone web app system-bar handling**](https://chromium-review.googlesource.com/c/chromium/src/+/8200664)

Landscape cutouts add one more state. A fitted `viewport-fit` page should remain away from the cutout; stale side insets and disconnected black segments made that unreliable. The pending fix forces cutout padding while fitted, lets system-bar colors cover overlapping insets, and clears the merged safe area instead of exposing stale values to CSS.

- <span style="background: #3b82f6; color: white; padding: 2px 8px; border-radius: 12px; font-size: 11px; font-weight: bold;">IN REVIEW</span> [**Pad fitted web apps away from the display cutout in landscape**](https://chromium-review.googlesource.com/c/chromium/src/+/8223545)

Entering immersive mode also has to reapply the cutout mode to the real Android window. Updating a copied `LayoutParams` object is not enough; without `Window.setAttributes()`, opening and closing an off-origin child Custom Tab could silently reset `shortEdges` and return the PWA to a fitted viewport.

- <span style="background: #3b82f6; color: white; padding: 2px 8px; border-radius: 12px; font-size: 11px; font-weight: bold;">IN REVIEW</span> [**Apply display cutout mode when entering immersive mode**](https://chromium-review.googlesource.com/c/chromium/src/+/8198785)

Resizing keyboards exposed a related ownership bug. The IME changes the visible viewport, but it must not leave stale physical-display safe-area padding above the keyboard. With the fix, the sampler's `interactive-widget=resizes-content` case moves from `innerHeight=914px` and 56px bottom padding to `innerHeight=572px` and 8px padding while focused; the input remains inside the 571.8px visual viewport instead of floating above an empty gap.

- <span style="background: #10b981; color: white; padding: 2px 8px; border-radius: 12px; font-size: 11px; font-weight: bold;">MERGED</span> [**Fix safe area for resizing virtual keyboards**](https://chromium-review.googlesource.com/c/chromium/src/+/8207801)

This builds directly on the [fullscreen PWA edge-to-edge work](/chromium-pwa-edge-to-edge.html).

## What the Sampler Actually Measures

The [APK sampler](https://static.januschka.com/i-407420295/) compares unpatched and patched Chromium builds on an emulator and physical Android devices. It installs real fullscreen and standalone PWAs, reads viewport metrics over CDP, and captures the Android system bars rather than cropping them away.

The original standalone case makes the bug concrete. On the Android 13 cutout emulator:

| | Unpatched | Patched |
|---|---:|---:|
| `innerHeight` | 843px | 914px |
| screen gap | 72px | 1px |
| `safe-area-inset-top` | 0px | 48px |
| `safe-area-inset-bottom` | 0px | 24px |

The unpatched app avoids the notch by shrinking the page and tells CSS there is no safe area. The patched app uses the full screen and reports the cutout and bottom inset, which is the contract `viewport-fit=cover` expects.

Four initial cases separate the PWA behavior from unrelated fullscreen code:

1. Manifest `display: fullscreen`
2. Manifest `display: standalone`
3. Back-swipe while the viewport and transient bars move
4. Regular `document.requestFullscreen()` as an unchanged baseline

That last control matters. A patch can make the target screenshot look right while accidentally changing the document fullscreen API. The sampler keeps the two paths separate.

## From Demo to Hardware Regression Suite

The [hardware regression report](https://static.januschka.com/i-407420295/regression-check.html) grew into a nine-case matrix on a Pixel 6a running Android 16, with stock Chrome 141 as the control. It covers:

- fullscreen and standalone cold launch;
- pull-to-refresh and back-swipe;
- off-origin Custom Tab entry and parent recovery;
- three-button navigation over white and black pages;
- dynamic status-bar and navigation-button contrast;
- repeated landscape `cover -> auto -> contain -> cover -> auto` transitions;
- resizing IME geometry and Chrome's keyboard accessory.

The repeated landscape cycle is especially useful. The second `cover` and `auto` captures must exactly match the first ones, catching stale padding or inset ownership that a one-way transition misses.

The latest published run is **PASS: 9 passed, 0 failed, 0 skipped**, with APKs, screenshot hashes, raw JSON metrics, ADB/CDP automation, and rerun instructions downloadable from the report. That changed this work from "looks correct on my emulator" into a reproducible regression suite.

## The One-Pixel Details

Fully hidden browser controls can rest exactly at the zero-height boundary. A guard intended to avoid unnecessary capture updates then skipped the final adjustment, leaving a 1dp toolbar hairline at the top of an installed app.

- <span style="background: #10b981; color: white; padding: 2px 8px; border-radius: 12px; font-size: 11px; font-weight: bold;">MERGED</span> [**Hide toolbar hairline capture for fully hidden controls**](https://chromium-review.googlesource.com/c/chromium/src/+/8225723)

That is the scale of native-feeling polish: one pixel is enough to reveal the browser frame.

## Desktop Integration Outside Android

On Linux, generated desktop files now point to an absolute icon already installed in the XDG icon hierarchy, rather than relying on lookup behavior that varies across desktops.

- <span style="background: #10b981; color: white; padding: 2px 8px; border-radius: 12px; font-size: 11px; font-weight: bold;">MERGED</span> [**Use an absolute Linux desktop icon path**](https://chromium-review.googlesource.com/c/chromium/src/+/8251057)

On macOS 26, the operating system applies its own icon processing. Chromium's existing mask on top of that produced a double-processed icon, so the pending change lets the new OS own the treatment while preserving masking on older releases.

- <span style="background: #3b82f6; color: white; padding: 2px 8px; border-radius: 12px; font-size: 11px; font-weight: bold;">IN REVIEW</span> [**Stop masking web app icons on macOS 26**](https://chromium-review.googlesource.com/c/chromium/src/+/8175547)

## The Takeaway

There is no single "make this web app native" switch. It is a contract with each operating system: use its insets correctly, keep icon contrast readable, restore state after transient surfaces, install assets where the shell expects them, and know when the OS wants to own the final pixels.

## Links

- [APK sampler and before/after matrix](https://static.januschka.com/i-407420295/)
- [Pixel 6a hardware regression report](https://static.januschka.com/i-407420295/regression-check.html)
- [Fullscreen PWA edge-to-edge post](/chromium-pwa-edge-to-edge.html)
- [System-bar page theming](https://chromium-review.googlesource.com/c/chromium/src/+/8227486)
- [Dynamic inset fitting](https://chromium-review.googlesource.com/c/chromium/src/+/8117612)
- [Landscape cutout padding](https://chromium-review.googlesource.com/c/chromium/src/+/8223545)
