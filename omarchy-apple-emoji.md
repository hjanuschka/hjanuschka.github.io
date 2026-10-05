---
title: "Apple Emojis on Omarchy: Why fc-match Lies to You"
category: "Linux"
tech: "fontconfig"
---

*Installing the font is the easy 10%. Making it actually render is a fontconfig fallback-chain debugging session.*

---

## The Goal

Omarchy ships with Noto Color Emoji, like most Linux distros. If your muscle
memory (and taste) comes from macOS, you want Apple Color Emoji everywhere:
the browser, Slack, the Omarchy emoji picker, the bar.

The AUR has you covered -- sort of:

```bash
yay -S ttf-apple-emoji
fc-cache -f
```

The package even ships a ready-made fontconfig at
`/usr/share/fontconfig/conf.avail/75-apple-color-emoji.conf` and tells you to
symlink it:

```bash
sudo ln -sf /usr/share/fontconfig/conf.avail/75-apple-color-emoji.conf \
  /etc/fonts/conf.d/75-apple-color-emoji.conf
fc-cache -f
```

And now the obvious verification *passes*:

```
$ fc-match emoji
apple-color-emoji.ttf: "Apple Color Emoji" "Regular"
$ fc-match "Noto Color Emoji"
apple-color-emoji.ttf: "Apple Color Emoji" "Regular"
```

Ship it? Not so fast. Open the emoji picker and the pistol emoji is still
Noto's orange toy, not Apple's green water gun. 🔫

## Why fc-match Lies

`fc-match emoji` answers the question *"if an app explicitly asks for the
family 'emoji', what do you give it?"*. But that's not how emoji rendering
works in practice. Your terminal, the Omarchy shell (Quickshell/Qt), and
Chromium all render text in a **UI font** -- and when that font has no glyph
for 😀, fontconfig walks a *fallback chain*.

The question you actually need to ask is: *"for this codepoint, starting from
my UI font, which font wins?"* That's `fc-match -s` with a charset:

```
$ fc-match -s "CaskaydiaMono Nerd Font:charset=1f600" | head -3
NotoColorEmoji.ttf: "Noto Color Emoji" "Regular"
apple-color-emoji.ttf: "Apple Color Emoji" "Regular"
fa-regular-400.woff2: "Font Awesome 7 Free" "Regular"
```

Noto first. Apple second. The symlinked conf did remap *explicit requests*
for "Noto Color Emoji" -- but during glyph fallback nobody requests any
family by name, so those `<match>` rules never fire.

## Finding the Culprits

Who is pinning Noto ahead? Grep the enabled fontconfig chain:

```bash
grep -rl "Noto Color Emoji" /etc/fonts/conf.d/ /usr/share/fontconfig/conf.*
```

Two offenders, both processed *before* the Apple conf (lower numbers win the
pattern-building race):

**`50-omarchy.conf`** -- Omarchy's own font config appends Noto to every
generic family via accept-aliases:

```xml
<alias>
  <family>sans-serif</family>
  <accept>
    <family>JetBrainsMono Nerd Font</family>
    <family>Noto Color Emoji</family>
  </accept>
</alias>
```

**`60-generic.conf`** -- fontconfig's stock emoji preference list, Noto
before Apple:

```xml
<family>Noto Color Emoji</family> <!-- Google -->
<family>Apple Color Emoji</family> <!-- Apple -->
```

Both files are package-owned. Editing them works until the next
`pacman -Syu` or `omarchy update` silently reverts your change.

## The Fix: Reject, Don't Reorder

Instead of fighting the ordering, remove Noto from the race entirely. Apple
Color Emoji covers the full emoji set, and on Arch `noto-fonts-emoji` has no
reverse dependencies -- nothing *needs* Noto's glyphs.

Fontconfig's `<rejectfont>` blacklists a font from matching altogether, and
it works from the **user-level** config regardless of system conf ordering.
Create `~/.config/fontconfig/fonts.conf`:

```xml
<?xml version="1.0"?>
<!DOCTYPE fontconfig SYSTEM "fonts.dtd">
<fontconfig>
  <!-- Noto Color Emoji outranks Apple Color Emoji in the system fallback
       chain (50-omarchy.conf accept-aliases, 60-generic.conf prefer list),
       both package-owned. Rejecting it here is the only override that works
       regardless of conf ordering; Apple Color Emoji covers the full set. -->
  <selectfont>
    <rejectfont>
      <pattern>
        <patelt name="family">
          <string>Noto Color Emoji</string>
        </patelt>
      </pattern>
    </rejectfont>
  </selectfont>
</fontconfig>
```

Then:

```bash
fc-cache -f
```

## Proof

Run the *real* verification -- fallback from your UI font, per codepoint:

```
$ fc-match -s "CaskaydiaMono Nerd Font:charset=1f600" | head -3
apple-color-emoji.ttf: "Apple Color Emoji" "Regular"
fa-regular-400.woff2: "Font Awesome 7 Free" "Regular"
fa-solid-900.woff2: "Font Awesome 7 Free" "Solid"
```

Apple is #1 and Noto is gone from the list entirely. Restart what you look
at:

```bash
omarchy restart shell   # emoji picker + bar
# browsers need a full quit + relaunch
```

Open the Omarchy emoji picker (`SUPER+CTRL+E`): green water gun. 🎉

## Takeaways

- `fc-match emoji` only tests explicit family requests. Real emoji rendering
  goes through per-codepoint fallback -- test with
  `fc-match -s "<your-ui-font>:charset=1f600"`.
- Drop-in confs that remap family names (like the one `ttf-apple-emoji`
  ships) don't touch the fallback sort order.
- `<rejectfont>` in `~/.config/fontconfig/fonts.conf` beats any system-level
  preference list, survives package updates, and lives in your dotfiles repo
  instead of `/etc`.
