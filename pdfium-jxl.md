---
title: "JPEG XL in PDF: Bringing JXL to PDFium with Rust"
category: "PDFium"
tech: "Rust / C++"
---

*Experimental support for decoding JPEG XL images embedded in PDF documents using the pure Rust decoder jxl-rs*

**Status:** 🔬 **EXPERIMENTAL** — Proof-of-concept for standalone PDFium builds

```snippet
<div style="text-align: center; margin: 30px 0; padding: 20px; background: rgba(211, 95, 95, 0.1); border: 2px solid #D35F5F; border-radius: 12px;">
  <h3 style="color: #D35F5F; margin: 0 0 10px 0;">🧪 EXPERIMENTAL FEATURE</h3>
  <p style="margin: 0;">JXL-in-PDF decoding via <code>jxl-rs</code> — not yet upstream</p>
  <p style="font-size: 13px; opacity: 0.8; margin-top: 5px;">CL: <a href="https://pdfium-review.googlesource.com/c/pdfium/+/142070">pdfium-review.googlesource.com/c/pdfium/+/142070</a></p>
</div>
```

## Background

With [JPEG XL landing in Chromium](/chromium-jxl-resurrection.html) via the Rust decoder `jxl-rs`, it's natural to ask: what about **PDF**?

JPEG XL is poised to become the preferred format for HDR images in PDF (per ISO 32000-2:2020 discussions). While the PDF spec doesn't yet have a standardized filter name, this experiment uses `/JXLDecode` as a bring-up name to prove the concept works.

## The Challenge

PDFium is Chromium's PDF renderer, but it's also used **standalone** (e.g., in other browsers, document viewers, server-side rendering). The challenge:

1. **Rust integration** — PDFium's standalone build needed Rust toolchain support
2. **Alpha handling** — JXL images can have alpha, but PDF expects a separate `/SMask`
3. **Animation** — JXL supports animation, but PDF image XObjects are static

## Implementation

### Approach

- **Rust-only decoder**: Uses `jxl-rs` via Chromium's CXX bridge wrapper
- **No C++ libjxl**: Memory-safe by design, aligns with Chromium's direction
- **Synthesized SMask**: Decoder extracts alpha and creates an internal soft mask
- **Frame 0 only**: For animated JXL, only the first frame is rendered

### Build Integration

Added a new GN flag for standalone builds:

```gn
# In pdfium.gni
declare_args() {
  pdf_enable_rust_jxl = false
}
```

The decoder glue lives in `core/fxcodec/jxl/`:

```
core/fxcodec/jxl/
├── BUILD.gn
├── DEPS
├── jxl_decoder.cc
├── jxl_decoder.h
└── jxl_rs_stub.cc
```

### Decoder Flow

```cpp
// In cpdf_dib.cpp
bool CPDF_DIB::LoadJxlBitmap(pdfium::span<const uint8_t> data) {
  auto info = pdfium::jxl::ParseInfo(data);
  if (!info) return false;

  auto decoded = pdfium::jxl::DecodeFrame0(data, info->width, info->height);
  if (!decoded) return false;

  // Extract RGB
  // If has_alpha: synthesize SMask via jpx_inline_data_ mechanism

  return true;
}
```

The integration hooks into `CreateDecoder()` to handle the `/JXLDecode` filter:

```cpp
if (decoder == "JXLDecode") {
  return LoadJxlBitmap(src_span) ? LoadState::kSuccess : LoadState::kFail;
}
```

## Demo Artifacts

Sample PDFs with embedded JXL images, rendered by the patched PDFium:

### Zoltan (RGB Photo)

Large RGB JPEG XL embedded in PDF.

