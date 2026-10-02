---
title: "Keeping Emoji Families Together in Vertical Text"
category: "Chromium"
tech: "C++ / Blink / Unicode"
---

*For eight years, Chrome broke up every emoji family that dared to go vertical. 👨‍👩‍👧‍👦 walked into `writing-mode: vertical-rl` and came out as four separate people.*

**Status:** 🎉 Landed

---

## The Bug: A Family Torn Apart

Modern emoji are often not one character. The family emoji 👨‍👩‍👧‍👦 is actually seven code points: man, ZWJ, woman, ZWJ, girl, ZWJ, boy. The ZERO WIDTH JOINER (U+200D) glues them together, and the font renders the whole sequence as a single glyph.

That worked fine in horizontal text. But switch to vertical writing mode - the kind used for Japanese novels, signage, and anything with `writing-mode: vertical-rl` - and Chrome split the sequence apart:

```html
<div style="writing-mode: vertical-rl">家族は👨‍👩‍👧‍👦です</div>
```

Instead of one family glyph, you got 👨 👩 👧 👦 - four individual emoji stacked on top of each other. Same for the polar bear 🐻‍❄️ (which decomposed into a regular bear and a snowflake ❄️), the pirate flag 🏴‍☠️ (a plain black flag and a skull), and every other ZWJ sequence.

