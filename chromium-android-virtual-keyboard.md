---
title: "Debugging Android's VirtualKeyboard Geometry"
category: "Chromium"
tech: "C++ / Java"
---

*Three CLs against one moving target: what is the keyboard inset, right now?*

**Status:** 🎉 Landed

## The Problem

The [VirtualKeyboard API](https://developer.mozilla.org/en-US/docs/Web/API/VirtualKeyboard_API) gives web pages the software keyboard's geometry (`navigator.virtualKeyboard.boundingRect`, the `keyboard-inset-*` CSS env variables) so layouts can adapt instead of being blindly resized. For that to be usable, the numbers have to be right - and on Android they frequently were not.

The most thorough public documentation of just how wrong they were came from Zouhir Chahoud - a co-author of the original Virtual Keyboard API explainer at Microsoft Edge - in ["The Virtual Keyboard API Is Broken Where It Matters Most"](https://zouhir.org/blog/virtual-keyboard-api/). The post makes an uncomfortable point: Chromium is the *only* engine that ships this API at all (Safari and Firefox still have nothing, six years after the spec), and the one shipping implementation reported broken geometry in three distinct ways. It came with reproducible demos (an [overshoot detector](https://vkb-overshoot-detector-zouhir.yoyo.codes) and an [inset inspector](https://vkb-inset-inspector-zouhir.yoyo.codes)) and three filed Chromium bugs:

1. [493412612](https://issues.chromium.org/issues/493412612): `geometrychange` reports keyboard heights that spike past the final resting value, then correct - e.g. 343px, 392px, back to 343px. Any layout keyed off the value visibly jumps, and no amount of `requestAnimationFrame` discipline helps, because the source data itself is wrong
2. [493415366](https://issues.chromium.org/issues/493415366): the `keyboard-inset-*` CSS environment variables contained raw rect coordinates instead of insets - `keyboard-inset-bottom` reported the rect's bottom edge coordinate (409px) rather than the distance from the viewport's bottom edge (0px). Only `keyboard-inset-height` worked, and largely by coincidence
3. [493416495](https://issues.chromium.org/issues/493416495): `boundingRect` was in the wrong coordinate space - every vertical coordinate offset by the browser chrome height instead of being relative to the layout viewport as the spec requires

His diagnosis was blunt and correct: "It's not your code." These were platform bugs, not misuse.

On top of those three, there was a related class of transient bugs ([450752874](https://issues.chromium.org/issues/450752874)): during show/hide animations, `window.innerHeight` would briefly overshoot or undershoot the final value, firing bogus resize events mid-animation. That 392px-vs-343px overshoot in the detector demo is a 49px difference - the height of the system navigation bar, leaking into the keyboard height while insets were in flight. The transient bugs are the nastiest class: everything settles to correct values, so screenshots look fine, but pages that react to geometry events flicker through a wrong intermediate state on every keyboard show or dismiss.

The suggested workarounds all fail for structural reasons, as the article lays out: debouncing waits out the animation but defeats the entire point of a streaming geometry API, and there is no signal for "settled" - any timeout is a device-specific guess.

## The Fixes

- <span style="background: #10b981; color: white; padding: 2px 8px; border-radius: 12px; font-size: 11px; font-weight: bold;">MERGED</span> [**Fix VirtualKeyboard geometry and inset calculations on Android**](https://crrev.com/c/7686010)
- <span style="background: #10b981; color: white; padding: 2px 8px; border-radius: 12px; font-size: 11px; font-weight: bold;">MERGED</span> [**Fix transient VK innerHeight overshoot during inset transitions**](https://crrev.com/c/7691492)
- <span style="background: #10b981; color: white; padding: 2px 8px; border-radius: 12px; font-size: 11px; font-weight: bold;">MERGED</span> [**Fix transient VK innerHeight undershoot during keyboard dismiss**](https://crrev.com/c/7806510)

### Geometry: agree on a coordinate space

The geometry fix addresses all three of the filed bugs at their common root. Keyboard geometry arrives from Android as window insets, but was being consumed in a mix of coordinate spaces. The fix normalizes the overlay rect and the CSS keyboard inset values to viewport insets - making `boundingRect` actually relative to the layout viewport, and making `keyboard-inset-*` actual insets from the viewport edges as the spec requires - and subtracts the bottom system/navigation bar insets from the keyboard height. The keyboard rect should describe the keyboard, not the keyboard plus the gesture bar. Regression tests landed in three layers (base, chrome, blink) since the values cross all of them.

### Overshoot: do not compensate with stale numbers

The overshoot fix handles keyboard *appearance*. In overlay and resizes-visual modes, inset compensation could run against a layout that had not caught up yet, so `innerHeight` briefly reported a value larger than it would settle at. The fix defers and clamps the compensation during these layout races, with regression tests pinning down the intermediate inset steps - asserting not just the final value but the sequence.

### Undershoot: hold the baseline while state is in flight

The undershoot fix is the mirror image on keyboard *dismiss*: `innerHeight` would briefly dip below the final value while insets and WebContents height updated in different orders. The fix establishes a stable height baseline (gated on the keyboard visibility delegate, so it only applies in outsets mode) and clamps the WebContents height to that baseline in both directions while keyboard state is in flight.

## The Common Thread

All three bugs are the same underlying issue wearing different hats: keyboard geometry on Android is assembled from multiple asynchronous sources - window insets, WebContents size, keyboard visibility, animation state - and any consumer that reads them mid-transition sees a frankenstate. The fixes do not try to make the sources synchronous; they identify the values pages actually observe (`innerHeight`, the VK rect, CSS insets) and guarantee those never expose an intermediate combination.

Testing transient states is the hard part. A test asserting the final value passes both before and after these fixes; the regression tests here had to capture the intermediate steps to demonstrate the bug at all.

## Thanks

Thanks to **Zouhir Chahoud** for the writeup, the reproducible demos, and the precisely-filed bugs - a report that maps "the API feels broken" to three concrete, testable defects is the reason fixes like these can be scoped and verified at all. And thanks to reviewers **David Bokan**, **Daniel Cheng**, **Calder Kitagawa**, **Matthew Jones** and **David Trainor** for the reviews across blink, content, and Android UI.

## Links

- [The Virtual Keyboard API Is Broken Where It Matters Most (zouhir.org)](https://zouhir.org/blog/virtual-keyboard-api/)
- [VirtualKeyboard API on MDN](https://developer.mozilla.org/en-US/docs/Web/API/VirtualKeyboard_API)
- [Chromium Bug 493412612](https://issues.chromium.org/issues/493412612) (overshoot)
- [Chromium Bug 493415366](https://issues.chromium.org/issues/493415366) (CSS insets are not insets)
- [Chromium Bug 493416495](https://issues.chromium.org/issues/493416495) (boundingRect coordinate space)
- [Chromium Bug 450752874](https://issues.chromium.org/issues/450752874) (transient innerHeight)
