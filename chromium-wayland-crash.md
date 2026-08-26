---
title: "Debugging a Wayland Color-Management Crash"
category: "Chromium"
tech: "C++ / Wayland"
---

*A protocol-lifetime regression found through shared logs, workarounds, and upstream testing.*

**Update 16.10.2025:** ✅ Fix landed and merged to Chromium main branch

## The Problem Surfaces

On October 3rd, 2025, users started reporting Chrome crashes across multiple Linux distributions. The symptoms were consistent: move a Chrome window between monitors on Wayland, instant crash. The error logs pointed to Wayland protocol violations.

It was not specific to one distribution or configuration. Reports came from Omarchy, Arch Linux, and Fedora users, pointing to a Chrome 141 regression in the Wayland path.

The [Omarchy issue](https://github.com/basecamp/omarchy/issues/2184) became the shared place for logs, configurations, and workarounds even though the bug itself was not Omarchy-specific.

## Community Debugging

The GitHub issue ([#2184](https://github.com/basecamp/omarchy/issues/2184)) became a hub for collective troubleshooting. Users shared logs, system configurations, and workarounds:

- Downgrading to Chrome 140 worked (narrowed the regression window)
- Running with `--ozone-platform=x11` avoided the crash (isolated to Wayland)
- Disabling `WaylandWpColorManagerV1` feature prevented crashes (identified the subsystem)

Each report narrowed the regression window and affected subsystem.

## The Investigation

The error logs showed a clear pattern:

```
libwayland: wl_display#1: error 0: invalid object 64
Trace/breakpoint trap (core dumped)
```

Wayland protocol errors are unforgiving - violate the protocol, lose your connection, crash immediately.

The community had already identified the timeline:
- Chrome 140: working fine
- Chrome 141: crashing on window moves
- Subsystem: Wayland color management (`wp_color_management_v1`)

With a reproducible case (two monitors, Wayland, move window), finding the bug became straightforward code archaeology.

## The Root Cause

The color management feature was re-enabled in Chrome 141 after being temporarily disabled for HDR issues. When a window moves between monitors with different color profiles, Wayland sends a `preferred_changed` event.

Chrome's handler created a new image description object but destroyed the old one too late - after creating the new one. The Wayland protocol specification is explicit: destroy earlier image descriptions *before* creating new ones.

```cpp
// The bug: old object destroyed after new one created
CreateNewImageDescription();
DestroyOldImageDescription(); // Too late! Protocol violation.

// The fix: proper lifecycle ordering
DestroyOldImageDescription();
CreateNewImageDescription(); // Now Wayland is happy
```

The ordering error caused Wayland to close the client connection.

## Parallel Solutions

While the Chromium fix was being developed, the Hyprland team created their own workaround (<span style="background: #10b981; color: white; padding: 2px 8px; border-radius: 12px; font-size: 11px; font-weight: bold;">MERGED</span> [**Hyprland workaround**](https://github.com/hyprwm/Hyprland/pull/11877)) to handle Chrome's incorrect ordering more gracefully. This helped their users immediately but didn't solve the root cause.

The proper fix needed to be in Chromium - the protocol violation was on Chrome's side.

## The Fix

**Chromium Bug**: [449370049](https://issues.chromium.org/issues/449370049)
**Fix CL**: <span style="background: #10b981; color: white; padding: 2px 8px; border-radius: 12px; font-size: 11px; font-weight: bold;">MERGED</span> [**Fix color management object lifecycle**](https://crrev.com/c/7003036)
**Merged**: October 6, 2025
**Reviewers**: Thomas Anderson, Tom Lukaszewicz

The fix reorders the object lifecycle to match the protocol requirement.

## Why This Matters

This bug affected:
- Chrome, Brave, Edge (all Chromium-based browsers)
- All Wayland compositors with color management support
- Multi-monitor setups globally

The public reports supplied the information needed to reproduce the problem:
1. users shared detailed logs;
2. workarounds isolated the Wayland color-management path;
3. the protocol-lifetime error was identified;
4. the Chromium fix and compositor workaround were reviewed upstream.

## Status: Fixed

The fix has landed in Chromium main branch and will reach stable releases in the coming weeks. Until then, users experiencing crashes can use these workarounds:

**Option 1: Disable color management**
```sh
chrome --ozone-platform=wayland --disable-features=WaylandWpColorManagerV1
```

**Option 2: Use X11 backend**
```sh
chrome --ozone-platform=x11 --force-device-scale-factor=1
```

**Option 3: Install Chromium from tip-of-tree** (includes the fix)

## The Takeaway

The useful part of the community report was its specificity: version range, backend comparison, feature isolation, and reproducible monitor transition. Those details made it possible to trace the crash to Wayland object lifetime rather than treating it as a distribution-specific failure.

---

**Links:**
- [GitHub Issue #2184](https://github.com/basecamp/omarchy/issues/2184)
- [Chromium Bug 449370049](https://issues.chromium.org/issues/449370049)
- <span style="background: #10b981; color: white; padding: 2px 8px; border-radius: 12px; font-size: 11px; font-weight: bold;">MERGED</span> [**Fix color management object lifecycle**](https://crrev.com/c/7003036)
- <span style="background: #10b981; color: white; padding: 2px 8px; border-radius: 12px; font-size: 11px; font-weight: bold;">MERGED</span> [**Hyprland Workaround**](https://github.com/hyprwm/Hyprland/pull/11877)
- [Wayland Color Management Protocol](https://gitlab.freedesktop.org/wayland/wayland-protocols/-/blob/main/staging/color-management/color-management-v1.xml)
