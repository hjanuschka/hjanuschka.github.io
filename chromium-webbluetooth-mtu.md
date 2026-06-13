---
title: "Web Bluetooth: Exposing the Negotiated ATT MTU"
category: "Chromium"
tech: "C++ / Web Bluetooth"
---

*The 20-byte wall, and giving the web a way to ask how big its packets can actually be*

**Status:** 🚧 In Progress (WIP)

## The Problem

Web Bluetooth has a long-standing rough edge around the ATT MTU - the maximum size of a single GATT packet.

Three issues describe the same underlying gap from different angles:

- [**40686244**](https://issues.chromium.org/issues/40686244) - "20 byte MTU for web-bluetooth on Windows Chrome?" Writing a characteristic value longer than 20 bytes fails on Windows with a generic `GATT operation failed for unknown reason`, while the exact same code works on macOS.
- [**40163619**](https://issues.chromium.org/issues/40163619) - the "Exchange MTU" step from the Web Bluetooth specification was not implemented for a long time, which especially hurt Android where the default MTU is tiny.
- [**40265040**](https://issues.chromium.org/issues/40265040) - there is no way for a page to read the final negotiated MTU, so authors cannot size their writes to avoid the wall in the first place.

The 20-byte number is not arbitrary: it is the default ATT MTU of 23 bytes minus the 3-byte ATT header. Until the MTU is negotiated up, that is all you get per packet.

## The Background

Part of this story predates my involvement. The "Exchange MTU" gap (40163619) was addressed for Android by François Beaufort, who landed the larger-MTU request and later removed the experimental flag:

- <span style="background: #10b981; color: white; padding: 2px 8px; border-radius: 12px; font-size: 11px; font-weight: bold;">MERGED</span> [**Web Bluetooth: Request a larger ATT MTU on Android**](https://chromium-review.googlesource.com/c/chromium/src/+/3260011)
- <span style="background: #10b981; color: white; padding: 2px 8px; border-radius: 12px; font-size: 11px; font-weight: bold;">MERGED</span> [**Remove web-bluetooth-request-larger-mtu flag**](https://chromium-review.googlesource.com/c/chromium/src/+/3500407)

That makes the platform negotiate a bigger MTU, but it does not tell the web page what the negotiated value ended up being. Without that, authors are still guessing - chunking writes to 20 bytes "to be safe" even when the link negotiated a much larger MTU. The corresponding spec work is tracked in [WebBluetoothCG/web-bluetooth#383](https://github.com/WebBluetoothCG/web-bluetooth/issues/383).

## The Fix

<span style="background: #3b82f6; color: white; padding: 2px 8px; border-radius: 12px; font-size: 11px; font-weight: bold;">IN REVIEW</span> [**Web Bluetooth: Expose negotiated ATT MTU via getNegotiatedMTU()**](https://chromium-review.googlesource.com/c/chromium/src/+/7879985)

The change adds `BluetoothRemoteGATTCharacteristic.getNegotiatedMTU()`, giving pages a direct way to read the negotiated MTU so they can size writes accordingly instead of assuming 20 bytes. It wires up platform backends across the board:

- Windows
- Linux / ChromeOS (BlueZ)
- Android
- macOS

This is still a work in progress - the API surface and the per-platform backends are being iterated on alongside the spec discussion - but the goal is to close all three issues at once: stop the silent failures on Windows, build on the Exchange MTU work, and finally expose the negotiated value to the web.

## Test Rig and Demos

Verifying an MTU API across four platforms needs a real peripheral, not a mock. I built an [interactive sampler](https://static.januschka.com/i-40265040/index.html) backed by ESP32-C3 firmware (`ESP32C3_All_BLE_Tester`, advertised as *dino tester*) that echoes back the received length and peer MTU, so silent truncation is visible.

Launch Chrome with the feature flag so the new API is available:

```text
--enable-features=NewBLEGattSessionHandling,WebBluetooth
```

Three demos exercise the three issues:

1. **Progressive JPEG streamer** (#40163619 + #40265040) - calls `getNegotiatedMTU()`, then pulls an embedded progressive JPEG chunk-by-chunk over notifications; the browser repaints scans blurry-to-sharp as bytes arrive. Payloads are capped at 244 bytes to dodge the Chromium notification cap on macOS/CoreBluetooth.
2. **MTU conformance suite** (#40265040) - eight checks: the method exists, returns a Promise, resolves to an integer in spec range, matches the device-reported peer MTU, is idempotent, survives concurrent calls, and actually drives the maximum write size.
3. **Write-size probe** (#40686244) - writes payloads at 1, 19, 20, 21, 22, ... up to 512 bytes through both `writeValueWithResponse()` and `writeValueWithoutResponse()`, and flags any silent truncation. On Windows with an effective MTU of 517, both APIs now accept up to 512 bytes - exactly the case from the original bug.

There are also pre-built Chrome for Android APKs from CL 7879985 on the sampler page for testing on a real device.

## Links

- [Interactive sampler + ESP32-C3 firmware + APKs](https://static.januschka.com/i-40265040/index.html)
- [Chromium Bug 40265040 - getNegotiatedMTU](https://issues.chromium.org/issues/40265040)
- [Chromium Bug 40686244 - 20 byte MTU on Windows](https://issues.chromium.org/issues/40686244)
- [Chromium Bug 40163619 - Exchange MTU step](https://issues.chromium.org/issues/40163619)
- [WebBluetoothCG/web-bluetooth#383 - negotiated MTU API](https://github.com/WebBluetoothCG/web-bluetooth/issues/383)
- [Exchange MTU in the Web Bluetooth spec](https://webbluetoothcg.github.io/web-bluetooth/#ref-for-exchange-mtu)
