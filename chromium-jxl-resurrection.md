*How JPEG XL went from "obsolete" to the future of web images - and the honor of being part of its comeback*

```snippet
<div class="youtube-embed">
  <iframe src="https://www.youtube.com/embed/zVkX4bP6qSo" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
</div>
```

## Live Demo: JXL Animation

Here's a live example of JXL animation support - the implementation shown in the video above. No browser currently supports JXL animations natively, so this uses a WASM polyfill:

```snippet
<div style="text-align: center; margin: 20px 0;">
  <img id="jxl-demo" src="/anim-icos.jxl" alt="Animated JXL Demo" width="128" height="128" style="margin: 20px auto; display: block;" />
  <button id="force-polyfill-btn" style="display: none; padding: 10px 20px; background: var(--accent, #f59e0b); color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 14px; margin-top: 10px;">
    Force Polyfill (See Animation)
  </button>
  <p id="polyfill-status" style="font-size: 12px; color: var(--text-muted, #666); margin-top: 10px;"></p>
</div>
<script type="module" src="/jxl-polyfill/polyfill.js"></script>
<script type="module">
  import { JXLPolyfill } from '/jxl-polyfill/polyfill.js';

  const btn = document.getElementById('force-polyfill-btn');
  const status = document.getElementById('polyfill-status');
  const img = document.getElementById('jxl-demo');

  // Check for native JXL support
  async function checkNativeJXLSupport() {
    const jxlData = 'data:image/jxl;base64,/woIELASCAgQAFzgBzgBPAk=';
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => resolve(true);
      img.onerror = () => resolve(false);
      img.src = jxlData;
      setTimeout(() => resolve(false), 100);
    });
  }

  // Only show button if native support exists (but animations won't work)
  checkNativeJXLSupport().then(hasNativeSupport => {
    if (hasNativeSupport) {
      btn.style.display = 'inline-block';
      status.textContent = 'Your browser has native JXL support, but animations aren\'t supported yet. Click the button to see the animation via WASM polyfill.';
    } else {
      status.textContent = 'Using WASM polyfill for JXL support - animation should play automatically.';
    }
  });

  btn.addEventListener('click', async () => {
    btn.disabled = true;
    btn.textContent = 'Loading polyfill...';
    status.textContent = 'Forcing polyfill to show animation...';

    // Force polyfill usage
    const polyfill = new JXLPolyfill({
      verbose: true,
      forcePolyfill: true
    });
    await polyfill.init();
    await polyfill.processImage(img);

    btn.textContent = 'Polyfill Active';
    status.textContent = 'Using WASM decoder - animation should now play!';
  });
</script>
```

## Background

In October 2022, Google removed JPEG XL from Chromium, citing "insufficient ecosystem interest." In November 2025, Chrome's Architecture Tech Leads announced: "We would welcome contributions to integrate a performant and memory-safe JPEG XL decoder in Chromium."

## What Changed

Rick Byers' announcement on behalf of Chrome ATLs outlined the ecosystem developments:

- **Safari shipped JPEG XL support** - Apple implemented the format
- **Firefox updated their position** - Mozilla signaled support pending a Rust decoder
- **PDF standardization** - JPEG XL designated as the preferred format for HDR content in PDF
- **Developer interest** - Bug upvotes, Interop proposals, and survey data indicated demand

The ecosystem evolved between 2022 and 2025.

## JPEG XL Features

JPEG XL offers several technical improvements over existing formats:

- **30-50% better compression** than JPEG at equivalent quality
- **Lossless JPEG transcoding** with ~20% size reduction
- **Progressive decoding** - images load incrementally
- **Modern capabilities** - HDR, wide gamut, alpha channels, and animations
- **Browser support** - Safari has implemented it, Firefox is working on it, and it's part of the PDF specification

## Implementation Approach

Following Rick's announcement, the implementation work began.

### Phase 1: C++ Implementation

The initial approach used the reference implementation - libjxl in C++. Using the previous Chromium JPEG XL code as a blueprint, the implementation was updated to the latest spec:

