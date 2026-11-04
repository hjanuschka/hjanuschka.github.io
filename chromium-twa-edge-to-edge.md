---
title: "Edge-to-Edge for Trusted Web Activities"
category: "Chromium"
tech: "Java / Android"
---

*Finishing the PWA edge-to-edge story for the other kind of installed web app, and what fell out of the plumbing once TWAs joined in.*

**Status:** 🎉 Landed

## Context

[Edge-to-edge for fullscreen PWAs](/chromium-pwa-edge-to-edge.html) landed earlier this year under the `WebAppShortEdgesCutoutMode` flag. That work let installed PWAs (`ActivityType.WEBAPP`) and WebAPKs (`ActivityType.WEB_APK`) finally draw into the short-edge display cutout on Android 15+, with `viewport-fit=cover` doing what it says.

Both of those live in `WebappActivity` and carry a `WebappIntentDataProvider`. The branching that decided "does this surface get cutout mode?" boiled down to a single predicate: `isWebappOrWebApkActivity()`.

Trusted Web Activities are the third kind of installed web app on Android, and they do **not** match that predicate. A TWA launches in `CustomTabActivity` (extending `BaseCustomTabActivity`) and carries a `CustomTabIntentDataProvider`. For the cutout plumbing it was a different code path entirely.

**Bug**: [566271943](https://issues.chromium.org/issues/566271943)

## Four Half-Wired Gaps

A careful audit turned up four places where TWAs were only partly wired into the new edge-to-edge world:

1. **`WebappInsetsConsumer` was never installed.** `BaseCustomTabActivity` gated it on `isWebappOrWebApkActivity()`, which is `false` for TWAs, so `EdgeToEdgeLayoutCoordinator` kept consuming system-bar and cutout insets and padded the root view away from the notch even in `ImmersiveMode`.
2. **Activity-level edge-to-edge overrides were missing on `CustomTabActivity`.** `WebappActivity` overrides `shouldDrawEdgeToEdgeOnCreate()`, `canColorStatusBarWithEdgeToEdgeHelper()`, and `canSetTransparentStatusBarWithoutDelegate()` so `EdgeToEdgeManager` does not hold a permanent activity-level token - letting `ImmersiveModeController` and `DisplayCutoutController` drive the state dynamically. `CustomTabActivity` had none of that.
3. **Navigation-bar and theme-color observers never ran.** In `BaseCustomTabActivity#finishNativeInitialization` the theme-color and `EdgeToEdgeStateProvider` observers that call `updateNavigationBarColor()` were gated behind the same `isWebappOrWebApkActivity()` check.
4. **`DisplayCutoutTabHelper` thought TWAs were short-edges-eligible anyway.** Its `getDisplayMode()` returned `FULLSCREEN`/`STANDALONE` for TWAs, so the controller half believed short-edges mode was on while the activity half did nothing to back it up.

The two halves disagreed. The right fix was to teach both halves the same thing, behind a separate opt-in parameter so WebAPKs could ship independently.

## The Stack

The work landed as three primary CLs plus a small follow-up series.

**CL 1 - Precursor:** require `EdgeToEdgeEverywhere` and add the `enable_twa` parameter. Short-edges cutout mode now explicitly requires `EdgeToEdgeUtils.isEdgeToEdgeEverywhereEnabled()`, so excluded configurations (SDK < 30, the RealMe OEM blocklist on SDK <= 34, automotive) keep pre-feature behavior and we never run the new code without `EdgeToEdgeBaseLayout` present. An early-return in `DisplayCutoutTabHelper#setEdgeToEdgeState()` keeps non-participating activities from calling `setContentFitsWindowInsets(true)` at all.

- <span style="background: #10b981; color: white; padding: 2px 8px; border-radius: 12px; font-size: 11px; font-weight: bold;">MERGED</span> [**Android: require edge-to-edge everywhere for short-edges cutout mode**](https://chromium-review.googlesource.com/c/chromium/src/+/8497486)

**CL 2 - TWA support behind `enable_twa`.** `BaseCustomTabActivity` now gates `WebappInsetsConsumer` and the navigation-bar/theme-color observers on a shared `isShortEdgesCutoutModeEnabledForApp()` that accepts Webapp/WebAPK **and** TWA intents. `CustomTabActivity` gets the same activity-level overrides as `WebappActivity`, reusing a startup-parsed intent data provider so the intent is only parsed once. Ordinary Custom Tabs are unchanged. `DisplayCutoutTabHelper` uses the same shared check so the two halves can no longer disagree.

Two subtler things fell out of this one:

- `WebappInsetsConsumer` now only withholds display cutout insets while the window's cutout mode actually allows drawing into the cutout. A TWA client that asked for `LAYOUT_IN_DISPLAY_CUTOUT_MODE_NEVER` keeps the cutout insets, and the edge-to-edge layout still pads the notch.
- Navigation bar icon contrast was wrong while edge-to-edge. `EdgeToEdgeSystemBarColorHelper` derives icon color from the (transparent) bar color, which would reset the icons to light. `CustomTabNavigationBarController` now applies the icon color **after** the bar color.

- <span style="background: #10b981; color: white; padding: 2px 8px; border-radius: 12px; font-size: 11px; font-weight: bold;">MERGED</span> [**Android: support short-edges cutout mode for Trusted Web Activities**](https://chromium-review.googlesource.com/c/chromium/src/+/8455211)

**CL 3 - Architectural simplification.** Once short-edges mode required `EdgeToEdgeEverywhere`, `EdgeToEdgeBaseLayout` is guaranteed to be present whenever the feature is active. That means the base layout already pads the content and draws the system/cutout rectangles when `WebappInsetsConsumer` is idle, and web apps no longer need to defer the activity's edge-to-edge token at all.

So the startup plumbing came out: the cached startup intent data providers, `shouldDrawEdgeToEdgeOnCreate()`, `canColorStatusBarWithEdgeToEdgeHelper()`, `canSetTransparentStatusBarWithoutDelegate()`, and the runtime `setContentFitsWindowInsets(...)` toggling across `WebappActivity`, `CustomTabActivity`, `BaseCustomTabActivity`, and `DisplayCutoutTabHelper`. `WebappInsetsConsumer` gets its own token holder, acquired by the display cutout controller and immersive mode. The window state is no longer something startup has to guess at and later undo.

- <span style="background: #10b981; color: white; padding: 2px 8px; border-radius: 12px; font-size: 11px; font-weight: bold;">MERGED</span> [**Android: drive web app edge-to-edge insets with consumer tokens**](https://chromium-review.googlesource.com/c/chromium/src/+/8497506)

## The Fallout

Deleting the startup plumbing is where the fun bugs lived. Once the consumer owned the token, four behavior bugs showed up that the old "set it once at startup" plumbing had been accidentally hiding.

- <span style="background: #10b981; color: white; padding: 2px 8px; border-radius: 12px; font-size: 11px; font-weight: bold;">MERGED</span> [**Limit the short-edges cutout paths to app mode**](https://chromium-review.googlesource.com/c/chromium/src/+/8500680): the cutout delegate now requires app-mode UI, so an installed web app or TWA cannot keep ownership of the window's cutout state after verification fails or after leaving app mode.
- <span style="background: #10b981; color: white; padding: 2px 8px; border-radius: 12px; font-size: 11px; font-weight: bold;">MERGED</span> [**Restore the default navigation bar color when leaving edge-to-edge**](https://chromium-review.googlesource.com/c/chromium/src/+/8580149): apps without a declared nav bar color were left with a transparent bar and stale light-era button colors once the edge-to-edge token released. Fall back to the activity theme default, matching what `ChromeBaseAppCompatActivity` applies at startup.
- <span style="background: #10b981; color: white; padding: 2px 8px; border-radius: 12px; font-size: 11px; font-weight: bold;">MERGED</span> [**Clear the navigation bar divider before the bar color**](https://chromium-review.googlesource.com/c/chromium/src/+/8563798): the divider update path could re-derive and reset icon contrast if it ran after the bar color. Reordering keeps the icons stable.
- <span style="background: #10b981; color: white; padding: 2px 8px; border-radius: 12px; font-size: 11px; font-weight: bold;">MERGED</span> [**Ignore webapp insets tokens released after destroy**](https://chromium-review.googlesource.com/c/chromium/src/+/8564237): during teardown, `BaseCustomTabActivity` destroys the consumer before `destroyTabModels()` lets the display cutout controller release its token and before `ImmersiveModeController#onDestroy()` reaches lifecycle dispatch. The late releases ran `onTokenUpdate()`, notifying supplier observers on a partially destroyed activity and re-dispatching window insets after the consumer was already unregistered. Guard `onTokenUpdate()` behind a destroyed flag, and destroy the supplier alongside the consumer.

Plus a cleanup: <span style="background: #10b981; color: white; padding: 2px 8px; border-radius: 12px; font-size: 11px; font-weight: bold;">MERGED</span> [**Delete unused edge-to-edge startup color plumbing**](https://chromium-review.googlesource.com/c/chromium/src/+/8539967).

## Verification

Behavior was measured on a Pixel 6a running Android 17 against local builds:

| build | flag config | standalone TWA, `viewport-fit=cover` |
|---|---|---|
| parent CL only | any | fitted 411x816 |
| parent + TWA CL | flag off | fitted (killswitch intact) |
| parent + TWA CL | flag on, `enable_standalone` off | fitted (opt-in respected) |
| parent + TWA CL | flag on, `enable_standalone` on | full-bleed 411x914, safe areas 51/48px |

Switching the page to `viewport-fit=auto` returns to the fitted layout; `ImmersiveMode` TWAs hide the system bars with the same safe areas.

Test coverage added: `CustomTabActivityEdgeToEdgeTest` (JUnit), TWA cases in `DisplayCutoutTabHelperTest`, `WebappInsetsConsumerTest`, and an on-device `TrustedWebActivityEdgeToEdgeTest` that uses Digital Asset Links to launch a verified TWA and exercises standalone cover/auto, token release on viewport-fit reset, and immersive mode.

## Sampler

Because a TWA needs a real app to launch into, verification required an actual installable sampler APK with published asset links:

- Project page with the before/after matrix: <https://static.januschka.com/i-566271943/>
- Launcher APK (opens the probe as a DefaultMode or ImmersiveMode TWA): <https://static.januschka.com/i-566271943/app/twa-sampler-566271943.apk>
- Live probe page with `innerHeight` / `safe-area-inset-*` and cover/auto/contain switching: <https://static.januschka.com/i-566271943/twa/index.html>
- Digital Asset Links for the signing key: <https://static.januschka.com/.well-known/assetlinks.json>

With the asset links in place the sampler launches verified - no Custom Tab toolbar - and the probe can measure the real TWA window.

## Why It Was Fun

The feature itself was a few hundred lines of plumbing. The interesting part was that extending it to TWAs forced a cleanup of the whole startup contract: once two activity types needed the same behavior, the "override `shouldDrawEdgeToEdgeOnCreate()` at startup and later undo it" pattern stopped carrying its weight. Deleting it is what exposed the four follow-up bugs - a transparent nav bar here, a stale divider there, a late-release crash on teardown. Each of those had been masked by the old plumbing doing the wrong thing in the right direction.

The other half of the fun was the sampler. You cannot really test a TWA without shipping an APK that Android trusts, which meant signing, hosting asset links, and iterating on a probe page until the measurements matched expectations on real hardware. Once the matrix lit up green it was hard not to grin.

## Thanks

Thanks to:

- **Daniel Murphy** for the original bug report, the four-gap breakdown, and the 3-CL sequencing plan that turned a sprawling patch into something reviewable.
- **Charles Hager** and **Sinan Sahin** for the heavy lifting on the review side across the whole stack.
- **Adriana Ixba** for review on the TWA support CL.
