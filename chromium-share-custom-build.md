---
title: "Packaging a Custom Chromium Build for Distribution"
category: "Chromium"
tech: "Build / Packaging"
---

*Turning a patched developer build into an installable artifact for people without a Chromium toolchain*

**Status:** 🛠️ Guide

## The Problem

A common situation: you have built Chromium with a change - a flipped feature flag, a fix, a proof of concept - and you need to hand the result to someone who does not have a Chromium build environment. They will not sync the tree or launch a binary from a build directory, and they should not have to.

Copying `out/Release` and sending it does not work either. A standard developer build is a **component build**: the binary is split into hundreds of loose `.so` / `.dylib` files next to `chrome` to speed up incremental linking. It is not relocatable and not distributable. It is also unsigned, and each operating system has its own guard rails against running a loose bundle - quarantine on macOS, side-by-side assembly activation on Windows.

The deliverable a non-developer expects is an ordinary package: a `.deb` / `.rpm`, a proper `.app`, or an installer `.exe`.

## The One Setting That Matters

Regardless of platform, the rule is:

```gn
is_component_build = false
```

A component build is ideal for iterating and useless for distribution. Build **non-component release** for anything that leaves the build machine. `is_official_build` is not required (that enables PGO and branded release builds) - a plain release, non-component build is sufficient to distribute.

A minimal distributable `args.gn`:

```gn
is_debug           = false
is_component_build = false
symbol_level       = 0
```

From there, each platform provides a dedicated packaging target.

## Linux: .deb and .rpm

Chromium's build system produces distribution packages directly:

```bash
autoninja -C out/Release chrome/installer/linux:stable_deb
autoninja -C out/Release chrome/installer/linux:stable_rpm
```

This writes a `.deb` and a `.rpm` into `out/Release/`. The recipient installs it with their package manager:

```bash
sudo dpkg -i chromium-*.deb     # Debian / Ubuntu
sudo rpm -i  chromium-*.rpm      # Fedora / RHEL / openSUSE
```

The build installs like any other browser, registers in the application menu, and integrates with the package manager for updates and removal. This is the most robust option: the packaging target handles the filesystem layout, desktop entry, and icons.

## macOS: A Universal .app

On macOS the distributable artifact is `Chromium.app`. Two considerations apply:

1. The bundle must come from a **non-component** build (same rule as above) so the app is self-contained.
2. Recipients may be on Intel or Apple Silicon. Rather than shipping two builds, produce both architectures and merge them into a single **universal** app with `universalizer.py`.

The build-and-universalize script:

```bash
#!/usr/bin/env bash
# Build a release universal (x64 + arm64) Chromium.app.
#
# Produces:
#   $CHROMIUM_SRC/out/release_x64/Chromium.app        (Intel)
#   $CHROMIUM_SRC/out/release_arm64/Chromium.app      (Apple Silicon)
#   $CHROMIUM_SRC/out/release_universal/Chromium.app  (fat)
#
# Usage:
#   binary_build.sh                 # both arches + universalize
#   binary_build.sh x64             # only x64
#   binary_build.sh arm64           # only arm64
#   binary_build.sh universal-only  # merge existing dirs only
set -euo pipefail

CHROMIUM_SRC="${CHROMIUM_SRC:-$HOME/chromium/src}"
TARGET="${1:-both}"
cd "$CHROMIUM_SRC"

# Shared args. is_component_build MUST be false for a universal-mergeable app.
common_args() {
  cat <<'GN'
target_os          = "mac"
is_debug           = false
is_component_build = false
is_official_build  = false
symbol_level       = 0
blink_symbol_level = 0
v8_symbol_level    = 0
GN
}

seed_args() {
  local outdir="$1" cpu="$2"
  mkdir -p "$outdir"
  { common_args; echo "target_cpu = \"$cpu\""; } > "$outdir/args.gn"
}

build_one() {
  local cpu="$1" outdir="out/release_${1}"
  echo ">> Configuring $outdir (target_cpu=$cpu) ..."
  seed_args "$outdir" "$cpu"
  gn gen "$outdir"
  echo ">> Building chrome in $outdir ..."
  autoninja -C "$outdir" chrome
}

universalize() {
  local x64_app="out/release_x64/Chromium.app"
  local arm_app="out/release_arm64/Chromium.app"
  local out_app="out/release_universal/Chromium.app"
  [ -d "$x64_app" ] && [ -d "$arm_app" ] || { echo "!! build both arches first" >&2; exit 1; }
  echo ">> Universalizing into $out_app ..."
  mkdir -p out/release_universal
  rm -rf "$out_app"
  chrome/installer/mac/universalizer.py "$x64_app" "$arm_app" "$out_app"
  file "$out_app/Contents/MacOS/Chromium" || true
}

case "$TARGET" in
  x64)            build_one x64 ;;
  arm64)          build_one arm64 ;;
  universal-only) universalize ;;
  both|"")        build_one x64; build_one arm64; universalize ;;
  *) echo "usage: $0 [x64|arm64|both|universal-only]" >&2; exit 2 ;;
esac
```

The output, `out/release_universal/Chromium.app`, is a single bundle that runs on both Intel and Apple Silicon.

### The Gatekeeper Consideration

An unsigned build - one without an Apple Developer ID - is quarantined by macOS. The simplest path for a recipient is to clear the quarantine attribute after copying the app to `/Applications`:

```bash
xattr -dr com.apple.quarantine /Applications/Chromium.app
```

An ad-hoc signature also allows the app to launch without the right-click-Open workaround:

```bash
codesign --force --deep --sign - out/release_universal/Chromium.app
```

A full Developer ID signature plus notarization is the correct approach for wider distribution, but ad-hoc signing plus quarantine removal is adequate for internal or one-off sharing.

## Windows: mini_installer

On Windows, do not distribute a raw `chrome.exe` from a build directory - side-by-side assembly activation does not support running the binary out of `out/Release`. Build the installer instead:

```bash
autoninja -C out/Release mini_installer
```

This produces `mini_installer.exe`: a self-contained installer. It installs Chromium into the user profile, registers the Start menu entry, and behaves like a normal application install.

## Summary

| Platform | Command | Artifact | Recipient action |
|---|---|---|---|
| Linux (deb) | `autoninja -C out/Release chrome/installer/linux:stable_deb` | `*.deb` | `sudo dpkg -i` |
| Linux (rpm) | `autoninja -C out/Release chrome/installer/linux:stable_rpm` | `*.rpm` | `sudo rpm -i` |
| macOS | `binary_build.sh` (universal) | `Chromium.app` | copy to Applications, clear quarantine |
| Windows | `autoninja -C out/Release mini_installer` | `mini_installer.exe` | run the installer |

The principle is consistent across platforms: build **non-component release**, then use the platform's packaging target. Skipping that step means distributing a directory of loose libraries and a binary that will not launch. Following it produces an artifact that installs like any other browser - which is what a recipient without a Chromium toolchain expects.
