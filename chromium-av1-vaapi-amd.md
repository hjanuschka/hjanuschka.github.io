---
title: "Fixing AV1 Hardware Encoding on AMD/Mesa: A Deep Dive into DPB Management"
category: "Chromium"
tech: "C++ / VA-API / Video Encoding"
---

*When the GPU crashes encoding a keyframe, you know you're in for a wild ride*

**Status:** 🚧 In Review

## The Problem

AV1 hardware video encoding on AMD GPUs with Mesa drivers has been broken in Chromium for a long time. The GPU process crashes (exit code 8) when initializing the AV1 VA-API encoder - not during complex operations, but right at the start when encoding a simple keyframe.

The crash affected anyone trying to use hardware-accelerated AV1 encoding for WebRTC video calls on AMD Linux systems. Users had to fall back to software encoding (libaom), which hammers the CPU during video calls.

**Bug**: [471780477](https://issues.chromium.org/issues/471780477)
**CL**: <span style="background: #3b82f6; color: white; padding: 2px 8px; border-radius: 12px; font-size: 11px; font-weight: bold;">IN REVIEW</span> [**Fix AV1 VA-API encoder crash on AMD/Mesa**](https://crrev.com/c/7380014)

## The Investigation

The root cause was subtle: AMD's stateless AV1 encoder driver is sensitive to the DPB (Decoded Picture Buffer) state and may access reference frame slots even when encoding a keyframe - where you'd normally expect no references to be needed.

This is a quirk of how AMD/Mesa implements the VA-API encoder interface. Intel's drivers are more forgiving, but Mesa's implementation expects the DPB to be properly initialized from frame zero.

## The Fix (That Took 21 Patchsets)

This wasn't a simple one-liner. The fix evolved through 21 patchsets with extensive community testing from a user with an AMD RX 7900 GRE running Nextcloud Talk.

### Key Changes

**1. DPB Initialization for Keyframes**

For AMD/Mesa, we now properly initialize all reference frame slots even for keyframes:

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

WebRTC sometimes sends zero bitrate/framerate during initialization when the actual values aren't known yet. Instead of enforcing arbitrary minimums, we now treat zero as "use sensible defaults":

- Framerate defaults to `VideoEncodeAccelerator::kDefaultFramerate` (30fps)
- Bitrate defaults to 100 kbps
- Explicitly requested low values are respected

This allows WebRTC to signal "encoder's choice" while still supporting explicit low-bitrate WebCodecs configurations.

**3. Resolution Change Handling**

The fix tracks resolution changes and handles the warm-up period that AMD drivers need after a resolution switch in WebRTC streams.

## The Testing Journey

The real heroes here are the community testers. One user (sv...@gmail.com) provided extraordinary feedback across 50+ issue comments, testing each patchset iteration:

**Early Patchsets (1-12)**: GPU crashes with `amdgpu ring vcn_unified_0 timeout`
**Patchset 13**: No crashes, but severe visual artifacts and "smearing"
**Patchset 14**: Better, but Simulcast mode still broken
**Patchsets 15-20**: Iterating on reviewer feedback about integer types, comments, default value handling
**Patchset 21**: **Success!** - Both single stream and Simulcast working perfectly

From the tester's final report:
> "I tested it both in single stream and simulcast and it hasn't crashed, shown any artifacts or smearing. Even ramping up and down with resolution and bitrate doesn't cause any problem anymore! It seems perfectly stable in my environment."

After days of production testing in real video calls:
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

AV1 uses OBUs (Open Bitstream Units) for packaging. We also had to adjust `enable_frame_obu` handling for AMD:

```cpp
// AMD/Mesa prefers Frame Header OBU (Type 3) over Frame OBU
seq_param.seq_fields.bits.enable_frame_obu = is_amd_mesa_driver_ ? 0 : 1;
```

This ensures the bitstream structure is compatible with Mesa's expectations.

## Collaboration in Action

This fix showcases open source collaboration at its best:

1. **User reports** detailed crash logs with GPU driver output
2. **Community testing** with real hardware I don't have access to
3. **Reviewer feedback** from Ted Meyer on Chromium style, integer types, and API design
4. **Iterative refinement** through 21 patchsets based on real-world testing

The reviewer discussion was particularly valuable. Ted's concerns about default value handling led to a much cleaner design:

> "My gut feeling here is that 'zero -> 100' is better than 'max(value, 100)', since webrtc isn't the only thing using this file, and undocumented codec/platform specific combinations are going to be a debugging nightmare later."

## Current Status

The CL is currently in review with positive signals from initial reviewers. Eugene has been added as a reviewer since he has extensive encoder experience.

**Files Changed:**
- `media/gpu/vaapi/av1_vaapi_video_encoder_delegate.cc` (+285 -43 lines)
- `media/gpu/vaapi/av1_vaapi_video_encoder_delegate.h` (+8 lines)

## Impact

When merged, this fix will enable:

- **Hardware AV1 encoding** on AMD GPUs with Mesa drivers
- **WebRTC video calls** with AV1 codec on AMD Linux systems
- **CPU offloading** - no more libaom software encoding
- **Simulcast support** - multiple resolution layers for adaptive streaming

For users running Nextcloud Talk, Jitsi, or any WebRTC-based video conferencing on AMD Linux systems, this is a significant improvement in performance and power efficiency.

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

Or wait for the CL to merge and try a tip-of-tree Chromium build.

---

**Links:**
- [Chromium Bug 471780477](https://issues.chromium.org/issues/471780477)
- <span style="background: #3b82f6; color: white; padding: 2px 8px; border-radius: 12px; font-size: 11px; font-weight: bold;">IN REVIEW</span> [**Fix AV1 VA-API encoder crash on AMD/Mesa**](https://crrev.com/c/7380014)
- [VA-API AV1 Encoder Documentation](https://source.chromium.org/chromium/chromium/src/+/main:media/gpu/vaapi/av1_vaapi_video_encoder_delegate.h)
