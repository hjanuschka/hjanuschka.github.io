---
title: "Deleting base::TimeTicks::UnixEpoch Across Chromium"
category: "Chromium"
tech: "C++ / Refactoring"
---

*Removing an API is easy. Proving nobody needs it, migrating every owner, and preventing it from coming back is the real work.*

**Status:** 🎉 Landed

## Two Kinds of Time

Chromium has two clocks for two different jobs:

- `base::Time` is wall-clock time. It can be represented as a calendar date and related to the Unix epoch.
- `base::TimeTicks` is monotonic time. It is for durations and ordering events, and its zero point is deliberately arbitrary.

`base::TimeTicks::UnixEpoch()` blurred that boundary. It made a monotonic clock look as if it had a meaningful calendar epoch. To keep the result consistent across child processes, Chromium also passed a `time-ticks-at-unix-epoch` value at process startup and installed it through `SetSharedUnixEpoch()`.

That was a lot of machinery to preserve a conversion callers generally should not perform. If code needs wall-clock time, it should use `base::Time`.

## Why Not Delete It in One CL?

The API had users in networking, Chrome OS, session restore, page-load metrics, DevTools protocol handlers, Cronet, performance manager, Ozone input code, chromedriver, cast statistics, tests, and more. Those directories have different owners and different assumptions.

One large replacement would be difficult to review and risky to revert. The safer shape was deliberately boring:

1. Add a PRESUBMIT rule banning new calls while existing ones are being removed.
2. Move each directory to `base::Time` in a small owner-scoped CL.
3. Delete the cross-process epoch switch and initialization plumbing.
4. Delete the API itself.

The PRESUBMIT step happened early, not at the end. Otherwise the migration target moves while you are chasing it.

## Removing the Plumbing

Once the last real users were gone, the architecture became simpler. Chromium no longer needed to launch child processes with a special time-ticks epoch or initialize a shared value before clients could use the API.

- <span style="background: #10b981; color: white; padding: 2px 8px; border-radius: 12px; font-size: 11px; font-weight: bold;">MERGED</span> [**Remove the cross-process TimeTicks unix epoch plumbing**](https://chromium-review.googlesource.com/c/chromium/src/+/7936848)

That CL removed the command-line switch and the `SetSharedUnixEpoch()` wiring. With that gone, `TimeTicks::UnixEpoch()` no longer had a cross-process definition to preserve.

## Closing the Door

The final pair made the migration permanent:

- <span style="background: #10b981; color: white; padding: 2px 8px; border-radius: 12px; font-size: 11px; font-weight: bold;">MERGED</span> [**Ban new TimeTicks::UnixEpoch usages via PRESUBMIT**](https://chromium-review.googlesource.com/c/chromium/src/+/7927974)
- <span style="background: #10b981; color: white; padding: 2px 8px; border-radius: 12px; font-size: 11px; font-weight: bold;">MERGED</span> [**Remove base::TimeTicks::UnixEpoch**](https://chromium-review.googlesource.com/c/chromium/src/+/7928095)

The deletion CL is tiny because all the difficult decisions happened before it. That is a good sign: the final removal should be mechanical.

## The Pattern

This is the reusable part of the story. For a codebase-wide API removal:

- state what the replacement means, not just what it is called;
- stop new callers before migrating old ones;
- split migrations along ownership boundaries;
- remove supporting infrastructure only after callers are gone;
- land the final deletion when it is uneventful.

The goal is not a dramatic cleanup CL. The goal is for the deletion to be the least interesting patch in the series.

## Links

- [Cross-process plumbing removal](https://chromium-review.googlesource.com/c/chromium/src/+/7936848)
- [PRESUBMIT ban](https://chromium-review.googlesource.com/c/chromium/src/+/7927974)
- [Final API removal](https://chromium-review.googlesource.com/c/chromium/src/+/7928095)
