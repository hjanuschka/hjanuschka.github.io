*How JPEG XL went from "obsolete" to the future of web images - and the honor of being part of its comeback*

```snippet
<div class="youtube-embed">
  <iframe src="https://www.youtube.com/embed/zVkX4bP6qSo" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
</div>
```

## The Dramatic U-Turn

In October 2022, Google declared JPEG XL "obsolete" and ripped it out of Chromium. The reason? "Insufficient ecosystem interest." Fast forward to November 2025, and Chrome's Architecture Tech Leads just announced: "We would welcome contributions to integrate a performant and memory-safe JPEG XL decoder in Chromium."

What changed in three years? Everything.

## The Tipping Point

Rick Byers' announcement on behalf of Chrome ATLs laid out the new reality:

- **Safari shipped JPEG XL support** - Apple bet on the format
- **Firefox updated their position** - Mozilla signaled support pending a Rust decoder
- **PDF standardization** - JPEG XL designated as the preferred format for HDR content in PDF
- **Developer demand** - Bug upvotes, Interop proposals, and survey data showed real interest

The ecosystem that "didn't exist" in 2022 had materialized. Chrome needed to catch up.

## Why JPEG XL Matters

JPEG XL isn't just another image format - it's the successor to JPEG with compelling advantages:

- **30-50% better compression** than JPEG at equivalent quality
- **Lossless JPEG transcoding** with ~20% size reduction (existing JPEGs get smaller for free)
- **Progressive decoding** - images load smoothly like progressive JPEGs
- **Modern features** - HDR, wide gamut, alpha channels, and animations
- **Already shipping** - Safari has it, Firefox is adding it, and it's becoming part of PDF

The web needs better images. JPEG is 30 years old. JPEG XL is what comes next.

## The Implementation Work

When Rick's announcement hit the blink-dev mailing list, the implementation work began.

### Phase 1: The C++ Implementation

The first approach used the reference implementation - libjxl in C++. Using the previous Chromium JPEG XL code as a blueprint, the implementation was updated to the latest spec:

**CL 7170439** - Full implementation with animation support (Chromium would be the first browser to support JXL animations!)

```cpp
// Integrated libjxl decoder with Blink's image pipeline
class JXLImageDecoder : public ImageDecoder {
  // Handle standard decoding
  void Decode(const uint8_t* data, size_t length);

  // Animation support - first browser to have this!
  size_t FrameCount() const override;
  cc::ImageHeaderMetadata MakeMetadataForDecodeAcceleration() const override;
};
```

