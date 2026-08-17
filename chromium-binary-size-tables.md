---
title: "Shrinking Chromium's Binary, One Table at a Time"
category: "Chromium"
tech: "C++ / Binary Size"
---

*Sometimes the expensive part of generated code is not the data. It is spelling out the same operation once for every entry.*

**Status:** 🚧 Ongoing

## The Shape of the Problem

I previously wrote about [moving static data out of the Chrome binary](/chromium-binary-size.html) - putting USB IDs and compressed phone metadata into lazily-loaded resources. This is the other side of binary-size work: data that legitimately belongs in the binary, but is represented by far too much generated code.

Chromium generates a surprising amount of C++: feature registries, UKM maps, enum-name lookups, sanitizer configurations, color mappings, locale caches, and resource maps. A generator often emits the most direct implementation - one initializer, function call, or setter per entry.

That is readable in the generator, but expensive in the binary. Repeating an operation for every entry produces machine code, relocations, padding, and sometimes static constructors. When the operation is identical and only the inputs change, the implementation wants to be **data plus one loop**.

## Measuring the Whole Batch

I built an [interactive binary-size dashboard](https://static.januschka.com/apk-size/) from Chromium's `android-binary-size` and `compile-size` trybot results. Every point links back to its CL and records the newest patchset for which a size bot reported numbers.

The dashboard can switch between per-CL deltas and a cumulative view, include or exclude unlanded CLs, and apply a deliberately conservative rule: count savings from an unlanded CL, but do not pretend its size increases have shipped.

For the 12 table/offset changes discussed here, the latest recorded patchsets add up to roughly:

- **567 KiB smaller** on the high-end arm64 APK metric;
- **194 KiB smaller** on arm32.

Those are not interchangeable measurements. Architecture, alignment, relocation encoding, and linker decisions can make the same representation win by very different amounts. The dashboard keeps the raw dimensions separate instead of collapsing them into one impressive-looking number.

## Case Study: GL Enum Names

The generated GL enum table stored a `std::string_view` in every entry. On 64-bit builds that made each entry 24 bytes and required a relative relocation for every name.

The replacement concatenates all names into one string blob and stores a 32-bit offset:

```cpp
struct EnumName {
  uint32_t value;
  uint32_t name_offset;
};
```

The entries shrink from 24 bytes to 8, the table moves from `.data.rel.ro` to `.rodata`, and the per-entry name relocations disappear. The current size-bot patchset reports **18,904 bytes saved on arm64**, while arm32 grows by 1,684 bytes. That split is useful evidence: a source-level representation change does not have one universal binary-size result.

- <span style="background: #3b82f6; color: white; padding: 2px 8px; border-radius: 12px; font-size: 11px; font-weight: bold;">IN REVIEW</span> [**Store GL enum names as offsets into a single string table**](https://chromium-review.googlesource.com/c/chromium/src/+/8185934)

## Case Study: Workaround Flags

`GpuDriverBugWorkarounds::ToIntSet()` expanded an `if` plus `push_back` for every workaround. The result was many copies of the same instruction sequence.

A constexpr table of workaround IDs and pointers-to-members lets one loop do the work. The output vector is unchanged; the current dashboard result is **2,160 bytes saved on arm64** and **1,760 bytes on arm32**.

- <span style="background: #3b82f6; color: white; padding: 2px 8px; border-radius: 12px; font-size: 11px; font-weight: bold;">IN REVIEW</span> [**Build GpuDriverBugWorkarounds::ToIntSet() from a member table**](https://chromium-review.googlesource.com/c/chromium/src/+/8175466)

## Case Study: Generated Registries

The same pattern appeared in several generators:

- UKM decode maps emitted hash immediates and initializer code per metric. The data-driven version saves **161,284 arm64 bytes**.
- Runtime features had one static bool and outlined setter per feature. A single state array plus `uint16_t` indices removes padding, setter instantiations, and relocations: **114,200 arm64 bytes saved**.
- The ICU locale cache constructed each canonical locale inline. A tag table and loop build the identical cache without unrolling the same conversion for every tag: **18,152 arm64 bytes saved**.
- Sanitizer configs constructed every `QualifiedName` in nested initializer lists. Function-local name tables and small helpers produce the same configuration.

Representative landed changes:

- <span style="background: #10b981; color: white; padding: 2px 8px; border-radius: 12px; font-size: 11px; font-weight: bold;">MERGED</span> [**Make the generated UKM decode map data-driven**](https://chromium-review.googlesource.com/c/chromium/src/+/8185555)
- <span style="background: #10b981; color: white; padding: 2px 8px; border-radius: 12px; font-size: 11px; font-weight: bold;">MERGED</span> [**Use a state array and indices in runtime feature lookup tables**](https://chromium-review.googlesource.com/c/chromium/src/+/8185556)
- <span style="background: #10b981; color: white; padding: 2px 8px; border-radius: 12px; font-size: 11px; font-weight: bold;">MERGED</span> [**Build the ICU locale cache from a tag table**](https://chromium-review.googlesource.com/c/chromium/src/+/8174346)

The same experiment is still in review for Trusted Types event-handler names, settings dispatch, color-mixer registrations, sanitizer builtins, and default share-ranking data. Together they test where table-driven startup remains clearer and where the extra indirection is not worth it.

- <span style="background: #3b82f6; color: white; padding: 2px 8px; border-radius: 12px; font-size: 11px; font-weight: bold;">IN REVIEW</span> [**Build Trusted Types event-handler attributes from a name table**](https://chromium-review.googlesource.com/c/chromium/src/+/8185854)
- <span style="background: #3b82f6; color: white; padding: 2px 8px; border-radius: 12px; font-size: 11px; font-weight: bold;">IN REVIEW</span> [**Define UKM metric setters inline in the generated header**](https://chromium-review.googlesource.com/c/chromium/src/+/8183021)
- <span style="background: #3b82f6; color: white; padding: 2px 8px; border-radius: 12px; font-size: 11px; font-weight: bold;">IN REVIEW</span> [**Dispatch SettingsBase setters through tables**](https://chromium-review.googlesource.com/c/chromium/src/+/8186155)
- <span style="background: #3b82f6; color: white; padding: 2px 8px; border-radius: 12px; font-size: 11px; font-weight: bold;">IN REVIEW</span> [**Register plain color mappings from tables**](https://chromium-review.googlesource.com/c/chromium/src/+/8185557)
- <span style="background: #3b82f6; color: white; padding: 2px 8px; border-radius: 12px; font-size: 11px; font-weight: bold;">IN REVIEW</span> [**Generate sanitizer configs as name tables plus loops**](https://chromium-review.googlesource.com/c/chromium/src/+/8185914)
- <span style="background: #10b981; color: white; padding: 2px 8px; border-radius: 12px; font-size: 11px; font-weight: bold;">MERGED</span> [**Use constexpr tables for default share-ranking data**](https://chromium-review.googlesource.com/c/chromium/src/+/8181075)

## Resource Maps: Keep the Development Feature

GRIT resource maps had a different trap. Each production entry carried a path pointer, ID, and an `std::optional` filesystem path used only by a local WebUI development workflow. Removing the development path would save space but break a useful workflow.

The compact representation keeps both behaviors: URL and optional development paths become offsets into one deduplicated string blob. Production entries shrink without deleting the local loading feature. The current trybot result reports **31,072 bytes saved on arm64** and **6,404 bytes on arm32**.

- <span style="background: #3b82f6; color: white; padding: 2px 8px; border-radius: 12px; font-size: 11px; font-weight: bold;">IN REVIEW</span> [**Compact GRIT resource map entries**](https://chromium-review.googlesource.com/c/chromium/src/+/8182732)

## Finding Candidates

The useful review question is:

> Does this generator emit one copy of an operation for every entry, when it could emit the entries as data and execute the operation once?

Good signs are generated switches, long initializer lists with non-trivial constructors, one static variable per feature, repeated string pointers, and large tables in relocation-heavy sections.

Binary size is rarely one spectacular deletion. It is a collection of representation choices. Tables, offsets, and loops are not automatically better, but when behavior is uniform and inputs are static, they usually express the problem more directly - and the linker tends to agree.

## Links

- [Interactive APK and compile-size dashboard](https://static.januschka.com/apk-size/)
- [Related: Moving Data Out of the Chrome Binary](/chromium-binary-size.html)
- [GL enum string table](https://chromium-review.googlesource.com/c/chromium/src/+/8185934)
- [GPU workaround member table](https://chromium-review.googlesource.com/c/chromium/src/+/8175466)
- [UKM decode map](https://chromium-review.googlesource.com/c/chromium/src/+/8185555)
- [Runtime feature state array](https://chromium-review.googlesource.com/c/chromium/src/+/8185556)
- [Compact GRIT maps](https://chromium-review.googlesource.com/c/chromium/src/+/8182732)
