---
title: "Moving Data Out of the Chrome Binary"
category: "Chromium"
tech: "C++ / Python"
---

*Two binary-size cleanups: the USB ID database and libphonenumber metadata*

**Status:** 🎉 Landed

## The Pattern

Chrome's binary carries a surprising amount of static data compiled directly into `.rodata`: lookup tables, generated arrays, metadata blobs. Data linked into the binary has real costs - it inflates the download, it is mapped into every process whether used or not, and on Android it counts against tightly-monitored APK size budgets (there is a whole [binary size gardening rotation](https://chromium.googlesource.com/chromium/src/+/main/docs/speed/binary_size/) watching every CL).

The fix pattern is the same in both cases here: move the data out of code and into a compressed resource, loaded lazily on first use.

## Case 1: The USB ID Database

Chrome ships a vendor/product name table derived from [usb.ids](http://www.linux-usb.org/usb-ids.html) so that WebUSB permission prompts and `chrome://usb-internals` can say "Logitech USB Receiver" instead of `046d:c52b`. That table was generated into C++ arrays and linked into the binary - hundreds of kilobytes of string data mapped into every process, used only when someone actually plugs in a device and a name lookup happens.

- <span style="background: #10b981; color: white; padding: 2px 8px; border-radius: 12px; font-size: 11px; font-weight: bold;">MERGED</span> [**usb_ids: ship lookup table as a Chrome resource instead of linking it in**](https://crrev.com/c/7880229)
- <span style="background: #10b981; color: white; padding: 2px 8px; border-radius: 12px; font-size: 11px; font-weight: bold;">MERGED</span> [**usb_ids: use the database on all Android platforms**](https://crrev.com/c/7882626)
- <span style="background: #10b981; color: white; padding: 2px 8px; border-radius: 12px; font-size: 11px; font-weight: bold;">MERGED</span> [**Add UsbIds::GetVendorAndProductName combined lookup**](https://crrev.com/c/7927286)

The resource move puts the table into a compressed entry in `resources.pak`, loaded lazily through `ui::ResourceBundle` on the first lookup. The data goes from "mapped in every process, always" to "decompressed once, only in the browser process, only if needed".

Enabling Android is the payoff: the database had been excluded from Android entirely because the size cost was unacceptable there - Android users just got raw hex IDs in their permission prompts. With the table in a compressed pak entry the cost became acceptable, and the `!IS_ANDROID` guards came out. Android now shows human-readable device names like every other platform.

A smaller inefficiency turned up after the initial landing: callers that need both vendor and product name were doing two binary searches over the vendor table; a combined lookup does one.

## Case 2: libphonenumber Metadata

The same shape of problem in a different corner: [libphonenumber](https://github.com/google/libphonenumber) (used for phone number formatting in autofill) embeds a generated metadata table describing number formats for every region on earth.

This one needed upstream work first. libphonenumber exposed its compiled-in metadata through a C-style API - `metadata_size()` plus a `const void*` accessor pointing at a static array - which structurally assumes the bytes already exist somewhere in the binary. There is no place in that contract for "decompress on first use", because nobody owns the buffer:

- <span style="background: #10b981; color: white; padding: 2px 8px; border-radius: 12px; font-size: 11px; font-weight: bold;">MERGED</span> [**Introduce MetadataBytes wrapper for compiled-in metadata accessors**](https://github.com/google/libphonenumber/pull/4016)
- <span style="background: #10b981; color: white; padding: 2px 8px; border-radius: 12px; font-size: 11px; font-weight: bold;">MERGED</span> [**Include &lt;utility&gt; for std::move in metadata_bytes.h**](https://github.com/google/libphonenumber/pull/4018)

The upstream PR replaces the raw accessors with a move-only `MetadataBytes` handle that can be either non-owning (pointing at the static array, as before - upstream behavior unchanged) or owning (a `unique_ptr` buffer plus size). That owning mode is the hook: an embedder can hand back a freshly decompressed buffer instead of a pointer into `.rodata`.

With that in place, the Chromium side becomes straightforward:

- <span style="background: #10b981; color: white; padding: 2px 8px; border-radius: 12px; font-size: 11px; font-weight: bold;">MERGED</span> [**Brotli-compress libphonenumber production metadata**](https://crrev.com/c/7928952)

The metadata is now stored brotli-compressed and decompressed on first use into an owning `MetadataBytes`. The runtime behavior is byte-identical - same protobuf bytes come out of the decompressor that used to sit uncompressed in the binary - but the normalized APK size drops. Highly-structured protobuf metadata compresses well; this kind of table is close to the best case for brotli.

**Bug**: [41124186](https://issues.chromium.org/issues/41124186) (usb_ids), [525294819](https://issues.chromium.org/issues/525294819) (libphonenumber)

## The Trade-off

This is not free. A resource load can fail in ways a linked array cannot, decompression costs CPU on first use, and the data is no longer available before the ResourceBundle is initialized. The reviews for these CLs were largely about pinning down those edges: what happens on lookup-before-init, which processes can reach the code path, and whether the lazy load belongs on the callers or inside the lookup.

For rarely-used reference data, the trade is heavily one-sided: every user pays for linked-in data on every download and every process launch; almost nobody pays the lazy-load cost, because almost nobody hits the code path.

## Thanks

Thanks to reviewers **Daniel Cheng**, **Lei Zhang**, **Reilly Grant**, **Andrew Grieve** and **Dominic Battré** for the reviews across resources, device service, and Android size tooling.

## Links

- [Chromium binary size docs](https://chromium.googlesource.com/chromium/src/+/main/docs/speed/binary_size/)
- [Chromium Bug 41124186](https://issues.chromium.org/issues/41124186)
- [Chromium Bug 525294819](https://issues.chromium.org/issues/525294819)
- [libphonenumber PR #4016: MetadataBytes wrapper](https://github.com/google/libphonenumber/pull/4016)
