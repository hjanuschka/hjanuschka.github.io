*How JPEG XL went from "obsolete" to the future of web images - and the honor of being part of its comeback*

**Status:** 🚧 In active development — jxl-rs landed in Chromium, Blink integration under review

```snippet
<div class="youtube-embed">
  <iframe src="https://www.youtube.com/embed/zVkX4bP6qSo" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
</div>
```

## The Story

In October 2022, Google removed JPEG XL from Chromium, citing "insufficient ecosystem interest."

In November 2025, Chrome's Architecture Tech Leads announced: *"We would welcome contributions to integrate a performant and memory-safe JPEG XL decoder in Chromium."*

**What changed?**
- **Safari shipped JPEG XL** — Apple implemented the format
- **Firefox updated their position** — Mozilla signaled support pending a Rust decoder
- **PDF standardization** — JPEG XL designated as the preferred format for HDR in PDF
- **Developer demand** — Bug upvotes, Interop proposals, and survey data

## Why JPEG XL?

- **30-50% better compression** than JPEG at equivalent quality
- **Lossless JPEG transcoding** with ~20% size reduction
- **Progressive decoding** — images load incrementally
- **Modern capabilities** — HDR, wide gamut, alpha, animations
- **Cross-browser momentum** — Safari ships it, Firefox is working on it

## Implementation

### Phase 1: C++ (Abandoned)

Initial approach used libjxl in C++. Feature complete with animation support, but feedback requested Rust for memory safety.