Status: Feature complete, bots green, [demo video here](https://youtu.be/zVkX4bP6qSo).

But then the feedback came: "Use Rust for memory safety."

### Phase 2: The Rust Rewrite

Fair point. Chromium is moving toward memory-safe code. The pivot to jxl-rs, a pure Rust JPEG XL decoder, made sense.

**CL 7184969** - Rust-based implementation using jxl-rs

```rust
// Memory-safe decoder via CXX bindings
pub fn decode_jxl(data: &[u8]) -> Result<DecodedImage> {
    let decoder = JxlDecoder::builder()
        .build()?;
    decoder.decode_to_image(data)
}
```

The Rust decoder wasn't as performant initially, but that's where open source collaboration kicks in. The jxl-rs community has been actively working on performance improvements:

- **PR #491** - HDR color profile handling (PQ/HLG transfer functions)
- **PR #492** - Remove unnecessary `allow_unsafe` requirement
- **PR #493** - Rectangle bounds checking improvements
- **PR #494** - Precision level matching libjxl C++ version
- **PR #506** - Major performance improvements bringing jxl-rs nearly on par with C++ libjxl
- **PR #509** - WASM polyfill implementation for browsers without native JXL support

The performance work is crucial - [PR #506](https://github.com/libjxl/jxl-rs/pull/506) dramatically improves decode performance through parallel VarDCT decoding and AVX2+FMA SIMD optimizations. The results speak for themselves:

| Image | Size | Before PR #506 | After PR #506 | C++ libjxl | Speedup |
|-------|------|----------------|---------------|------------|---------|
| bike | 2048×2560 | 265ms | 198ms | 170ms | **+34%** |
| progressive | 4064×2704 | 694ms | 560ms | 450ms | **+24%** |
| blendmodes | 1024×1024 | 115ms | 85ms | 266ms | **+35%** |

**The gap closed from 56% slower to just 4% slower than C++** - a 52-point improvement that makes the Rust implementation viable for production use. Meanwhile, [PR #509](https://github.com/libjxl/jxl-rs/pull/509) provides a WebAssembly-based polyfill that allows JXL images to work in browsers that don't yet have native support.

## What Works Now

Here's an example of JXL animation support in action (if your browser doesn't support JXL natively, the polyfill will decode it):

```snippet
<img src="/anim-icos.jxl" alt="Animated JXL Demo" style="max-width: 400px; margin: 20px auto; display: block;" />
<script type="module" src="/jxl-polyfill/polyfill.js"></script>
```

The current implementation has all the core features:

✅ **Standard image decoding** - JPEG XL images render correctly
✅ **ICC color profiles** - Proper color management
✅ **Animations** - Multi-frame JXL support (first browser!)
✅ **Alpha/transparency** - Full alpha channel support
✅ **Wide gamut** - Display-P3 and other color spaces
✅ **HDR support** - PQ/HLG transfer functions (merged via [PR #491](https://github.com/libjxl/jxl-rs/pull/491))

The implementation is feature-complete with all essential JXL capabilities working.

## The Road Ahead

Chrome's requirements for shipping are clear:

1. **Performant decoder** - The jxl-rs optimizations are delivering
2. **Memory-safe implementation** - Rust gives us this by default
3. **Long-term maintenance commitment** - The jxl-rs community is active and growing

## Beyond Format Wars

This isn't about AVIF vs JXL vs WebP. Each format has its place:

- **WebP** - Great general-purpose replacement for JPEG/PNG
- **AVIF** - Excellent for photo compression with AV1 roots
- **JPEG XL** - Lossless JPEG transcoding, progressive decode, animations, HDR

The web is better with **open choice**. Developers should have options to pick the right format for their specific use case. Some images benefit from AVIF's compression, others need JXL's progressive rendering or lossless JPEG transcoding. Let the format fit the need, not fight over dominance.

## Why This Matters

This isn't just about adding another image format. It's about:

- **Better web performance** - Smaller images mean faster load times
- **Better image quality** - Same visual quality at much smaller file sizes
- **Future-proofing** - HDR and wide gamut support for modern displays
- **Developer choice** - Give web developers the tools to optimize their content

JPEG has served us well for three decades. But the web has evolved. Displays are better. Networks are faster. Users expect more.

JPEG XL is what the web needs next. The community is making it happen.

## Implementation Details

**Status:** 🚧 In active development

- C++ Implementation: [CL 7170439](https://chromium-review.googlesource.com/c/chromium/src/+/7170439) - Abandoned in favor of Rust
- Rust Implementation: [CL 7184969](https://chromium-review.googlesource.com/c/chromium/src/+/7184969) - Active development
- Tracking Bug: [462919304](https://issues.chromium.org/issues/462919304)
- Design Document: [JPEG XL in Chromium](https://docs.google.com/document/d/1oT7K2h4Xf4E0ScUmsOQx0zXUVJj57qBwcsa3yK9SJr0/edit?tab=t.0)

**Upstream Work:**
- [jxl-rs repository](https://github.com/libjxl/jxl-rs)
- [Performance improvements (PR #506)](https://github.com/libjxl/jxl-rs/pull/506)
- [WASM polyfill (PR #509)](https://github.com/libjxl/jxl-rs/pull/509)

**Demo:**
- [JXL Animation Support Video](https://youtu.be/zVkX4bP6qSo)

---

**Links:**
- [Rick Byers' Announcement](https://groups.google.com/a/chromium.org/g/blink-dev/c/WjCKcBw219k/m/tdJGfuLQAAAJ)
- [C++ Implementation CL 7170439](https://chromium-review.googlesource.com/c/chromium/src/+/7170439)
- [Rust Implementation CL 7184969](https://chromium-review.googlesource.com/c/chromium/src/+/7184969)
- [jxl-rs Repository](https://github.com/libjxl/jxl-rs)
- [Heise News Coverage](https://www.heise.de/en/news/U-turn-Google-wants-to-bring-JPEG-XL-back-to-Chrome-11089880.html)
- [DevClass Coverage](https://devclass.com/2025/11/24/googles-chromium-team-decides-it-will-add-jpeg-xl-support-reverses-obsolete-declaration/)
- [My GitHub](https://github.com/hjanuschka)
