---
title: "Web Bluetooth: How Large Can a Write Be?"
category: "Chromium"
tech: "C++ / Web Bluetooth"
---

*The negotiated ATT MTU is protocol detail. What a page needs is the payload size it can safely send without a response.*

**Status:** 🚧 In Review

## The 20-Byte Wall

A long-running Web Bluetooth failure looked arbitrary from JavaScript. A characteristic write larger than 20 bytes failed on Windows with a generic `GATT operation failed for unknown reason`, while similar code worked on other platforms.

The number comes from Bluetooth ATT: the default MTU is 23 bytes and a write command spends 3 bytes on its header, leaving a 20-byte payload. Connections can negotiate a larger MTU, but Web Bluetooth gave the page no reliable way to choose a payload size for `writeValueWithoutResponse()`.

The result was defensive chunking: applications split everything into 20-byte writes even when the connection could carry much more.

Three old issues describe parts of the same gap:

- [40686244](https://issues.chromium.org/issues/40686244) - writes above 20 bytes failing on Windows.
- [40163619](https://issues.chromium.org/issues/40163619) - the missing Exchange MTU behavior, especially visible on Android.
- [40265040](https://issues.chromium.org/issues/40265040) - expose enough negotiated-MTU information for an application to size writes.

## Why the API Changed Shape

The first version of this work exposed the raw negotiated ATT MTU. The useful question for a page, however, is not "what was the protocol MTU?" It is:

> How many bytes may I pass to `writeValueWithoutResponse()` on this characteristic?

That became a synchronous characteristic attribute:

```js
const size = characteristic.maxWriteWithoutResponseSize;
const chunk = payload.slice(0, size);
await characteristic.writeValueWithoutResponse(chunk);
```

`maxWriteWithoutResponseSize` is seeded from the negotiated ATT MTU (normally `MTU - 3`) and updates when a platform reports an MTU change. The API exposes the practical limit rather than making every site know ATT header accounting.

- <span style="background: #3b82f6; color: white; padding: 2px 8px; border-radius: 12px; font-size: 11px; font-weight: bold;">IN REVIEW</span> [**Expose maxWriteWithoutResponseSize**](https://chromium-review.googlesource.com/c/chromium/src/+/7879985)

## Getting the Value from Each Platform

The web-facing property is small; obtaining the value consistently is not.

Windows, Android, macOS/CoreBluetooth, and Linux/ChromeOS all expose GATT connection state differently. On BlueZ, the negotiated MTU appears as the `MTU` property on `org.bluez.GattCharacteristic1` (available since BlueZ 5.62). Chromium's generated system API first needs to know that property exists before the backend can observe it.

- <span style="background: #3b82f6; color: white; padding: 2px 8px; border-radius: 12px; font-size: 11px; font-weight: bold;">IN REVIEW</span> [**system_api: Add MTU property for GattCharacteristic1**](https://chromium-review.googlesource.com/c/chromium/src/+/8224745)

Android already requests a larger MTU. That earlier work solved negotiation, but not discovery by the page:

- <span style="background: #10b981; color: white; padding: 2px 8px; border-radius: 12px; font-size: 11px; font-weight: bold;">MERGED</span> [**Request a larger ATT MTU on Android**](https://chromium-review.googlesource.com/c/chromium/src/+/3260011)
- <span style="background: #10b981; color: white; padding: 2px 8px; border-radius: 12px; font-size: 11px; font-weight: bold;">MERGED</span> [**Remove the request-larger-MTU experiment flag**](https://chromium-review.googlesource.com/c/chromium/src/+/3500407)

## Testing with a Real Peripheral

A mock can check that a property exists. It cannot prove that a 244-byte write reaches a radio intact.

The [MTU sampler](https://static.januschka.com/i-40265040/) uses an ESP32-C3 peripheral named *dino tester*. Its firmware reports the peer MTU and echoes the length, first byte, and last byte of each received write. That makes silent truncation observable.

The sampler has three tests:

### Progressive JPEG over BLE

The page reads `maxWriteWithoutResponseSize`, then pulls an embedded progressive JPEG chunk by chunk over notifications. The image moves from blurry to sharp as scans arrive. This is a useful end-to-end workload: negotiation, notifications, reassembly, and progressive decoding all have to agree.

### Attribute Conformance

The conformance page verifies that the attribute exists, is in range, matches the peripheral's peer-MTU accounting, remains stable across repeated reads, and predicts the practical write limit.

### Write-Size Probe

The probe sends deterministic payloads on both write APIs at sizes around the old boundary and up through larger negotiated limits. The ESP32 echoes the actual received length so the page can detect both explicit failures and silent truncation.

On the tested Windows path with an effective MTU of 517, writes without response can use payloads up to 514 bytes rather than being hard-coded to 20.

Run the test build with:

```text
--enable-features=NewBLEGattSessionHandling,WebBluetooth
```

The project page includes the firmware, focused test pages, and prebuilt Android APKs from the current CL.

## The Takeaway

Exposing a protocol number would have been easy. Exposing the number application code can actually use is the better API.

`maxWriteWithoutResponseSize` keeps ATT bookkeeping inside the browser, follows negotiated changes from each platform backend, and lets a site choose efficient chunks without probing by failure.

## Links

- [Interactive sampler, firmware, and APKs](https://static.januschka.com/i-40265040/)
- [Expose maxWriteWithoutResponseSize](https://chromium-review.googlesource.com/c/chromium/src/+/7879985)
- [BlueZ MTU property](https://chromium-review.googlesource.com/c/chromium/src/+/8224745)
- [Issue 40265040](https://issues.chromium.org/issues/40265040)
- [Issue 40686244](https://issues.chromium.org/issues/40686244)
- [WebBluetoothCG issue 383](https://github.com/WebBluetoothCG/web-bluetooth/issues/383)
