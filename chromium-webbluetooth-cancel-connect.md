---
title: "Cancelling a Pending Web Bluetooth Connect (and my first AOSP patch)"
category: "Chromium"
tech: "C++ / Java / Web Bluetooth"
---

*disconnect() should actually stop a connect() that never finished - on every platform, down to the OS*

**Status:** 🎉 Landed

**Update 15.7.2026:** ✅ Pending GATT connect cancellation is enabled on Windows and Android. The Android platform (AOSP) patch was ultimately not needed - the Chromium Android backend now handles the cancellation itself.

## The Problem

The Web Bluetooth spec is explicit: step 1 of [`disconnect()`](https://webbluetoothcg.github.io/web-bluetooth/#dom-bluetoothremotegattserver-disconnect) clears the active algorithms map to cancel any pending connections. In practice, a `gatt.connect()` aimed at a device that is not currently available would just hang, and calling `disconnect()` did not reliably cancel it.

The expected behavior is simple:

- `gatt.connect()` starts while the known device is unavailable.
- Calling `disconnect()` should make the pending promise reject promptly with `AbortError`.
- After that, `requestDevice()` and a fresh connect attempt to another device should still work - no page reload required.

This one has been open a while: [issue 40502943](https://issuetracker.google.com/issues/40502943) was filed in January 2017.

## The Background

The cross-platform core fix landed first:

- <span style="background: #10b981; color: white; padding: 2px 8px; border-radius: 12px; font-size: 11px; font-weight: bold;">MERGED</span> [**bluetooth: GATT disconnect to cancel ongoing connect attempt**](https://chromium-review.googlesource.com/c/chromium/src/+/6798921)

That wires up the general "disconnect cancels a pending connect" behavior in Chromium. But the actual cancellation has to be honored by each platform backend - and below the browser, by the OS Bluetooth stack itself.

## The Windows Backend

<span style="background: #10b981; color: white; padding: 2px 8px; border-radius: 12px; font-size: 11px; font-weight: bold;">MERGED</span> [**bluetooth: Enable pending GATT connect cancellation on Windows**](https://chromium-review.googlesource.com/c/chromium/src/+/7899473)

On Windows, a `disconnect()` during an in-flight connect needs to fail the pending connection callbacks, and the canceled WinRT service discovery has to be handled without tripping the async-results `DCHECK`. This CL makes the Windows path actually reject the pending connect instead of leaving it dangling.

## The Android Backend

<span style="background: #10b981; color: white; padding: 2px 8px; border-radius: 12px; font-size: 11px; font-weight: bold;">MERGED</span> [**bluetooth: Enable pending GATT connect cancellation on Android**](https://chromium-review.googlesource.com/c/chromium/src/+/7964797)

Android has the extra wrinkle described below: the platform does not reliably deliver a disconnect callback for a connect that was cancelled while still waiting for client registration. Rather than wait for an OS-level fix, the Chromium backend synthesizes the disconnect callback itself when the platform does not deliver one, and enables the `kWebBluetoothCancelConnect` feature on Android.

## Down to the OS: My First AOSP Patch

The most interesting part is that the fix does not stop at Chromium. On Android, `BluetoothGatt.disconnect()` did not cancel a `connectGatt()` that was still waiting for client registration - so a pending connect could not be cleanly aborted at the platform level.

That fix lives in the Android OS itself, in `packages/modules/Bluetooth`:

> [**Bluetooth: Cancel pending GATT connects**](https://android-review.googlesource.com/c/platform/packages/modules/Bluetooth/+/4105933) - make `BluetoothGatt.disconnect()` cancel a `connectGatt()` request that is still waiting for client registration, and report the cancellation through `onConnectionStateChange()`.

This was my first patch to the Android platform (AOSP), and while the review confirmed the platform gap, the change was ultimately abandoned in favor of handling the cancellation in Chromium's Android backend - synthesizing the missing disconnect callback there works on every Android version already in the field, whereas a platform fix would only help devices that receive the updated Bluetooth module. Still a useful detour: a Web Bluetooth spec line about `disconnect()` ends up reaching three layers down, into the OS Bluetooth stack, before the practical fix lands one layer up.

## The Test Rig

Verifying a "cancel" path needs a device that you can make appear and then yank away. The [sampler](https://static.januschka.com/i-40502943/) uses ESP32-C3 firmware advertising as *dino c(h)ancler* with serial commands to start/stop advertising, disconnect the central, or deep-sleep - so you can reliably create the "device went away mid-connect" condition.

The flow:

1. Select the ESP32-C3 while it is advertising.
2. Make it unavailable (stop advertising / deep sleep) and start a connect.
3. Hit **Disconnect / cancel pending connect** - the pending promise should reject with `AbortError`.
4. Confirm a fresh `requestDevice()` + connect to another device still works without reloading.

The sampler ships a patched ARM64 ChromePublic APK and the firmware source so reviewers can reproduce it on real hardware.

## Links

- [Issue 40502943 - disconnect should cancel pending connect](https://issuetracker.google.com/issues/40502943)
- [Interactive sampler + APK + firmware](https://static.januschka.com/i-40502943/)
- [AOSP CL 4105933 - Cancel pending GATT connects (Android, abandoned)](https://android-review.googlesource.com/c/platform/packages/modules/Bluetooth/+/4105933)
- [Chromium CL 7899473 - Windows backend](https://chromium-review.googlesource.com/c/chromium/src/+/7899473)
- [Chromium CL 7964797 - Android backend](https://chromium-review.googlesource.com/c/chromium/src/+/7964797)
- [Chromium CL 6798921 - core fix](https://chromium-review.googlesource.com/c/chromium/src/+/6798921)
- [Web Bluetooth spec: disconnect()](https://webbluetoothcg.github.io/web-bluetooth/#dom-bluetoothremotegattserver-disconnect)
