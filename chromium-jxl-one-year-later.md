---
title: "JPEG XL, One Year Later"
category: "Chromium"
tech: "Rust / C++ / Images"
---

*Getting a decoder into Chrome is one milestone. Making it behave correctly while the network delivers an image a few kilobytes at a time is the next one.*

**Status:** 🚧 Ongoing

## After the Comeback

The original [JPEG XL return to Chrome](/chromium-jxl-resurrection.html) was about integrating a memory-safe Rust decoder. Since then the work has looked less like a comeback story and more like ordinary browser engineering: partial input, paint requests arriving before headers, threading, MIME sniffing, and fuzzers.

That is a good sign. A codec starts feeling native when its bugs are the same unglamorous bugs every mature decoder has to solve.

## Making Fuzzing Part of the Upstream Loop

The biggest missing part of this story was fuzzing. Chromium already runs image decoders against hostile inputs, but fixing every finding only in the browser would leave the underlying Rust crate vulnerable for every other embedder.

The first step was adding [ClusterFuzzLite to jxl-rs](https://github.com/libjxl/jxl-rs/pull/628): short AddressSanitizer fuzz runs on pull requests and longer scheduled runs against the existing decode targets. It paid for itself almost immediately.

The first wave found arithmetic and allocation assumptions hidden behind valid Rust types:

- [An extra-channel name could underflow its remaining-length calculation](https://github.com/libjxl/jxl-rs/pull/629).
- [`SmallBuffer::refill` could overflow while extending malformed input](https://github.com/libjxl/jxl-rs/pull/633).
- [Image dimensions, patch counts, spline areas, and render-group sizes needed checked or saturating arithmetic](https://github.com/libjxl/jxl-rs/pull/638).
- [Section buffers needed fallible allocation](https://github.com/libjxl/jxl-rs/pull/614), so an allocation failure becomes a decoder error rather than a process abort.
- [Blending alpha-channel indices needed validation before rendering](https://github.com/libjxl/jxl-rs/pull/617).
- [A crafted frame-index count could request a multi-gigabyte allocation](https://github.com/libjxl/jxl-rs/pull/686), even though the remaining bytes could not possibly contain that many entries.

Rust prevents these from becoming ordinary out-of-bounds writes or use-after-free bugs. It does not automatically make a panic or an infallible multi-gigabyte allocation acceptable in a renderer. A browser decoder still has to turn arbitrary bytes into either pixels or a controlled error.

### From Crashes to Invariants

Later findings were less about one arithmetic operation and more about decoder invariants:

- [Missing reference frames must use the clipped blend width](https://github.com/libjxl/jxl-rs/pull/773), not the full image width.
- [HF section allocation must be fallible](https://github.com/libjxl/jxl-rs/pull/774).
- [Histogram indices need validation when the histogram count is not a power of two](https://github.com/libjxl/jxl-rs/pull/775).
- [A one-pixel save region must not underflow when its orientation flips X](https://github.com/libjxl/jxl-rs/pull/776).
- [A 9-byte truncated codestream must not allocate the 743 MB claimed by its TOC](https://github.com/libjxl/jxl-rs/pull/856). Section buffers now grow from bytes actually available, not declarations made by untrusted input.

That last issue came from Chromium's `blink_jxl_decoder_fuzzer`, but the reproducer and fix live in jxl-rs. This is the feedback loop I wanted: Chromium supplies production-scale fuzzing; the generic fix goes upstream; the next crate roll brings it back to Chromium.

### Fuzzing Thread Schedules Too

Once multi-threaded decoding entered the picture, bytes were no longer the only input worth fuzzing. [Shuttle](https://github.com/awslabs/shuttle) explores thread schedules deterministically, turning rare races into replayable tests.

That work found reentrant locks, incorrect read/write lock ownership, schedule-dependent border rows, and progressive output that depended on group completion order:

- [Avoid an aliased squeeze-buffer reentrant lock](https://github.com/libjxl/jxl-rs/pull/867)
- [Use floor semantics for vertically subsampled border rows](https://github.com/libjxl/jxl-rs/pull/868)
- [Take read locks for palette prediction context](https://github.com/libjxl/jxl-rs/pull/869)
- [Make scheduling sets deterministic so failed schedules replay](https://github.com/libjxl/jxl-rs/pull/870)
- [Fix smooth-unsqueeze scratch-row races](https://github.com/libjxl/jxl-rs/pull/871)
- [Clip ready rectangles before pipeline stages consume them](https://github.com/libjxl/jxl-rs/pull/873)

This is the less visible half of enabling a parallel runner. The happy path getting faster is useful; proving that output does not change with a different interleaving is what makes it shippable.

## The 4096-Byte Stall

Progressive images should render as data arrives. A page should not need the full file before showing the first useful pixels.

The jxl-rs codestream parser eagerly reads input into a 4096-byte internal buffer while parsing headers. Chromium's decode loop saw that all *external* input had been consumed and stopped calling `process()`. But jxl-rs still had buffered bytes to drain. The result: no partial image until the network delivered more than the first 4096 bytes.

The fix is subtle but simple: external input being empty does not mean the decoder has no work. Keep calling `process()` while the internal parser can make progress.

- <span style="background: #3b82f6; color: white; padding: 2px 8px; border-radius: 12px; font-size: 11px; font-weight: bold;">IN REVIEW</span> [**Fix JXL progressive rendering stalling on the first 4096 bytes**](https://chromium-review.googlesource.com/c/chromium/src/+/8257552)

A related bug happened at the other end of initialization: Chromium tried to flush partial pixels before the decoder had selected a pixel format. jxl-rs correctly aborted at an internal `unwrap()`. The browser now waits until basic image information exists before flushing.

- <span style="background: #10b981; color: white; padding: 2px 8px; border-radius: 12px; font-size: 11px; font-weight: bold;">MERGED</span> [**Do not flush partial pixels before the pixel format is set**](https://chromium-review.googlesource.com/c/chromium/src/+/7965920)

## Paint Can Arrive Before the Header

Browser image decoders do not control every call order. Paint code can ask whether an image repeats before enough bytes have arrived to parse its basic header.

The JXL path used to `CHECK` that `basic_info_` existed. A valid streaming sequence could therefore crash the renderer before the header was complete. Returning `kAnimationNone` until the information exists is both safe and consistent with an image whose animation state is not known yet.

- <span style="background: #10b981; color: white; padding: 2px 8px; border-radius: 12px; font-size: 11px; font-weight: bold;">MERGED</span> [**Fix RepetitionCount before header parsing**](https://chromium-review.googlesource.com/c/chromium/src/+/8008326)

## More Cores, Same Decoder

Large images should not decode on one core when the Rust decoder already supports parallel work. The next performance step is wiring jxl-rs's parallel runner into Chromium's decode path rather than implementing a second threading model around it.

- <span style="background: #3b82f6; color: white; padding: 2px 8px; border-radius: 12px; font-size: 11px; font-weight: bold;">IN REVIEW</span> [**Enable multi-threaded JXL decoding via the jxl-rs parallel runner**](https://chromium-review.googlesource.com/c/chromium/src/+/8177171)

The decoder itself also moved forward through the normal Rust roll from 0.4.3 to 0.5.1.

- <span style="background: #10b981; color: white; padding: 2px 8px; border-radius: 12px; font-size: 11px; font-weight: bold;">MERGED</span> [**Roll jxl-rs 0.4.3 to 0.5.1**](https://chromium-review.googlesource.com/c/chromium/src/+/8156062)

## The Less Visible Chromium Work

MIME sniffing now handles complete image data shorter than the longest known signature, stale web-test expectations are gone, and the feature flag remains available while the implementation matures. The Chromium AVIF and JXL fuzzers also dropped an invalid `timeout_per_input` option so ClusterFuzz runs the configuration it actually understands.

- <span style="background: #10b981; color: white; padding: 2px 8px; border-radius: 12px; font-size: 11px; font-weight: bold;">MERGED</span> [**Remove invalid timeout_per_input from AVIF and JXL fuzzers**](https://chromium-review.googlesource.com/c/chromium/src/+/8187036)

None of that makes a good launch screenshot. It is exactly what makes a decoder trustworthy.

## Links

- [Original: JPEG XL Returns to Chrome](/chromium-jxl-resurrection.html)
- [ClusterFuzzLite integration in jxl-rs](https://github.com/libjxl/jxl-rs/pull/628)
- [ClusterFuzz: fallible section allocation](https://github.com/libjxl/jxl-rs/pull/614)
- [Chromium fuzzer: do not trust TOC-declared allocation size](https://github.com/libjxl/jxl-rs/pull/856)
- [Shuttle concurrency fixes](https://github.com/libjxl/jxl-rs/pull/867)
- [4096-byte progressive stall](https://chromium-review.googlesource.com/c/chromium/src/+/8257552)
- [Early partial-pixel flush](https://chromium-review.googlesource.com/c/chromium/src/+/7965920)
- [RepetitionCount crash](https://chromium-review.googlesource.com/c/chromium/src/+/8008326)
- [Multi-threaded decode](https://chromium-review.googlesource.com/c/chromium/src/+/8177171)
