# 2025: The Year I Became a Chromium OWNER

*95+ merged contributions across Chromium, PDFium, and jxl-rs*

---

## By the Numbers

| Project | Merged | In Progress |
|---------|--------|-------------|
| Chromium | 68 CLs | 10 CLs |
| PDFium | 9 CLs | - |
| jxl-rs | 18 PRs | 4 PRs |
| **Total** | **95** | **14** |

## 2025 Milestones

🎉 **Chromium OWNER** - Earned OWNER status via the Tab Focus feature work. Now able to review and approve changes in that area.

🚀 **JPEG XL Revival** - Part of the team bringing JPEG XL back to Chromium, this time with a Rust decoder. Contributed 18 merged PRs to [jxl-rs](https://github.com/libjxl/jxl-rs) for SIMD optimizations, HDR support, and Chromium integration.

🔧 **omarchy-chromium Maintainer** - Maintaining a [custom Chromium build](https://github.com/basecamp/omarchy-chromium) for [Omarchy](https://omarchy.basecamp.com/). Provides ARM64 Linux builds not officially supported by Google.

## The Browser Trinity (In Progress)

Working towards contributing to all three major browser engines. Currently porting Resource Timing Level 3 (interim response timestamps for HTTP 103 Early Hints) to Firefox and Safari:

| Browser | Status | Link |
|---------|--------|------|
| Firefox | ⏳ First contribution | [D276668](https://phabricator.services.mozilla.com/D276668) |
| Safari/WebKit | ⏳ First contribution | [#55467](https://github.com/WebKit/WebKit/pull/55467) |

If landed, this completes the trifecta - at least one contribution to each major browser engine.

## Thank You

- **[Yoav Weiss](https://github.com/yoavweiss)** - for being an incredible mentor, answering endless questions, finding the right reviewers, pointing me to the right mailing lists, and all the guidance that goes way beyond code
- **[Tobi Lütke](https://github.com/tobi)** - for the original idea that became the `--focus` flag
- **[DHH](https://github.com/dhh)** - for Omarchy and pushing browser theming forward
- **[Rick Byers](https://github.com/RByers)** - for championing JPEG XL's return and providing direction
- **[Philip Jägenstedt](https://github.com/foolip)** - for supporting the JPEG XL revival effort

And to the countless Chromium developers on Slack - too many to name - who answered questions and provided feedback when I felt lost. Your patience and expertise made these contributions possible. 🙏

## Major Features

| Feature | Description |
|---------|-------------|
| [**Tab Focus Flag**](/chromium-focus-feature.html) (Chrome 143) | New `--focus` flag that focuses existing tabs instead of opening duplicates |
| [**Instant Policy Refresh**](/chromium-omarchy.html) | Added `--refresh-platform-policy` flag for instant browser theme updates via managed policies |
| [**Wayland Crash Fix**](/chromium-wayland-crash.html) | Fixed a crash affecting Linux users when moving Chrome windows between monitors |
| [**JPEG XL Support**](/chromium-jxl-resurrection.html) (In Progress) | Bringing JPEG XL back to Chromium using the Rust-based jxl-rs decoder |

## Chromium Bug Fixes

- <span style="background: #10b981; color: white; padding: 2px 8px; border-radius: 12px; font-size: 11px; font-weight: bold;">MERGED</span> [**Fix use-after-free in OmniboxEditModel**](https://crrev.com/c/7191448)
- <span style="background: #10b981; color: white; padding: 2px 8px; border-radius: 12px; font-size: 11px; font-weight: bold;">MERGED</span> [**Fix styleSheets access for DOMParser-created documents**](https://crrev.com/c/7181280)
- <span style="background: #10b981; color: white; padding: 2px 8px; border-radius: 12px; font-size: 11px; font-weight: bold;">MERGED</span> [**Fix HTTP 425 retry for TLS early data**](https://crrev.com/c/7157040)
- <span style="background: #10b981; color: white; padding: 2px 8px; border-radius: 12px; font-size: 11px; font-weight: bold;">MERGED</span> [**Fix Cache-Control parsing (RFC 7234)**](https://crrev.com/c/7080077)
- <span style="background: #10b981; color: white; padding: 2px 8px; border-radius: 12px; font-size: 11px; font-weight: bold;">MERGED</span> [**Fix iframe unload events during document.open()**](https://crrev.com/c/6903519)
- <span style="background: #10b981; color: white; padding: 2px 8px; border-radius: 12px; font-size: 11px; font-weight: bold;">MERGED</span> [**Fix modulepreload referrer headers**](https://crrev.com/c/6509110)
- <span style="background: #10b981; color: white; padding: 2px 8px; border-radius: 12px; font-size: 11px; font-weight: bold;">MERGED</span> [**Fix filter:invert on high-DPI displays**](https://crrev.com/c/6532305)

## Other Chromium Features

- <span style="background: #10b981; color: white; padding: 2px 8px; border-radius: 12px; font-size: 11px; font-weight: bold;">MERGED</span> [**Expose Font Service for font enumeration**](https://crrev.com/c/6993029)
- <span style="background: #10b981; color: white; padding: 2px 8px; border-radius: 12px; font-size: 11px; font-weight: bold;">MERGED</span> [**PDFium v2 font matching feature flag**](https://crrev.com/c/7052723)
- <span style="background: #10b981; color: white; padding: 2px 8px; border-radius: 12px; font-size: 11px; font-weight: bold;">MERGED</span> [**Separate defer/module script execution**](https://crrev.com/c/6931651)
- <span style="background: #10b981; color: white; padding: 2px 8px; border-radius: 12px; font-size: 11px; font-weight: bold;">MERGED</span> [**Geolocation accuracy in DevTools**](https://crrev.com/c/6559109)
- <span style="background: #10b981; color: white; padding: 2px 8px; border-radius: 12px; font-size: 11px; font-weight: bold;">MERGED</span> [**ReportBody.toJSON() use counters**](https://crrev.com/c/7003545)

## PDFium

9 merged CLs to PDFium in 2025:

**New APIs:**
- <span style="background: #10b981; color: white; padding: 2px 8px; border-radius: 12px; font-size: 11px; font-weight: bold;">MERGED</span> [**Add FPDF_SYSFONTINFO v2 for per-request font matching**](https://pdfium-review.googlesource.com/c/pdfium/+/136690)
- <span style="background: #10b981; color: white; padding: 2px 8px; border-radius: 12px; font-size: 11px; font-weight: bold;">MERGED</span> [**Add FPDFPage_InsertObjectAtIndex() API**](https://pdfium-review.googlesource.com/c/pdfium/+/131030)
- <span style="background: #10b981; color: white; padding: 2px 8px; border-radius: 12px; font-size: 11px; font-weight: bold;">MERGED</span> [**Add FPDFFormObj_RemoveObject API**](https://pdfium-review.googlesource.com/c/pdfium/+/131232)
- <span style="background: #10b981; color: white; padding: 2px 8px; border-radius: 12px; font-size: 11px; font-weight: bold;">MERGED</span> [**Add FPDFAnnot_SetFormFieldFlags API**](https://pdfium-review.googlesource.com/c/pdfium/+/131231)
- <span style="background: #10b981; color: white; padding: 2px 8px; border-radius: 12px; font-size: 11px; font-weight: bold;">MERGED</span> [**Add API to retrieve MIME type from attachments**](https://pdfium-review.googlesource.com/c/pdfium/+/130970)
- <span style="background: #10b981; color: white; padding: 2px 8px; border-radius: 12px; font-size: 11px; font-weight: bold;">MERGED</span> [**Implement PDF version handling from catalog**](https://pdfium-review.googlesource.com/c/pdfium/+/130850)

**Bug Fixes:**
- <span style="background: #10b981; color: white; padding: 2px 8px; border-radius: 12px; font-size: 11px; font-weight: bold;">MERGED</span> [**Fix GetLooseBounds char box containment**](https://pdfium-review.googlesource.com/c/pdfium/+/134730)
- <span style="background: #10b981; color: white; padding: 2px 8px; border-radius: 12px; font-size: 11px; font-weight: bold;">MERGED</span> [**Fix Form XObject content regeneration**](https://pdfium-review.googlesource.com/c/pdfium/+/132190)
- <span style="background: #10b981; color: white; padding: 2px 8px; border-radius: 12px; font-size: 11px; font-weight: bold;">MERGED</span> [**Fix undo counting for cut operations**](https://pdfium-review.googlesource.com/c/pdfium/+/132350)

## jxl-rs Contributions

18 merged PRs to [libjxl/jxl-rs](https://github.com/libjxl/jxl-rs) - the Rust JPEG XL decoder:

**SIMD Optimizations:**
- <span style="background: #10b981; color: white; padding: 2px 8px; border-radius: 12px; font-size: 11px; font-weight: bold;">MERGED</span> [**Add SIMD F32 to U8/U16 conversions**](https://github.com/libjxl/jxl-rs/pull/537)
- <span style="background: #10b981; color: white; padding: 2px 8px; border-radius: 12px; font-size: 11px; font-weight: bold;">MERGED</span> [**Add SIMD versions of transfer functions**](https://github.com/libjxl/jxl-rs/pull/536)
- <span style="background: #10b981; color: white; padding: 2px 8px; border-radius: 12px; font-size: 11px; font-weight: bold;">MERGED</span> [**Add SIMD upsampling for 2x, 4x, and 8x**](https://github.com/libjxl/jxl-rs/pull/535)
- <span style="background: #10b981; color: white; padding: 2px 8px; border-radius: 12px; font-size: 11px; font-weight: bold;">MERGED</span> [**Add min and store_interleaved functions to jxl_simd**](https://github.com/libjxl/jxl-rs/pull/533)
- <span style="background: #10b981; color: white; padding: 2px 8px; border-radius: 12px; font-size: 11px; font-weight: bold;">MERGED</span> [**Add SIMD noise convolution**](https://github.com/libjxl/jxl-rs/pull/532)
- <span style="background: #10b981; color: white; padding: 2px 8px; border-radius: 12px; font-size: 11px; font-weight: bold;">MERGED</span> [**Add SIMD YCbCr to RGB conversion**](https://github.com/libjxl/jxl-rs/pull/529)

**Performance:**
- <span style="background: #10b981; color: white; padding: 2px 8px; border-radius: 12px; font-size: 11px; font-weight: bold;">MERGED</span> [**Implement flattened modular trees**](https://github.com/libjxl/jxl-rs/pull/538)
- <span style="background: #10b981; color: white; padding: 2px 8px; border-radius: 12px; font-size: 11px; font-weight: bold;">MERGED</span> [**Improve weighted predictor cache locality**](https://github.com/libjxl/jxl-rs/pull/526)
- <span style="background: #10b981; color: white; padding: 2px 8px; border-radius: 12px; font-size: 11px; font-weight: bold;">MERGED</span> [**Cache natural coefficient orders using OnceLock**](https://github.com/libjxl/jxl-rs/pull/525)
- <span style="background: #10b981; color: white; padding: 2px 8px; border-radius: 12px; font-size: 11px; font-weight: bold;">MERGED</span> [**Precompute cosines in spline rendering**](https://github.com/libjxl/jxl-rs/pull/524)

**API & Integration:**
- <span style="background: #10b981; color: white; padding: 2px 8px; border-radius: 12px; font-size: 11px; font-weight: bold;">MERGED</span> [**Add FFI-friendly API for Chromium integration**](https://github.com/libjxl/jxl-rs/pull/556)
- <span style="background: #10b981; color: white; padding: 2px 8px; border-radius: 12px; font-size: 11px; font-weight: bold;">MERGED</span> [**Implement remaining decoder API methods**](https://github.com/libjxl/jxl-rs/pull/496)
- <span style="background: #10b981; color: white; padding: 2px 8px; border-radius: 12px; font-size: 11px; font-weight: bold;">MERGED</span> [**Add preview frame API support**](https://github.com/libjxl/jxl-rs/pull/495)

**Bug Fixes:**
- <span style="background: #10b981; color: white; padding: 2px 8px; border-radius: 12px; font-size: 11px; font-weight: bold;">MERGED</span> [**Fix spline DISTANCE_EXP to match libjxl default**](https://github.com/libjxl/jxl-rs/pull/494)
- <span style="background: #10b981; color: white; padding: 2px 8px; border-radius: 12px; font-size: 11px; font-weight: bold;">MERGED</span> [**Fix rect bounds check for padded images**](https://github.com/libjxl/jxl-rs/pull/493)
- <span style="background: #10b981; color: white; padding: 2px 8px; border-radius: 12px; font-size: 11px; font-weight: bold;">MERGED</span> [**Remove zerocopy from production dependencies**](https://github.com/libjxl/jxl-rs/pull/492)

**HDR Support:**
- <span style="background: #10b981; color: white; padding: 2px 8px; border-radius: 12px; font-size: 11px; font-weight: bold;">MERGED</span> [**Implement HDR tone mapping for ICC profile generation**](https://github.com/libjxl/jxl-rs/pull/491)

**CI:**
- <span style="background: #10b981; color: white; padding: 2px 8px; border-radius: 12px; font-size: 11px; font-weight: bold;">MERGED</span> [**Add jxl-perfhistory benchmark CI stage**](https://github.com/libjxl/jxl-rs/pull/540)

**Open PRs:**
- <span style="background: #6b7280; color: white; padding: 2px 8px; border-radius: 12px; font-size: 11px; font-weight: bold;">IN PROGRESS</span> [**Add premultiply_output option**](https://github.com/libjxl/jxl-rs/pull/574)
- <span style="background: #6b7280; color: white; padding: 2px 8px; border-radius: 12px; font-size: 11px; font-weight: bold;">IN PROGRESS</span> [**Add SIMD chroma upsampling**](https://github.com/libjxl/jxl-rs/pull/530)
- <span style="background: #6b7280; color: white; padding: 2px 8px; border-radius: 12px; font-size: 11px; font-weight: bold;">IN PROGRESS</span> [**Add WebAssembly decoder with browser demo**](https://github.com/libjxl/jxl-rs/pull/509)
- <span style="background: #6b7280; color: white; padding: 2px 8px; border-radius: 12px; font-size: 11px; font-weight: bold;">IN PROGRESS</span> [**Add ISO 21496-1 gain map support**](https://github.com/libjxl/jxl-rs/pull/504)

## Chromium CLs In Progress

Active CLs currently under review:

**JPEG XL:**
- <span style="background: #10b981; color: white; padding: 2px 8px; border-radius: 12px; font-size: 11px; font-weight: bold;">MERGED</span> [**Add jxl-rs to third_party**](https://crrev.com/c/7201443)
- <span style="background: #3b82f6; color: white; padding: 2px 8px; border-radius: 12px; font-size: 11px; font-weight: bold;">IN REVIEW</span> [**Integrate jxl-rs into Blink**](https://crrev.com/c/7184969)

**Web Platform / Network:**
- <span style="background: #3b82f6; color: white; padding: 2px 8px; border-radius: 12px; font-size: 11px; font-weight: bold;">IN REVIEW</span> [**Add Request.isReloadNavigation attribute**](https://crrev.com/c/7137783)
- <span style="background: #3b82f6; color: white; padding: 2px 8px; border-radius: 12px; font-size: 11px; font-weight: bold;">IN REVIEW</span> [**Preserve MIME type in URL parser**](https://crrev.com/c/7135039)
- <span style="background: #3b82f6; color: white; padding: 2px 8px; border-radius: 12px; font-size: 11px; font-weight: bold;">IN REVIEW</span> [**Preserve %2E encoding in URL paths**](https://crrev.com/c/7054663)
- <span style="background: #3b82f6; color: white; padding: 2px 8px; border-radius: 12px; font-size: 11px; font-weight: bold;">IN REVIEW</span> [**Allow data: URL redirects in manual mode**](https://crrev.com/c/7131545)
- <span style="background: #3b82f6; color: white; padding: 2px 8px; border-radius: 12px; font-size: 11px; font-weight: bold;">IN REVIEW</span> [**Complete HTTPS-RR support**](https://crrev.com/c/6938248)

**Accessibility:**
- <span style="background: #3b82f6; color: white; padding: 2px 8px; border-radius: 12px; font-size: 11px; font-weight: bold;">IN REVIEW</span> [**Expose named forms as ATK_ROLE_LANDMARK**](https://crrev.com/c/7232474)
- <span style="background: #3b82f6; color: white; padding: 2px 8px; border-radius: 12px; font-size: 11px; font-weight: bold;">IN REVIEW</span> [**Fix crash on profile-dependent flags**](https://crrev.com/c/7186763)

**Extensions:**
- <span style="background: #3b82f6; color: white; padding: 2px 8px; border-radius: 12px; font-size: 11px; font-weight: bold;">IN REVIEW</span> [**Add theme.getCurrent() WebExtensions API**](https://crrev.com/c/6927310)

## Code Modernization

- <span style="background: #10b981; color: white; padding: 2px 8px; border-radius: 12px; font-size: 11px; font-weight: bold;">MERGED</span> **Environment::GetVar series** (9 CLs) - Modernized to std::optional
- <span style="background: #10b981; color: white; padding: 2px 8px; border-radius: 12px; font-size: 11px; font-weight: bold;">MERGED</span> [**Move PseudoTcp to remoting/protocol**](https://crrev.com/c/6760418)
- <span style="background: #10b981; color: white; padding: 2px 8px; border-radius: 12px; font-size: 11px; font-weight: bold;">MERGED</span> [**Refactor StartupBrowserCreator for readability**](https://crrev.com/c/7052622)
- <span style="background: #10b981; color: white; padding: 2px 8px; border-radius: 12px; font-size: 11px; font-weight: bold;">MERGED</span> [**Replace WTF::NotNullTag with base::NotNullTag**](https://crrev.com/c/6632732)

---

## Links

| Resource | URL |
|----------|-----|
| All Chromium CLs | [chromium-review.googlesource.com](https://chromium-review.googlesource.com/q/owner:helmut@januschka.com) |
| All PDFium CLs | [pdfium-review.googlesource.com](https://pdfium-review.googlesource.com/q/owner:helmut@januschka.com) |
| All jxl-rs PRs | [github.com/libjxl/jxl-rs](https://github.com/libjxl/jxl-rs/pulls?q=is%3Apr+author%3Ahjanuschka) |
| GitHub | [github.com/hjanuschka](https://github.com/hjanuschka) |