**CL 7170439** - Full implementation with animation support

```cpp
// Integrated libjxl decoder with Blink's image pipeline
class JXLImageDecoder : public ImageDecoder {
  // Handle standard decoding
  void Decode(const uint8_t* data, size_t length);

  // Animation support
  size_t FrameCount() const override;
  cc::ImageHeaderMetadata MakeMetadataForDecodeAcceleration() const override;
};
```

Status: Feature complete, [demo video here](https://youtu.be/zVkX4bP6qSo).

The feedback requested using Rust for memory safety.

### Phase 2: Rust Implementation

Chromium is moving toward memory-safe code. The pivot to jxl-rs, a pure Rust JPEG XL decoder, aligned with this direction.

**CL 7184969** - Rust-based implementation using jxl-rs

```rust
// Memory-safe decoder via CXX bindings
pub fn decode_jxl(data: &[u8]) -> Result<DecodedImage> {
    let decoder = JxlDecoder::builder()
        .build()?;
    decoder.decode_to_image(data)
}
```

The Rust decoder required performance optimization. The jxl-rs community has been working on improvements:

- [**PR #491**](https://github.com/libjxl/jxl-rs/pull/491) (merged) - HDR color profile handling (PQ/HLG transfer functions)
- [**PR #492**](https://github.com/libjxl/jxl-rs/pull/492) (merged) - Remove unnecessary `allow_unsafe` requirement
- [**PR #493**](https://github.com/libjxl/jxl-rs/pull/493) (merged) - Rectangle bounds checking improvements
- [**PR #494**](https://github.com/libjxl/jxl-rs/pull/494) (merged) - Precision level matching libjxl C++ version
- [**PR #506**](https://github.com/libjxl/jxl-rs/pull/506) - Major performance improvements bringing jxl-rs nearly on par with C++ libjxl
- [**PR #509**](https://github.com/libjxl/jxl-rs/pull/509) - WASM polyfill implementation for browsers without native JXL support

[PR #506](https://github.com/libjxl/jxl-rs/pull/506) improves decode performance through parallel VarDCT decoding and AVX2+FMA SIMD optimizations:

| Image | Size | Before PR #506 | After PR #506 | C++ libjxl | Speedup |
|-------|------|----------------|---------------|------------|---------|
| bike | 2048×2560 | 265ms | 198ms | 170ms | **+34%** |
| progressive | 4064×2704 | 694ms | 560ms | 450ms | **+24%** |
| blendmodes | 1024×1024 | 115ms | 85ms | 266ms | **+35%** |

The gap narrowed from 56% slower to 4% slower than C++. [PR #509](https://github.com/libjxl/jxl-rs/pull/509) provides a WebAssembly-based polyfill for browsers without native support.

## Current Status

The implementation includes:

✅ **Standard image decoding** - JPEG XL images render correctly
✅ **ICC color profiles** - Proper color management
✅ **Animations** - Multi-frame JXL support
✅ **Alpha/transparency** - Full alpha channel support
✅ **Wide gamut** - Display-P3 and other color spaces
✅ **HDR support** - PQ/HLG transfer functions ([PR #491](https://github.com/libjxl/jxl-rs/pull/491) merged)

## Requirements for Shipping

Chrome's requirements:

1. **Performant decoder** - Performance optimizations are ongoing
2. **Memory-safe implementation** - Rust provides memory safety
3. **Long-term maintenance** - The jxl-rs community is active

## Format Diversity

Different image formats serve different needs:

- **WebP** - General-purpose replacement for JPEG/PNG
- **AVIF** - Photo compression with AV1-based encoding
- **JPEG XL** - Lossless JPEG transcoding, progressive decode, animations, HDR

Having multiple format options allows developers to choose based on their specific requirements.

## Acknowledgments

Special thanks to [Luca Versari (veluca93)](https://github.com/veluca93) for reviewing and merging upstream PRs and managing jxl-rs releases. The collaboration and responsiveness from the jxl-rs maintainers has been instrumental in making this implementation possible.

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