```snippet
<div style="text-align: center; margin: 20px 0;">
  <img src="/assets/pdfium-jxl/zoltan-jxldecode.pdf.0.png" alt="Zoltan rendered" style="max-width: 100%; border: 2px solid var(--border); border-radius: 8px;" />
</div>
<div style="display: flex; gap: 10px; justify-content: center; margin: 15px 0; flex-wrap: wrap;">
  <a href="/assets/pdfium-jxl/zoltan-jxldecode.pdf" class="btn" style="background: var(--bg-lighter); padding: 8px 16px; border-radius: 6px; border: 1px solid var(--border); text-decoration: none; color: var(--text);">📄 Download PDF</a>
  <a href="/assets/pdfium-jxl/zoltan-jxldecode.pdf.0.png" class="btn" style="background: var(--bg-lighter); padding: 8px 16px; border-radius: 6px; border: 1px solid var(--border); text-decoration: none; color: var(--text);">🖼️ Rendered PNG</a>
</div>
```

### Dice (Alpha)

RGBA JPEG XL with transparency. PDFium synthesizes an `/SMask` and composites over a checkerboard background (baked into the PDF to visualize alpha).

```snippet
<div style="text-align: center; margin: 20px 0;">
  <img src="/assets/pdfium-jxl/dice-jxldecode.pdf.0.png" alt="Dice rendered with alpha" style="max-width: 100%; border: 2px solid var(--border); border-radius: 8px;" />
</div>
<div style="display: flex; gap: 10px; justify-content: center; margin: 15px 0; flex-wrap: wrap;">
  <a href="/assets/pdfium-jxl/dice-jxldecode.pdf" class="btn" style="background: var(--bg-lighter); padding: 8px 16px; border-radius: 6px; border: 1px solid var(--border); text-decoration: none; color: var(--text);">📄 Download PDF</a>
  <a href="/assets/pdfium-jxl/dice-jxldecode.pdf.0.png" class="btn" style="background: var(--bg-lighter); padding: 8px 16px; border-radius: 6px; border: 1px solid var(--border); text-decoration: none; color: var(--text);">🖼️ Rendered PNG</a>
</div>
```

### Animated Icons (Frame 0)

Animated RGBA JPEG XL. PDFium decodes only the first frame.

```snippet
<div style="text-align: center; margin: 20px 0;">
  <img src="/assets/pdfium-jxl/anim-icos-jxldecode.pdf.0.png" alt="Animated icons frame 0" style="max-width: 200px; border: 2px solid var(--border); border-radius: 8px;" />
</div>
<div style="display: flex; gap: 10px; justify-content: center; margin: 15px 0; flex-wrap: wrap;">
  <a href="/assets/pdfium-jxl/anim-icos-jxldecode.pdf" class="btn" style="background: var(--bg-lighter); padding: 8px 16px; border-radius: 6px; border: 1px solid var(--border); text-decoration: none; color: var(--text);">📄 Download PDF</a>
  <a href="/assets/pdfium-jxl/anim-icos-jxldecode.pdf.0.png" class="btn" style="background: var(--bg-lighter); padding: 8px 16px; border-radius: 6px; border: 1px solid var(--border); text-decoration: none; color: var(--text);">🖼️ Rendered PNG</a>
</div>
```

## Code Changes

<span style="background: #f59e0b; color: white; padding: 2px 8px; border-radius: 12px; font-size: 11px; font-weight: bold;">IN REVIEW</span> [**CL 142070**](https://pdfium-review.googlesource.com/c/pdfium/+/142070) — Add experimental JXLDecode support via Rust jxl-rs

## Building

To build PDFium with JXL support:

```bash
# In args.gn
enable_rust = true
pdf_enable_rust_jxl = true

# Requires rust_revision pointing to a version with jxl-rs v0.3 wrapper
```

## Related

- [JPEG XL Returns to Chrome](/chromium-jxl-resurrection.html) — The Chromium/Blink implementation
- [jxl-rs](https://github.com/libjxl/jxl-rs) — The pure Rust JPEG XL decoder
- [PDFium](https://pdfium.googlesource.com/pdfium/) — Google's PDF rendering library

---

*This is an experimental feature exploring JXL-in-PDF before standardization. The filter name `/JXLDecode` is a placeholder and may change.*