The bug was [filed in 2018](https://issues.chromium.org/issues/41384307) against Chrome 68: *"Elements with writing-mode:tb-rl don't display ZWJ Emoji sequences expectedly."* It sat there for eight years while emoji ZWJ sequences only got more common.

## Try It: Live Samples

The first two columns are real `content_shell` screenshots from the same patched build, with the `EmojiZWJVerticalOrientation` flag off (before) and on (after). The third column is live in **your** browser - if it has the fix, it matches the "after" shot; if not, it looks like "before".

```snippet
<div style="display: flex; gap: 24px; flex-wrap: wrap; justify-content: center; align-items: flex-start; background: var(--bg-secondary); border-radius: 12px; padding: 24px; margin: 16px 0;">
  <div style="text-align: center;">
    <div style="font-size: 12px; color: #ef4444; margin-bottom: 8px;">before<br>(content_shell)</div>
    <img src="/assets/emoji-vertical-zwj/before-family-vrl.png" alt="Pre-fix content_shell: four separate people stacked in vertical-rl" style="height: 169px; border: 1px dashed #ef4444; border-radius: 8px; background: #fff;">
  </div>
  <div style="text-align: center;">
    <div style="font-size: 12px; color: #6abf69; margin-bottom: 8px;">after<br>(content_shell)</div>
    <img src="/assets/emoji-vertical-zwj/after-family-vrl.png" alt="Patched content_shell: one family glyph in vertical-rl" style="height: 52px; border: 1px solid #6abf69; border-radius: 8px; background: #fff;">
  </div>
  <div style="text-align: center;">
    <div style="font-size: 12px; color: var(--accent); margin-bottom: 8px;">live<br>(your browser)</div>
    <div style="writing-mode: vertical-rl; font-size: 32px; line-height: 1.4; border: 1px solid var(--accent); border-radius: 8px; padding: 12px; margin: 0 auto;">👨‍👩‍👧‍👦</div>
  </div>
</div>
```

And in context, the way the original reporter hit it - emoji inside vertical Japanese text ("The family is 👨‍👩‍👧‍👦" / "There are 🐻‍❄️ at the North Pole"):

```snippet
<div style="display: flex; gap: 32px; flex-wrap: wrap; justify-content: center; background: var(--bg-secondary); border-radius: 12px; padding: 24px; margin: 16px 0;">
  <div style="text-align: center;">
    <div style="font-size: 12px; color: #ef4444; margin-bottom: 8px;">before (content_shell)</div>
    <img src="/assets/emoji-vertical-zwj/before-japanese-vrl.png" alt="Pre-fix content_shell: emoji confetti inside vertical Japanese text" style="height: 242px; border: 1px dashed #ef4444; border-radius: 8px; background: #fff;">
  </div>
  <div style="text-align: center;">
    <div style="font-size: 12px; color: #6abf69; margin-bottom: 8px;">after (content_shell)</div>
    <img src="/assets/emoji-vertical-zwj/after-japanese-vrl.png" alt="Patched content_shell: family and polar bear as single glyphs inside vertical Japanese text" style="height: 205px; border: 1px solid #6abf69; border-radius: 8px; background: #fff;">
  </div>
  <div style="text-align: center;">
    <div style="font-size: 12px; color: var(--accent); margin-bottom: 8px;">live (your browser)</div>
    <div style="writing-mode: vertical-rl; font-size: 22px; line-height: 1.6; border: 1px solid var(--accent); border-radius: 8px; padding: 12px; margin: 0 auto;">家族は👨‍👩‍👧‍👦です。<br>北極には🐻‍❄️がいる。</div>
  </div>
</div>
```

## Why It Broke: The ZWJ Is "Rotated"

Vertical text in Blink goes through an `OrientationIterator` that splits text into runs before shaping. Each run gets one of two orientations from [UAX #50](https://www.unicode.org/reports/tr50/):

- **Upright** - CJK characters, emoji: drawn as-is, stacked vertically
- **Rotated** - Latin letters, punctuation: rotated 90 degrees sideways

Emoji are Upright. But the invisible ZWJ between them is classified **Rotated**. The iterator only treated `Grapheme_Extend` characters as "part of the previous cluster", and ZWJ is *not* `Grapheme_Extend` - it is its own grapheme-break class.

So for 👨‍👩‍👧‍👦 the iterator produced seven runs:

```
👨   → Upright
ZWJ  → Rotated   ← run boundary!
👩   → Upright   ← run boundary!
ZWJ  → Rotated   ...
👧   → Upright
ZWJ  → Rotated
👦   → Upright
```

Each run is shaped separately by HarfBuzz. The font never sees the full sequence in one shaping call, so the ligature that forms the single family glyph can never apply. The family gets split up by an invisible character whose entire purpose is to hold them together. 🙃

## The Fix: Follow the Grapheme Rules

[UAX #29](https://www.unicode.org/reports/tr29/) already defines exactly when characters belong to the same grapheme cluster:

- **GB9**: don't break before Extend or ZWJ
- **GB11**: don't break between `Extended_Pictographic ZWJ` and another `Extended_Pictographic`

The fix teaches the orientation iterator those two rules ([CL 8494798](https://crrev.com/c/8494798)):

```cpp
// UAX #29 rule GB9 keeps Extend and ZWJ in the preceding grapheme cluster, and
// rule GB11 keeps a pictograph that a ZWJ joins to a preceding pictograph:
// \p{Extended_Pictographic} Extend* ZWJ x \p{Extended_Pictographic}.
bool ExtendsGraphemeCluster(UChar32 character,
                            UChar32 cluster_base,
                            bool after_zwj) {
  if (Character::IsGraphemeExtended(character)) {
    return true;
  }
  if (character == uchar::kZeroWidthJoiner) {
    return true;
  }
  return after_zwj && Character::IsExtendedPictographic(character) &&
         Character::IsExtendedPictographic(cluster_base);
}
```

Now the whole sequence stays in one Upright run, HarfBuzz shapes it in one pass, and the font's ligature does its job. The orientation still comes from the cluster's *first* character, exactly as UAX #50 prescribes for grapheme clusters.

The GB11 condition matters for correctness: a ZWJ between two Latin letters (`a + ZWJ + b`) does **not** merge runs - only pictograph-to-pictograph joins do. The new behaviour sits behind a runtime flag (`EmojiZWJVerticalOrientation`), on by default, as a kill switch in case something regresses.

## More Victims, Reunited

A small gallery of sequences that were being decomposed. Each triple is the same `content_shell` build with the flag off, with the flag on, and your own browser rendering it live.

```snippet
<div style="display: flex; gap: 40px; flex-wrap: wrap; justify-content: center; align-items: flex-start; background: var(--bg-secondary); border-radius: 12px; padding: 24px; margin: 16px 0;">
  <div style="text-align: center;">
    <div style="font-size: 12px; color: var(--text-muted); margin-bottom: 8px;">pirate flag + polar bear</div>
    <div style="display: flex; gap: 12px; justify-content: center; align-items: flex-start;">
      <div>
        <div style="font-size: 11px; color: #ef4444; margin-bottom: 4px;">before</div>
        <img src="/assets/emoji-vertical-zwj/before-flag-bear-vrl.png" alt="Pre-fix content_shell: flag, skull, bear and snowflake stacked separately" style="height: 151px; border: 1px dashed #ef4444; border-radius: 8px; background: #fff;">
      </div>
      <div>
        <div style="font-size: 11px; color: #6abf69; margin-bottom: 4px;">after</div>
        <img src="/assets/emoji-vertical-zwj/after-flag-bear-vrl.png" alt="Patched content_shell: pirate flag and polar bear as single glyphs in vertical-rl" style="height: 75px; border: 1px solid #6abf69; border-radius: 8px; background: #fff;">
      </div>
      <div>
        <div style="font-size: 11px; color: var(--accent); margin-bottom: 4px;">live</div>
        <div style="writing-mode: vertical-rl; font-size: 28px; line-height: 1.4; border: 1px solid var(--accent); border-radius: 8px; padding: 8px;">🏴‍☠️🐻‍❄️</div>
      </div>
    </div>
  </div>
  <div style="text-align: center;">
    <div style="font-size: 12px; color: var(--text-muted); margin-bottom: 8px;">technologist + farmer</div>
    <div style="display: flex; gap: 12px; justify-content: center; align-items: flex-start;">
      <div>
        <div style="font-size: 11px; color: #ef4444; margin-bottom: 4px;">before</div>
        <img src="/assets/emoji-vertical-zwj/before-tech-farmer-vrl.png" alt="Pre-fix content_shell: woman, laptop, man and sheaf stacked separately" style="height: 148px; border: 1px dashed #ef4444; border-radius: 8px; background: #fff;">
      </div>
      <div>
        <div style="font-size: 11px; color: #6abf69; margin-bottom: 4px;">after</div>
        <img src="/assets/emoji-vertical-zwj/after-tech-farmer-vrl.png" alt="Patched content_shell: technologist and farmer as single glyphs in vertical-rl" style="height: 82px; border: 1px solid #6abf69; border-radius: 8px; background: #fff;">
      </div>
      <div>
        <div style="font-size: 11px; color: var(--accent); margin-bottom: 4px;">live</div>
        <div style="writing-mode: vertical-rl; font-size: 28px; line-height: 1.4; border: 1px solid var(--accent); border-radius: 8px; padding: 8px;">👩‍💻👨‍🌾</div>
      </div>
    </div>
  </div>
</div>
```

The same applied to every other ZWJ sequence - 🧑‍🚀 🧑‍🍳 ❤️‍🔥 😶‍🌫️ - anything held together by an invisible joiner fell apart the moment the text turned vertical.

## The Takeaway

Run segmentation happens *before* shaping, so any segmenter that splits inside a grapheme cluster silently defeats font ligatures - no error, no warning, just a bear standing next to a snowflake wondering what happened. If an iterator decides where shaping runs begin and end, it has to respect UAX #29 cluster boundaries, not just the `Grapheme_Extend` property.

Four files, ~80 lines, one eight-year-old bug, and the family is back together. 👨‍👩‍👧‍👦

## Links

- <span style="background: #10b981; color: white; padding: 2px 8px; border-radius: 12px; font-size: 11px; font-weight: bold;">MERGED</span> [**Keep emoji ZWJ sequences in one vertical orientation run**](https://crrev.com/c/8494798)
- [Issue 41384307: Elements with writing-mode:tb-rl don't display ZWJ Emoji sequences expectedly](https://issues.chromium.org/issues/41384307)
- [Interactive sampler: before/after vertical emoji rendering](https://static.januschka.com/i-41384307/index.html)
- [UAX #29: Unicode Text Segmentation (GB9, GB11)](https://www.unicode.org/reports/tr29/)
- [UAX #50: Unicode Vertical Text Layout](https://www.unicode.org/reports/tr50/)

---

Thanks to:
- **Kent Tamura** for the review and for suggesting the runtime-flag kill switch
