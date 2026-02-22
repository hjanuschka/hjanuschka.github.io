---
title: "Camera Capture on Desktop: Closing a 12-Year-Old Gap"
category: "Chromium"
tech: "C++"
---

*Bringing `<input type=file capture>` to Windows, Mac, and Linux*

**Status:** 🚧 In Progress

---

## The 12-Year-Old Feature Request

In October 2012, a feature request was filed: bring camera capture to desktop browsers. On Android, developers could already do this:

```html
<input type="file" accept="image/*" capture="camera">
```

Click the input, and Android opens the camera app. Take a photo, and it's submitted as a file. Simple, elegant, and completely unavailable on desktop platforms for over a decade.

**Bug:** [40291635](https://issues.chromium.org/issues/40291635)

## Why It Matters

Think about the use cases:

- **ID verification** - Upload a photo of your passport or driver's license
- **Profile pictures** - Take a selfie directly instead of hunting through files
- **Document scanning** - Capture receipts, forms, or notes
- **Support tickets** - Show the problem via webcam
- **Video messages** - Record a quick video response

Today, web developers have to build custom camera UIs using `getUserMedia()` - non-trivial work that most sites skip entirely. With native capture support, it's a single HTML attribute.

## The Implementation

The solution is a cross-platform `CameraCaptureDialog` that intercepts file inputs with the `capture` attribute:

```cpp
// In file_select_helper.cc - intercept capture requests
if (params.capture && ShouldShowCameraCaptureDialog(params)) {
  CameraCaptureDialog::Show(web_contents, params, callback);
  return;
}
```

### Features

| Feature | Description |
|---------|-------------|
| **Photo capture** | Single image capture with preview |
| **Video recording** | Record video with live preview |
| **Audio recording** | Voice memos and audio messages |
| **Device selection** | Choose between multiple cameras/mics |
| **Playback preview** | Review before submitting |
| **WebM metadata** | Proper duration headers for video files |

### Demo

**Image Capture:**

```snippet
<div class="youtube-embed">
  <iframe src="https://www.youtube.com/embed/t5561A1SHks" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
</div>
```

**Video Recording:**

```snippet
<div class="youtube-embed">
  <iframe src="https://www.youtube.com/embed/80-0PNMpYHM" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
</div>
```

**Audio Recording:**

```snippet
<div class="youtube-embed">
  <iframe src="https://www.youtube.com/embed/CkbsyqdDNBM" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
</div>
```

## Try It

**[Live Demo →](https://static.januschka.com/i-40291635/)**

Test the feature yourself with a patched Chromium build.

## The HTML API

The `capture` attribute on file inputs tells the browser to prefer media capture:

```html
<!-- Prefer camera for images -->
<input type="file" accept="image/*" capture>

<!-- Prefer user-facing camera -->
<input type="file" accept="image/*" capture="user">

<!-- Prefer environment-facing camera -->
<input type="file" accept="image/*" capture="environment">

<!-- Video capture -->
<input type="file" accept="video/*" capture>

<!-- Audio capture -->
<input type="file" accept="audio/*" capture>
```

The spec is defined in [HTML Media Capture](https://w3c.github.io/html-media-capture/), and this implementation brings Chrome desktop in line with Android and mobile Safari.

## Architecture

The implementation lives in `chrome/browser/ui/views/media_capture/`:

```
camera_capture_dialog.h      # Dialog interface and state machine
camera_capture_dialog.cc     # Cross-platform UI implementation
camera_capture_dialog_unittest.cc
```

Key components:
- **Live preview** using `media::VideoCaptureDevice`
- **Recording** via `MediaRecorder` API internally
- **Device enumeration** through `media::AudioDeviceDescription`
- **Views-based UI** for cross-platform consistency

## Current Status

<span style="background: #3b82f6; color: white; padding: 2px 8px; border-radius: 12px; font-size: 11px; font-weight: bold;">IN REVIEW</span> [**CL 7594822**](https://crrev.com/c/7594822) - Support camera capture for `<input type=file capture>` on desktop

## Links

- [Chromium Bug 40291635](https://issues.chromium.org/issues/40291635)
- <span style="background: #3b82f6; color: white; padding: 2px 8px; border-radius: 12px; font-size: 11px; font-weight: bold;">IN REVIEW</span> [**CL 7594822**](https://crrev.com/c/7594822)
- [Design Doc](https://docs.google.com/document/d/1p2QlRMDbHUc-GneEUuf-yHXRCqWqJijZSFD_KErqdnQ/edit)
- [HTML Media Capture Spec](https://w3c.github.io/html-media-capture/)

---

*Sometimes the best features are the ones that should have existed all along. After 12 years, desktop Chrome is finally catching up to mobile.*
