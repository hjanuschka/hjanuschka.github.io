---
title: "Turning Repeated C++ Review Feedback into clang-tidy Checks"
category: "LLVM"
tech: "C++ / Clang"
---

*Automating recurring modernization suggestions so they can be applied consistently.*

**Status:** Ongoing | **Merged PR:** [#116033](https://github.com/llvm/llvm-project/pull/116033)

---

## The Origin Story

Years ago, while working on Chromium, Peter Kasting introduced me to clang-tidy. During code reviews he'd point out patterns that could be automated - things he'd seen hundreds of times, anti-patterns that kept appearing, modernization opportunities too tedious to do by hand.

I started keeping my own scratchpad, jotting down his suggestions and ideas. That document sat there for years - until I recently picked it back up.

## Why clang-tidy Matters for Large Codebases

In a large C++ codebase such as Chromium, recurring modernization patterns are difficult to apply consistently by hand. clang-tidy can identify a specific pattern, explain the replacement, and in suitable cases generate the edit automatically.

Chromium actively uses clang-tidy for ongoing modernization. The `base::StringPiece` to `std::string_view` migration, the adoption of `std::optional`, the move to `starts_with`/`ends_with` - all of these are driven by clang-tidy checks that find patterns and transform them at scale.

## Extending modernize-use-starts-ends-with

The merged PR extends an existing check to detect a common pattern:

```cpp
// Before: Creates a temporary string, then compares
if (str.substr(0, 5) == "hello") { ... }

// After: Direct comparison, no allocation
if (str.starts_with("hello")) { ... }
```

The `starts_with` method was added in C++20. It's clearer, faster (no temporary string), and expresses intent better.

The PR ([#116033](https://github.com/llvm/llvm-project/pull/116033)) extended `modernize-use-starts-ends-with` to catch substr patterns. The review process was educational - the LLVM community suggested integrating it into the existing check rather than creating a new one.

Key patterns now detected:
- `str.substr(0, n) == "prefix"` → `str.starts_with("prefix")`
- `str.substr(0, prefix.size()) == prefix` → `str.starts_with(prefix)`
- `str.substr(0, strlen("foo")) == "foo"` → `str.starts_with("foo")`

## Candidate Checks

Some older review suggestions became practical once C++20 and C++23 facilities were available. The following PRs explore those patterns:

**Modernization checks:**
- <span style="background: #3b82f6; color: white; padding: 2px 8px; border-radius: 12px; font-size: 11px; font-weight: bold;">OPEN</span> [**modernize-use-span-param**](https://github.com/llvm/llvm-project/pull/182027) - Suggest `std::span` for pointer+size parameter pairs
- <span style="background: #3b82f6; color: white; padding: 2px 8px; border-radius: 12px; font-size: 11px; font-weight: bold;">OPEN</span> [**modernize-use-aggregate**](https://github.com/llvm/llvm-project/pull/182061) - Use aggregate initialization where possible
- <span style="background: #3b82f6; color: white; padding: 2px 8px; border-radius: 12px; font-size: 11px; font-weight: bold;">OPEN</span> [**modernize-use-algorithm**](https://github.com/llvm/llvm-project/pull/182065) - Replace raw loops with standard algorithms
- <span style="background: #3b82f6; color: white; padding: 2px 8px; border-radius: 12px; font-size: 11px; font-weight: bold;">OPEN</span> [**modernize-use-size-type**](https://github.com/llvm/llvm-project/pull/182023) - Use proper size types for container indices
- <span style="background: #3b82f6; color: white; padding: 2px 8px; border-radius: 12px; font-size: 11px; font-weight: bold;">OPEN</span> [**modernize-pointer-to-span**](https://github.com/llvm/llvm-project/pull/182085) - Convert pointer arithmetic to span operations
- <span style="background: #3b82f6; color: white; padding: 2px 8px; border-radius: 12px; font-size: 11px; font-weight: bold;">OPEN</span> [**modernize-use-return-value**](https://github.com/llvm/llvm-project/pull/182081) - Use `[[nodiscard]]` return values properly

**Readability checks:**
- <span style="background: #3b82f6; color: white; padding: 2px 8px; border-radius: 12px; font-size: 11px; font-weight: bold;">OPEN</span> [**readability-use-span-first-last**](https://github.com/llvm/llvm-project/pull/118074) - Use `span.first(n)` instead of `span.subspan(0, n)`
- <span style="background: #3b82f6; color: white; padding: 2px 8px; border-radius: 12px; font-size: 11px; font-weight: bold;">OPEN</span> [**readability-stringview-substr**](https://github.com/llvm/llvm-project/pull/120055) - Prefer `string_view` substr patterns
- <span style="background: #3b82f6; color: white; padding: 2px 8px; border-radius: 12px; font-size: 11px; font-weight: bold;">OPEN</span> [**readability-pointer-to-ref**](https://github.com/llvm/llvm-project/pull/182068) - Prefer references over pointers when appropriate

**Enhancements:**
- <span style="background: #3b82f6; color: white; padding: 2px 8px; border-radius: 12px; font-size: 11px; font-weight: bold;">OPEN</span> [**modernize-pass-by-value extension**](https://github.com/llvm/llvm-project/pull/182024) - Handle function body local copies
- <span style="background: #3b82f6; color: white; padding: 2px 8px; border-radius: 12px; font-size: 11px; font-weight: bold;">OPEN</span> [**modernize-make-shared options**](https://github.com/llvm/llvm-project/pull/117529) - Configurable smart pointer types

## The Chromium Connection

A code-search sample shows how often several of these patterns occur in Chromium:

| Pattern | Check | Instances |
|---------|-------|-----------|
| `.substr(0, n) ==` | `modernize-use-starts-ends-with` | ~730 |
| `.find(x) == 0` | `modernize-use-starts-ends-with` | ~1,100 |
| `.compare(0, n)` | `modernize-use-starts-ends-with` | ~50 |
| `.subspan(0, n)` | `readability-use-span-first-last` | ~10 |

These are candidate matches, not automatic proof that every occurrence should change. The check still needs to account for types, semantics, and cases where a fix would reduce clarity.

## Links

- <span style="background: #10b981; color: white; padding: 2px 8px; border-radius: 12px; font-size: 11px; font-weight: bold;">MERGED</span> [**Enhance modernize-use-starts-ends-with for substr patterns**](https://github.com/llvm/llvm-project/pull/116033)
- [LLVM pull requests by author](https://github.com/llvm/llvm-project/pulls?q=author%3Ahjanuschka)

---

The useful part of the scratchpad was preserving concrete review examples until the language and tooling could express them reliably.

Thanks to:
- **Peter Kasting** for the original ideas and introducing me to clang-tidy
- **Nicolas van Kempen** for patient review and guidance on my first PR  
- **Eugene Zelenko**, **HerrCai0907**, **5chmidti**, and **PiotrZSL** for thorough code reviews