<span style="background: #6b7280; color: white; padding: 2px 8px; border-radius: 12px; font-size: 11px; font-weight: bold;">ABANDONED</span> [**CL 7170439**](https://crrev.com/c/7170439) — C++ implementation (superseded by Rust)

### Phase 2: Rust (Current)

Pivoted to [jxl-rs](https://github.com/libjxl/jxl-rs), a pure Rust decoder. Memory-safe and aligned with Chromium's direction.

<span style="background: #10b981; color: white; padding: 2px 8px; border-radius: 12px; font-size: 11px; font-weight: bold;">MERGED</span> [**CL 7201443**](https://crrev.com/c/7201443) — Add jxl-rs to third_party (73,908 lines)

**Blink integration (3 CLs):**
1. <span style="background: #10b981; color: white; padding: 2px 8px; border-radius: 12px; font-size: 11px; font-weight: bold;">MERGED</span> [**CL 7320482**](https://crrev.com/c/7320482) — Add JXL infrastructure: enums and build flag
2. <span style="background: #3b82f6; color: white; padding: 2px 8px; border-radius: 12px; font-size: 11px; font-weight: bold;">IN REVIEW</span> [**CL 7319379**](https://crrev.com/c/7319379) — Add JXL image decoder using jxl-rs
3. <span style="background: #3b82f6; color: white; padding: 2px 8px; border-radius: 12px; font-size: 11px; font-weight: bold;">IN REVIEW</span> [**CL 7184969**](https://crrev.com/c/7184969) — Wire up JXL decoder

The Rust decoder required significant optimization. The jxl-rs community merged **26 PRs** in December 2025:

| Image | Before | After | C++ libjxl | Speedup |
|-------|--------|-------|------------|---------|
| bike (2048×2560) | 265ms | 198ms | 170ms | **+34%** |
| progressive (4064×2704) | 694ms | 560ms | 450ms | **+24%** |
| blendmodes (1024×1024) | 115ms | 85ms | 266ms | **+35%** |

```snippet
<details>
<summary style="cursor: pointer; color: var(--accent); font-weight: bold;">View all jxl-rs contributions (26 PRs) →</summary>

**SIMD Optimizations:**
- <span style="background: #10b981; color: white; padding: 2px 8px; border-radius: 12px; font-size: 11px; font-weight: bold;">MERGED</span> [#585](https://github.com/libjxl/jxl-rs/pull/585) SIMD table lookup with shuffle
- <span style="background: #10b981; color: white; padding: 2px 8px; border-radius: 12px; font-size: 11px; font-weight: bold;">MERGED</span> [#537](https://github.com/libjxl/jxl-rs/pull/537) SIMD F32 to U8/U16 conversions
- <span style="background: #10b981; color: white; padding: 2px 8px; border-radius: 12px; font-size: 11px; font-weight: bold;">MERGED</span> [#536](https://github.com/libjxl/jxl-rs/pull/536) SIMD transfer functions
- <span style="background: #10b981; color: white; padding: 2px 8px; border-radius: 12px; font-size: 11px; font-weight: bold;">MERGED</span> [#535](https://github.com/libjxl/jxl-rs/pull/535) SIMD upsampling (2x, 4x, 8x)
- <span style="background: #10b981; color: white; padding: 2px 8px; border-radius: 12px; font-size: 11px; font-weight: bold;">MERGED</span> [#533](https://github.com/libjxl/jxl-rs/pull/533) SIMD min and store_interleaved
- <span style="background: #10b981; color: white; padding: 2px 8px; border-radius: 12px; font-size: 11px; font-weight: bold;">MERGED</span> [#532](https://github.com/libjxl/jxl-rs/pull/532) SIMD noise convolution
- <span style="background: #10b981; color: white; padding: 2px 8px; border-radius: 12px; font-size: 11px; font-weight: bold;">MERGED</span> [#530](https://github.com/libjxl/jxl-rs/pull/530) SIMD chroma upsampling
- <span style="background: #10b981; color: white; padding: 2px 8px; border-radius: 12px; font-size: 11px; font-weight: bold;">MERGED</span> [#529](https://github.com/libjxl/jxl-rs/pull/529) SIMD YCbCr to RGB

**Performance:**
- <span style="background: #10b981; color: white; padding: 2px 8px; border-radius: 12px; font-size: 11px; font-weight: bold;">MERGED</span> [#600](https://github.com/libjxl/jxl-rs/pull/600) SinglePropertyLookup for table-based routing
- <span style="background: #10b981; color: white; padding: 2px 8px; border-radius: 12px; font-size: 11px; font-weight: bold;">MERGED</span> [#583](https://github.com/libjxl/jxl-rs/pull/583) Optimize EPF sigma for modular encoding
- <span style="background: #10b981; color: white; padding: 2px 8px; border-radius: 12px; font-size: 11px; font-weight: bold;">MERGED</span> [#581](https://github.com/libjxl/jxl-rs/pull/581) Cache default quantization tables
- <span style="background: #10b981; color: white; padding: 2px 8px; border-radius: 12px; font-size: 11px; font-weight: bold;">MERGED</span> [#538](https://github.com/libjxl/jxl-rs/pull/538) Flattened modular trees
- <span style="background: #10b981; color: white; padding: 2px 8px; border-radius: 12px; font-size: 11px; font-weight: bold;">MERGED</span> [#526](https://github.com/libjxl/jxl-rs/pull/526) Weighted predictor cache locality
- <span style="background: #10b981; color: white; padding: 2px 8px; border-radius: 12px; font-size: 11px; font-weight: bold;">MERGED</span> [#525](https://github.com/libjxl/jxl-rs/pull/525) Cache natural coefficient orders
- <span style="background: #10b981; color: white; padding: 2px 8px; border-radius: 12px; font-size: 11px; font-weight: bold;">MERGED</span> [#524](https://github.com/libjxl/jxl-rs/pull/524) Precompute cosines in spline rendering

**API & Integration:**
- <span style="background: #10b981; color: white; padding: 2px 8px; border-radius: 12px; font-size: 11px; font-weight: bold;">MERGED</span> [#594](https://github.com/libjxl/jxl-rs/pull/594) Bump version to 0.2.2
- <span style="background: #10b981; color: white; padding: 2px 8px; border-radius: 12px; font-size: 11px; font-weight: bold;">MERGED</span> [#587](https://github.com/libjxl/jxl-rs/pull/587) Bump version to 0.2.1
- <span style="background: #10b981; color: white; padding: 2px 8px; border-radius: 12px; font-size: 11px; font-weight: bold;">MERGED</span> [#586](https://github.com/libjxl/jxl-rs/pull/586) Fix rendering bugs
- <span style="background: #10b981; color: white; padding: 2px 8px; border-radius: 12px; font-size: 11px; font-weight: bold;">MERGED</span> [#574](https://github.com/libjxl/jxl-rs/pull/574) Add premultiply_output option
- <span style="background: #10b981; color: white; padding: 2px 8px; border-radius: 12px; font-size: 11px; font-weight: bold;">MERGED</span> [#556](https://github.com/libjxl/jxl-rs/pull/556) FFI-friendly API for Chromium
- <span style="background: #10b981; color: white; padding: 2px 8px; border-radius: 12px; font-size: 11px; font-weight: bold;">MERGED</span> [#540](https://github.com/libjxl/jxl-rs/pull/540) Benchmark CI stage
- <span style="background: #10b981; color: white; padding: 2px 8px; border-radius: 12px; font-size: 11px; font-weight: bold;">MERGED</span> [#496](https://github.com/libjxl/jxl-rs/pull/496) Remaining decoder API methods
- <span style="background: #10b981; color: white; padding: 2px 8px; border-radius: 12px; font-size: 11px; font-weight: bold;">MERGED</span> [#495](https://github.com/libjxl/jxl-rs/pull/495) Preview frame API
- <span style="background: #10b981; color: white; padding: 2px 8px; border-radius: 12px; font-size: 11px; font-weight: bold;">MERGED</span> [#494](https://github.com/libjxl/jxl-rs/pull/494) Fix spline DISTANCE_EXP
- <span style="background: #10b981; color: white; padding: 2px 8px; border-radius: 12px; font-size: 11px; font-weight: bold;">MERGED</span> [#493](https://github.com/libjxl/jxl-rs/pull/493) Fix rect bounds check
- <span style="background: #10b981; color: white; padding: 2px 8px; border-radius: 12px; font-size: 11px; font-weight: bold;">MERGED</span> [#492](https://github.com/libjxl/jxl-rs/pull/492) Remove zerocopy dependency
- <span style="background: #10b981; color: white; padding: 2px 8px; border-radius: 12px; font-size: 11px; font-weight: bold;">MERGED</span> [#491](https://github.com/libjxl/jxl-rs/pull/491) HDR tone mapping
- <span style="background: #10b981; color: white; padding: 2px 8px; border-radius: 12px; font-size: 11px; font-weight: bold;">MERGED</span> [#533](https://github.com/libjxl/jxl-rs/pull/533) Add min and store_interleaved

</details>
```

## Current Status

✅ Standard image decoding
✅ ICC color profiles
✅ Animations (multi-frame)
✅ Alpha/transparency
✅ Wide gamut (Display-P3)
✅ HDR support (PQ/HLG)

**Chromium rolls:**
- <span style="background: #3b82f6; color: white; padding: 2px 8px; border-radius: 12px; font-size: 11px; font-weight: bold;">IN REVIEW</span> [Roll jxl 0.2.1 → 0.2.2](https://crrev.com/c/7313560)
- <span style="background: #10b981; color: white; padding: 2px 8px; border-radius: 12px; font-size: 11px; font-weight: bold;">MERGED</span> [Roll jxl 0.2.0 → 0.2.1](https://crrev.com/c/7300607)
- <span style="background: #10b981; color: white; padding: 2px 8px; border-radius: 12px; font-size: 11px; font-weight: bold;">MERGED</span> [Roll jxl 0.1.5 → 0.2.0](https://crrev.com/c/7296289)

---

## Use JPEG XL Today

Don't want to wait? The [jxl-rs-polyfill](https://github.com/hjanuschka/jxl-rs-polyfill) brings JPEG XL to all browsers now.

**One line of code:**

```html
<script src="https://cdn.jsdelivr.net/npm/jxl-rs-polyfill/dist/auto.js"></script>
```

That's it. All `.jxl` images work everywhere.

- **Auto-detection** — skips polyfill in Safari 17+ (native support)
- **Zero config** — just include the script
- **Full coverage** — `<img>`, CSS backgrounds, `<picture>`, SVG
- **~540KB gzipped** — compact WASM module

```snippet
<details>
<summary style="cursor: pointer; color: var(--accent); font-weight: bold;">More usage examples →</summary>

<p><strong>NPM:</strong></p>
<pre><code class="language-bash">npm install jxl-rs-polyfill</code></pre>

<pre><code class="language-javascript">import { JXLPolyfill } from 'jxl-rs-polyfill';
const polyfill = new JXLPolyfill();
await polyfill.start();</code></pre>

<p><strong>Programmatic decoding:</strong></p>
<pre><code class="language-javascript">import { decodeJxlToPng } from 'jxl-rs-polyfill';
const pngBytes = await decodeJxlToPng(jxlBytes);</code></pre>

</details>
```

→ [GitHub: jxl-rs-polyfill](https://github.com/hjanuschka/jxl-rs-polyfill)

---

## Live Demo

JXL animation support — no browser supports JXL animations natively yet, so this uses the WASM polyfill:

```snippet
<div style="text-align: center; margin: 20px 0;">
  <img id="jxl-demo" src="/anim-icos.jxl" alt="Animated JXL Demo" width="128" height="128" style="width: 128px; height: 128px; margin: 20px auto; display: block; filter: blur(8px); transition: filter 0.3s ease;" />
  <button id="force-polyfill-btn" style="display: none; padding: 10px 20px; background: var(--accent, #f59e0b); color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 14px; margin-top: 10px;">
    Force Polyfill (See Animation)
  </button>
  <p id="polyfill-status" style="font-size: 12px; color: var(--text-muted, #666); margin-top: 10px;"></p>
</div>
<script type="module">
  import { JXLPolyfill } from '/jxl-polyfill/polyfill.js';

  const btn = document.getElementById('force-polyfill-btn');
  const status = document.getElementById('polyfill-status');
  const img = document.getElementById('jxl-demo');

  async function checkNativeJXLSupport() {
    return new Promise((resolve) => {
      const testImg = new Image();
      testImg.onload = () => resolve(true);
      testImg.onerror = () => resolve(false);
      testImg.src = 'data:image/jxl;base64,/woIELASCAgQAFzgBzgBPAk=';
      setTimeout(() => resolve(false), 100);
    });
  }

  const hasNativeSupport = await checkNativeJXLSupport();
  if (hasNativeSupport) {
    img.style.filter = 'none';
    btn.style.display = 'inline-block';
    status.textContent = 'Your browser has native JXL support (static only). Click to see WASM polyfill.';
  } else {
    status.textContent = 'Using WASM polyfill.';
    const polyfill = new JXLPolyfill();
    await polyfill.init();
    await polyfill.processImage(img);
    img.style.filter = 'none';
  }

  btn.addEventListener('click', async () => {
    btn.disabled = true;
    btn.textContent = 'Loading...';
    img.style.filter = 'blur(8px)';
    const polyfill = new JXLPolyfill({ forcePolyfill: true });
    await polyfill.init();
    await polyfill.processImage(img);
    img.style.filter = 'none';
    btn.textContent = 'Polyfill Active';
  });
</script>
```

---

## Acknowledgments

Special thanks to [Luca Versari (veluca93)](https://github.com/veluca93) for reviewing PRs and managing jxl-rs releases. The collaboration from jxl-rs maintainers made this possible.

---

**Resources:**
- [Rick Byers' Announcement](https://groups.google.com/a/chromium.org/g/blink-dev/c/WjCKcBw219k/m/tdJGfuLQAAAJ)
- [Tracking Bug: 462919304](https://issues.chromium.org/issues/462919304)
- [Design Document](https://docs.google.com/document/d/1oT7K2h4Xf4E0ScUmsOQx0zXUVJj57qBwcsa3yK9SJr0/edit?tab=t.0)
- [jxl-rs Repository](https://github.com/libjxl/jxl-rs) | [My PRs (23 merged)](https://github.com/libjxl/jxl-rs/pulls?q=is%3Apr+author%3Ahjanuschka)
- [jxl-rs-polyfill](https://github.com/hjanuschka/jxl-rs-polyfill)
- Press: [Heise](https://www.heise.de/en/news/U-turn-Google-wants-to-bring-JPEG-XL-back-to-Chrome-11089880.html) | [DevClass](https://devclass.com/2025/11/24/googles-chromium-team-decides-it-will-add-jpeg-xl-support-reverses-obsolete-declaration/)
