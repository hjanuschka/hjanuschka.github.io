---
title: "Building sesh: SSH and zellij, Native on iPhone and iPad"
category: "iOS / Tools"
tech: "Swift / SwiftUI / SwiftNIO / Rust"
date: "2026-08-09"
image: "https://www.januschka.com/sesh/assets/social.png"
---

*I wanted to check a remote coding session from my phone. I ended up building the mobile SSH workspace I could not find.*

<span style="background: #3b82f6; color: white; padding: 2px 8px; border-radius: 12px; font-size: 11px; font-weight: bold;">APP STORE REVIEW</span>

## The problem was not SSH

SSH clients for iOS already exist. Many of them are very capable. But my actual workflow is no longer just opening a shell, running a command, and disconnecting.

I keep development environments on remote machines. Long-running builds, tests, and coding agents live inside [zellij](https://zellij.dev/) sessions. On a desktop, I can attach to a session, jump between tabs and panes, inspect output, and leave everything organized for later.

On a phone, the same workflow usually becomes a tiny desktop terminal with an on-screen keyboard covering half of it. Even simple operations require remembering prefix keys and typing awkward key combinations. The protocol works, but the interaction model does not.

That became the idea behind **sesh**: keep the terminal real, but make everything around it native to iPhone and iPad.

```snippet
<div class="snippet-block" style="text-align:center;">
  <a href="/sesh/" aria-label="Open the sesh product page">
    <picture>
      <source srcset="/sesh/assets/terminal.webp" type="image/webp">
      <img src="/sesh/assets/terminal.png" alt="sesh showing a controlled two-pane zellij workspace" width="520" height="1130" loading="lazy">
    </picture>
  </a>
</div>
```

## A terminal with native structure

The important distinction is that sesh does not try to replace the terminal. Full-screen programs, shell input, ANSI output, mouse reporting, scrollback, and selection still belong to a terminal emulator.

The app adds native controls for the structure around it:

- zellij sessions become a tappable session list
- tabs become a horizontal native tab strip
- panes can be focused, split, closed, or inspected from an overview
- open shells can be switched without destroying their local terminal view
- SFTP becomes a native file browser
- search, themes, type sizing, and saved commands use normal iOS sheets

That division matters. Reimplementing terminal behavior in SwiftUI would be a dead end, while rendering every control inside a terminal wastes everything iOS is good at.

## Choosing the terminal engine

I first looked at using Ghostty. Its terminal core is impressive, but its iOS embedding and input path were not mature enough for what I needed. I wanted a terminal view that already understood iOS keyboard input, selection, scrolling, and the lifecycle of a UIKit view embedded in SwiftUI.

[SwiftTerm](https://github.com/migueldeicaza/SwiftTerm) was the practical choice. It gave sesh a real terminal emulator while leaving room to build the rest of the experience natively.

The SSH layer uses Citadel and SwiftNIO SSH. That provides async SSH connections, PTY channels, SFTP, host-key validation, and remote port forwarding without dropping into a C wrapper around OpenSSH.

The rough stack looks like this:

```text
SwiftUI navigation and sheets
        |
UIKit / SwiftTerm terminal view
        |
Citadel + SwiftNIO SSH
        |
remote shell or zellij attachment
```

The app ships JetBrains Mono Nerd Font so terminal output is predictable and zellij layouts do not depend on whatever fonts happen to be installed on the device.

## Making zellij understandable to a native app

Attaching to zellij is easy:

```bash
zellij attach --create my-session
```

Understanding its current tabs and panes is harder. zellij's internal IPC is not a stable integration API, and coupling an iOS app to its serialized internal messages would be fragile.

sesh uses two paths instead:

1. A polling fallback based on zellij commands such as `dump-layout`.
2. An optional Rust sidecar plugin that streams semantic layout state.

The sidecar is installed per host and sends information the app actually cares about: active session, tab names, pane focus, pane IDs, and geometry. If it cannot be installed or started, sesh falls back to polling. Native controls remain useful instead of becoming an all-or-nothing feature.

This also exposed a subtle UI problem. Publishing unchanged layout state every few seconds caused SwiftUI to rebuild an open options menu. Under heavy terminal output, an activity timestamp did the same thing once per second. The menu visibly flickered and could not be scrolled.

The fix was not a clever animation. It was to stop treating unchanged background state and terminal byte flow as UI state. Parsed zellij layouts are now published only when they differ, and terminal activity timestamps no longer invalidate the entire screen.

## Shell lifetime is a UI concern

A common mobile navigation mistake is letting the destination view own the SSH PTY. Pop the screen, and the shell disappears with it.

sesh keeps active shells in a workspace object outside the navigation hierarchy. The SwiftTerm view, terminal scrollback, PTY channel, and connection stay attached to that workspace while moving through host lists, files, settings, or another shell.

This is deliberately bounded:

- navigating inside the app does not close the shell
- a connected shell can be reopened with its terminal state intact
- a remote zellij session can be reattached after reconnecting
- a plain remote shell does not magically survive the server closing its PTY

That last point is important. "Persistent" is an easy marketing word, but it overpromises. zellij provides remote session persistence. sesh provides a workspace lifecycle that does not destroy a healthy connection just because a SwiftUI view disappeared.

```snippet
<div class="snippet-block" style="text-align:center;">
  <picture>
    <source srcset="/sesh/assets/shells.webp" type="image/webp">
    <img src="/sesh/assets/shells.png" alt="The Open Shells switcher in sesh" width="520" height="1130" loading="lazy">
  </picture>
</div>
```

## The keyboard is part of the product

Terminal keyboards can become a wall of tiny buttons. My first versions did exactly that. They exposed every zellij action and terminal key all the time, which looked powerful and made the terminal smaller.

The current approach is phone-first:

- extra keys start hidden on iPhone
- a floating keyboard button brings input back
- compact mode fits useful controls into one row
- full and keys-only layouts remain optional
- iPad can make better use of the extra space and hardware keyboard shortcuts

Pane operations are also available from a normal options menu. The always-visible row of unlabeled pane icons was removed after it became clear that even I had to pause and decode some of them.

This sounds cosmetic, but terminal usability on a phone is mostly the sum of small space and input decisions.

## Keys should remain keys

An SSH app has to treat key storage as part of its core architecture, not as a settings feature added at the end.

sesh supports passwords, imported private keys, encrypted key files, reusable identities, and generated Ed25519 keys. Private material is stored in the iOS Keychain. Identities can require Face ID or the device passcode before use.

Host verification uses trust on first use. The first connection stores the server key fingerprint. A later mismatch blocks the connection and shows both fingerprints instead of silently accepting the new key.

There is no sesh account, analytics SDK, advertising SDK, or relay backend. SSH traffic flows directly from the device to the configured host.

## Files, links, and the things around a shell

Once the shell worked, the missing surrounding tools became obvious.

SFTP uses the same SSH connection and presents folders as a native browser with upload, download, rename, delete, progress, and cancellation. HTTP and HTTPS links from terminal output open in an embedded WebKit browser, while custom schemes still go through iOS.

Terminal profiles add themes, text sizing, bell and haptic preferences, and accessory layouts per host. Host cards can show protected local terminal snapshots without opening miniature background SSH sessions.

On iPad, the same model expands into a sidebar, resizable layouts, hardware keyboard shortcuts, and separate windows for Stage Manager.

## NFC security-key forwarding

One specialized workflow pushed the SSH layer further. Some remote tools request a WebAuthn assertion while the command itself is running on another machine.

Third-party iOS apps cannot access a USB-C security key through raw FIDO HID. NFC is available, so sesh can receive a supported forwarded WebAuthn challenge over a loopback-only remote port and perform the assertion against an NFC FIDO2 security key.

The private key never leaves the security key. sesh forwards a challenge and returns the signed assertion. The integration currently targets compatible remote tooling rather than pretending to be a universal FIDO transport.

## Free, with optional tips

sesh is free. Hosts, identities, SFTP, zellij controls, themes, and security features are not gated.

There are three optional one-time tips through StoreKit. They unlock nothing and never renew. A reminder appears only after meaningful use, at most once per calendar month, and can be disabled permanently.

Even that simple model had an App Store detail I had not expected: Apple's first consumable in-app purchase must be submitted together with an app version. The three tips therefore had to be attached to the same review submission as version 1.0 rather than reviewed independently.

## What shipped

The first version grew beyond the original "zellij buttons on an SSH terminal" idea:

- native SSH terminal on iPhone and iPad
- zellij sessions, tabs, panes, overview, and optional sidecar integration
- connection-aware shell workspaces and reconnect support
- Keychain identities, Ed25519 generation, and biometric protection
- TOFU host-key pinning
- native SFTP
- terminal search, selection, themes, profiles, and compact keys
- embedded web links
- compatible NFC FIDO2 challenge forwarding
- optional one-time tips with no feature gating

The app is currently in App Store review. The product page, screenshots, privacy details, and eventual download link live at [januschka.com/sesh](/sesh/).

## The lesson

Building sesh reinforced something I keep seeing in developer tools: moving a desktop workflow to mobile is not a scaling exercise.

The SSH protocol did not need to change. zellij did not need a mobile clone. The useful work was deciding which state belongs to the terminal, which belongs to the connection, which belongs to the app workspace, and which actions should become native touch UI.

A mobile developer tool feels native when it stops asking the user to pretend they still have a desktop keyboard and a large screen.

---

**Links:**

- [sesh product page](/sesh/)
- [Privacy policy](/sesh-privacy.html)
- [zellij](https://zellij.dev/)
- [SwiftTerm](https://github.com/migueldeicaza/SwiftTerm)
