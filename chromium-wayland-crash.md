*When Chrome crashes, the community debugs - a story of open source collaboration*

**Update 16.10.2025:** ✅ Fix landed and merged to Chromium main branch

## The Problem Surfaces

On October 3rd, 2025, users started reporting Chrome crashes across multiple Linux distributions. The symptoms were consistent: move a Chrome window between monitors on Wayland, instant crash. The error logs pointed to Wayland protocol violations.

What made this interesting: it wasn't specific to one distro or configuration. Omarchy users, Arch Linux users, Fedora users - all seeing the same crash. Chrome 141 had introduced a regression that affected the entire Wayland ecosystem.

The [Omarchy community](https://github.com/basecamp/omarchy) became the epicenter for this investigation - not because the bug was Omarchy-specific, but because Omarchy represents a movement of people who fix things fast, share openly, and embrace OSS values. When something breaks, they debug collectively and push fixes upstream where everyone benefits.

## Community Debugging

The GitHub issue ([#2184](https://github.com/basecamp/omarchy/issues/2184)) became a hub for collective troubleshooting. Users shared logs, system configurations, and workarounds:

- Downgrading to Chrome 140 worked (narrowed the regression window)
- Running with `--ozone-platform=x11` avoided the crash (isolated to Wayland)
- Disabling `WaylandWpColorManagerV1` feature prevented crashes (identified the subsystem)

This is open source at its best: distributed debugging. Each data point narrowed the search space.

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

A simple timing bug with catastrophic consequences.

## Parallel Solutions

While the Chromium fix was being developed, the Hyprland team created their own workaround (<span style="background: #10b981; color: white; padding: 2px 8px; border-radius: 12px; font-size: 11px; font-weight: bold;">MERGED</span> [**Hyprland workaround**](https://github.com/hyprwm/Hyprland/pull/11877)) to handle Chrome's incorrect ordering more gracefully. This helped their users immediately but didn't solve the root cause.

The proper fix needed to be in Chromium - the protocol violation was on Chrome's side.

## The Fix

**Chromium Bug**: [449370049](https://issues.chromium.org/issues/449370049)
**Fix CL**: <span style="background: #10b981; color: white; padding: 2px 8px; border-radius: 12px; font-size: 11px; font-weight: bold;">MERGED</span> [**Fix color management object lifecycle**](https://crrev.com/c/7003036)
**Merged**: October 6, 2025 (3 days from initial report)
**Reviewers**: Thomas Anderson, Tom Lukaszewicz

The fix was minimal - just reordering the object lifecycle to match protocol requirements. Small change, huge impact.

## Why This Matters

This bug affected:
- Chrome, Brave, Edge (all Chromium-based browsers)
- All Wayland compositors with color management support
- Multi-monitor setups globally

Open source enabled rapid response:
1. Users reported with detailed logs
2. Community identified workarounds
3. Bug was reproduced and fixed
4. Fix merged upstream in 3 days
5. Everyone benefits from the same fix

No NDAs. No private bug trackers. No waiting for vendor support contracts. Just people sharing information until the problem was solved.

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

This wasn't about heroic debugging or individual brilliance. This was about open source working as designed - and about communities like Omarchy that embody these values:

- Transparent bug reports
- Shared reproduction steps
- Public code review
- Fast iteration
- Universal benefit
- Fix it upstream, help everyone

From first report to merged fix: 72 hours. The Omarchy movement isn't just about a Linux distribution - it's about embracing the speed, openness, and collaborative spirit that makes open source powerful. When you fix it for everyone, everyone wins.

---

**Links:**
- [GitHub Issue #2184](https://github.com/basecamp/omarchy/issues/2184)
- [Chromium Bug 449370049](https://issues.chromium.org/issues/449370049)
- <span style="background: #10b981; color: white; padding: 2px 8px; border-radius: 12px; font-size: 11px; font-weight: bold;">MERGED</span> [**Fix color management object lifecycle**](https://crrev.com/c/7003036)
- <span style="background: #10b981; color: white; padding: 2px 8px; border-radius: 12px; font-size: 11px; font-weight: bold;">MERGED</span> [**Hyprland Workaround**](https://github.com/hyprwm/Hyprland/pull/11877)
- [Wayland Color Management Protocol](https://gitlab.freedesktop.org/wayland/wayland-protocols/-/blob/main/staging/color-management/color-management-v1.xml)
