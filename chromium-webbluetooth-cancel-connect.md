---
title: "Cancelling a Pending Web Bluetooth Connection"
category: "Chromium"
tech: "C++ / Java / Web Bluetooth"
---

*disconnect() is easy after a connection exists. The interesting case is cancelling one that never finished.*

**Status:** 🎉 Landed

## The Spec Said Cancel

The first step of Web Bluetooth's [`disconnect()`](https://webbluetoothcg.github.io/web-bluetooth/#dom-bluetoothremotegattserver-disconnect) clears the active algorithms associated with the GATT server. In practical terms, calling `disconnect()` while `gatt.connect()` is pending should reject that promise promptly with `AbortError`.

That did not reliably happen. If a known peripheral became unavailable, `gatt.connect()` could remain pending. Calling `disconnect()` did not unwind every platform backend, and a page could be left with a connection attempt that neither succeeded nor failed.

The desired sequence is:

1. Select a peripheral while it is advertising.
2. Make it unavailable and begin `gatt.connect()`.
3. Call `disconnect()`.
4. The pending promise rejects with `AbortError`.
5. A new device request and connection works without reloading the page.

The issue dates back to 2017: [40502943](https://issuetracker.google.com/issues/40502943).

## The Core Behavior

The cross-platform layer first learned that GATT disconnect cancels an ongoing connect attempt:

- <span style="background: #10b981; color: white; padding: 2px 8px; border-radius: 12px; font-size: 11px; font-weight: bold;">MERGED</span> [**GATT disconnect cancels an ongoing connect attempt**](https://chromium-review.googlesource.com/c/chromium/src/+/6798921)

That defines the browser behavior, but cancellation still has to travel through each native backend. Windows and Android fail in different ways.

## Windows: Fail the Pending Work

On Windows, cancellation has two parts: fail callbacks waiting for the GATT connection and treat a cancelled WinRT service-discovery operation as an expected result rather than tripping the async-results `DCHECK`.

- <span style="background: #10b981; color: white; padding: 2px 8px; border-radius: 12px; font-size: 11px; font-weight: bold;">MERGED</span> [**Enable pending GATT connect cancellation on Windows**](https://chromium-review.googlesource.com/c/chromium/src/+/7899473)

The important distinction is between a failed connection and a connection the caller deliberately cancelled. Both complete the pending work, but only one is an error in the backend.

## Android: The Callback That Never Arrived

Android's platform stack does not reliably deliver a disconnect callback when a connection is cancelled while it is still waiting for client registration. Chromium could request cancellation and then wait forever for notification that never came.

The practical fix is in Chromium's Android backend: when the platform does not report the cancellation, synthesize the disconnect callback and complete the pending Web Bluetooth operation.

- <span style="background: #10b981; color: white; padding: 2px 8px; border-radius: 12px; font-size: 11px; font-weight: bold;">MERGED</span> [**Enable pending GATT connect cancellation on Android**](https://chromium-review.googlesource.com/c/chromium/src/+/7964797)

That works on Android versions already in users' hands. An OS-level fix would only help devices that later receive an updated Bluetooth module.

## The AOSP Detour

Before settling on the browser-side fallback, I took the behavior all the way into Android's Bluetooth module:

- <span style="background: #6b7280; color: white; padding: 2px 8px; border-radius: 12px; font-size: 11px; font-weight: bold;">ABANDONED</span> [**AOSP: BluetoothGatt.disconnect() cancels pending connectGatt()**](https://android-review.googlesource.com/c/platform/packages/modules/Bluetooth/+/4105933)

The patch made `BluetoothGatt.disconnect()` cancel a request still waiting for client registration and report it through `onConnectionStateChange()`. It was my first Android platform patch and confirmed the platform gap, but it was not the best deployment point for this Web API behavior. Handling the missing callback in Chromium fixes current devices too.

That detour was still useful. It located the exact layer where the cancellation signal disappeared and made the trade-off explicit: platform purity versus a browser fix that reaches the installed base.

## A Peripheral Built to Disappear

Testing this requires more than a Bluetooth mock. The connection must start against a real device and then stop making progress on demand.

The [sampler](https://static.januschka.com/i-40502943/) uses ESP32-C3 firmware advertising as *dino c(h)ancler*. Serial commands start and stop advertising, disconnect the central, or enter deep sleep. That makes the pending-connect state reproducible instead of timing-dependent.

The manual test verifies not only that the promise rejects, but that cancellation leaves the adapter usable: select another peripheral and connect again without reloading.

The project page includes firmware and a patched ARM64 ChromePublic APK.

## The Takeaway

A cancellation API is not complete when it sets a flag. Every asynchronous layer must finish its pending work exactly once, even when a native platform omits the callback the browser expected.

Windows needed cancelled native work to become an ordinary completion. Android needed Chromium to synthesize the completion the OS did not send. The Web API behavior is the same; the correct backend fix is platform-specific.

## Links

- [Issue 40502943](https://issuetracker.google.com/issues/40502943)
- [Sampler, firmware, and APK](https://static.januschka.com/i-40502943/)
- [Windows backend](https://chromium-review.googlesource.com/c/chromium/src/+/7899473)
- [Android backend](https://chromium-review.googlesource.com/c/chromium/src/+/7964797)
- [AOSP detour](https://android-review.googlesource.com/c/platform/packages/modules/Bluetooth/+/4105933)
- [Web Bluetooth disconnect specification](https://webbluetoothcg.github.io/web-bluetooth/#dom-bluetoothremotegattserver-disconnect)
