---
title: "Investigating AV1 Hardware Encoding on AMD/Mesa"
category: "Chromium"
tech: "C++ / VA-API / Video Encoding"
---

*How DPB initialization and frame-OBU handling affected the Mesa VA-API path.*

**Status:** 🛑 Stopped

```snippet
<div style="margin: 24px 0; padding: 16px 20px; background: rgba(177, 75, 75, 0.12); border: 1px solid #b14b4b; border-radius: 8px;">
  <strong style="color: #b14b4b;">Update: work on this fix has been stopped.</strong>
  <p style="margin: 8px 0 0 0;">The CL is no longer being pursued. See the tracking bug <a href="https://issues.chromium.org/issues/471780477">471780477</a> for the current state and discussion.</p>
</div>
```

## The Problem

AV1 hardware video encoding on AMD GPUs with Mesa drivers has been broken in Chromium for a long time. The GPU process crashes (exit code 8) when initializing the AV1 VA-API encoder - not during complex operations, but right at the start when encoding a simple keyframe.

The crash affected anyone trying to use hardware-accelerated AV1 encoding for WebRTC video calls on AMD Linux systems. Users had to fall back to software encoding (libaom), which hammers the CPU during video calls.

**Bug**: [471780477](https://issues.chromium.org/issues/471780477)
**CL**: <span style="background: #6b7280; color: white; padding: 2px 8px; border-radius: 12px; font-size: 11px; font-weight: bold;">STOPPED</span> [**Fix AV1 VA-API encoder crash on AMD/Mesa**](https://crrev.com/c/7380014)

## The Investigation

The root cause was subtle: AMD's stateless AV1 encoder driver is sensitive to the DPB (Decoded Picture Buffer) state and may access reference frame slots even when encoding a keyframe - where you'd normally expect no references to be needed.

This is a quirk of how AMD/Mesa implements the VA-API encoder interface. Intel's drivers are more forgiving, but Mesa's implementation expects the DPB to be properly initialized from frame zero.

## The Candidate Fix

The patch evolved through repeated testing on an AMD RX 7900 GRE running Nextcloud Talk.

### Key Changes

**1. DPB Initialization for Keyframes**

For AMD/Mesa, the candidate patch initializes all reference-frame slots even for keyframes:

```cpp
// AMD/Mesa is sensitive to DPB state - initialize all slots
// to the reconstruct surface for keyframes
if (is_amd_mesa_driver_) {
  for (size_t i = 0; i < kAV1NumRefFrames; ++i) {
    pic_param.ref_frame_idx[i] = reconstruct_surface_id;
  }
}
```

**2. Smart Default Handling for Bitrate/Framerate**

WebRTC sometimes sends zero bitrate or framerate during initialization when the values are not known yet. The candidate patch treats zero as "use defaults" rather than clamping every low value:

- Framerate defaults to `VideoEncodeAccelerator::kDefaultFramerate` (30fps)
- Bitrate defaults to 100 kbps
- Explicitly requested low values are respected

This allows WebRTC to signal "encoder's choice" while still supporting explicit low-bitrate WebCodecs configurations.

**3. Resolution Change Handling**

The patch also tracks resolution changes and handles the warm-up period observed after a WebRTC resolution switch.

## Community Testing

A tester with the relevant AMD hardware reported results across the patchsets:

- **Early patchsets**: GPU crashes with `amdgpu ring vcn_unified_0 timeout`
- **Patchset 13**: no crash, but severe visual artifacts and smearing
- **Patchset 14**: single-stream improvement, with Simulcast still failing
- **Later patchsets**: updates to integer types, comments, default handling, and resolution changes
- **Patchset 21**: single-stream and Simulcast worked in the tester's environment

From the tester's final report:
> "I tested it both in single stream and simulcast and it hasn't crashed, shown any artifacts or smearing. Even ramping up and down with resolution and bitrate doesn't cause any problem anymore! It seems perfectly stable in my environment."

A later report after use in video calls said:
> "After some days of using the feature IN PRODUCTION, it works perfectly (no issue so far)."

## The Technical Deep Dive

### Why DPB Matters

The Decoded Picture Buffer holds reference frames that the encoder uses for inter-frame prediction. Even for a keyframe (I-frame), where you're not referencing previous frames for encoding, the VA-API driver on AMD/Mesa still validates the DPB structure.

When the DPB slots contain invalid surface IDs, the VCN (Video Core Next) firmware on AMD GPUs times out and triggers a full GPU reset:

```
amdgpu: ring vcn_unified_0 timeout, signaled seq=605909, emitted seq=605912
amdgpu: GPU reset begin!
[drm] VRAM is lost due to GPU reset!
```

### The OBU Structure Issue

AV1 uses OBUs (Open Bitstream Units) for packaging. The patch also adjusts `enable_frame_obu` handling for AMD:

```cpp
// AMD/Mesa prefers Frame Header OBU (Type 3) over Frame OBU
seq_param.seq_fields.bits.enable_frame_obu = is_amd_mesa_driver_ ? 0 : 1;
```

This ensures the bitstream structure is compatible with Mesa's expectations.

## Review and Testing Inputs

The patch used:

1. detailed crash logs with GPU driver output;
2. testing on AMD hardware not available in the local setup;
3. review from Ted Meyer on integer types, defaults, and API behavior;
4. repeated single-stream, Simulcast, and resolution-change tests.

The reviewer discussion was particularly valuable. Ted's concerns about default value handling led to a much cleaner design:

> "My gut feeling here is that 'zero -> 100' is better than 'max(value, 100)', since webrtc isn't the only thing using this file, and undocumented codec/platform specific combinations are going to be a debugging nightmare later."

## Current Status

Work on the CL has stopped. The patch and test reports remain linked from the tracking issue, but the change is not expected to merge in its current form.

**Files Changed:**
- `media/gpu/vaapi/av1_vaapi_video_encoder_delegate.cc` (+285 -43 lines)
- `media/gpu/vaapi/av1_vaapi_video_encoder_delegate.h` (+8 lines)

## Intended Behavior

The patch was intended to support:

- **Hardware AV1 encoding** on AMD GPUs with Mesa drivers
- **WebRTC video calls** with AV1 codec on AMD Linux systems
- **CPU offloading** - no more libaom software encoding
- **Simulcast support** - multiple resolution layers for adaptive streaming

The intended benefit for WebRTC applications such as Nextcloud Talk or Jitsi was lower CPU use than the libaom software fallback on supported AMD Linux systems.

## The Linux Support Question

During the bug discussion, there was an important exchange about Linux support:

> **Chrome team**: "We currently only support VA-API for video decoding on limited Intel devices. Linux unfortunately generates a high support demand, so we're very cautious about what we enable by default."

The fix doesn't change what's enabled by default - it fixes the underlying code for users who opt into hardware acceleration via flags. The feature remains behind `--enable-features=AcceleratedVideoEncode`.

## Try It

If you have an AMD GPU and want to test:

```bash
# Build Chromium from source with the patch, then:
chromium --enable-features=AcceleratedVideoEncode \
         --enable-features=VaapiVideoEncoder
```

The CL is stopped, so this command is only useful with a build containing the patch.

---

**Links:**
- [Chromium Bug 471780477](https://issues.chromium.org/issues/471780477)
- <span style="background: #6b7280; color: white; padding: 2px 8px; border-radius: 12px; font-size: 11px; font-weight: bold;">STOPPED</span> [**Fix AV1 VA-API encoder crash on AMD/Mesa**](https://crrev.com/c/7380014)
- [VA-API AV1 Encoder Documentation](https://source.chromium.org/chromium/chromium/src/+/main:media/gpu/vaapi/av1_vaapi_video_encoder_delegate.h)
