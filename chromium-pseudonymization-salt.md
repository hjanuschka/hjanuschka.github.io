---
title: "Fixing a 3.5-Year-Old Race Condition: Pseudonymization Salt via Shared Memory"
category: "Chromium"
tech: "C++ / IPC"
---

*When the bug report is older than some interns - a deep dive into cross-process initialization*

**Status:** In Review | **CL:** [7486913](https://crrev.com/c/7486913) | **Bug:** [40850085](https://issues.chromium.org/issues/40850085)

---

## The Bug That Wouldn't Die

In June 2022, crash reports started appearing with a familiar pattern:

```
[Assert] content::GetPseudonymizationSalt
```

The crash was simple to understand but deceptively hard to fix: child processes were trying to use a pseudonymization salt before it had been initialized. The salt is used by Chrome's tracing system to anonymize sensitive data like extension IDs before logging.

The bug sat open for **3.5 years**. Multiple Googlers looked at it. Solutions were proposed. CLs were attempted. But the fundamental problem remained unsolved - until now.

## Understanding the Race

Chrome's multi-process architecture means the browser process spawns child processes (renderers, GPU process, utilities) that need certain data to function. The pseudonymization salt was being sent via IPC:

```cpp
// In RenderProcessHostImpl::OnChannelConnected
child_process_->SetPseudonymizationSalt(GetPseudonymizationSalt());
```

The problem? This IPC races with other messages. The `extensions::mojom::Renderer` interface and `content::mojom::ChildProcess` interface use **different Mojo pipes**. There's no ordering guarantee between them.

So when an extension activates and tries to write a trace event (which needs to pseudonymize the extension ID), the salt might not have arrived yet. Boom - DCHECK failure, crash in debug builds.

## The Long History

Reading through [bug 40850085](https://issues.chromium.org/issues/40850085) is like an archaeology dig through Chromium's architecture:

**June 2022** - Bug reported. Initial analysis identifies the IPC race.

**July 2022** - Discussion about solutions:
- Command line switch? Rejected - salt would appear in crash reports, defeating the purpose
- Make ChildProcess channel-associated? Can't - it's the initial pipe
- Sync IPC from child? Too slow

**August 2022** - The right approach is suggested: **shared memory region** passed at process launch.

**January 2023** - A partial fix lands moving salt generation to browser-only, but the race still exists.

**January 2026** - Bug reopened, pointing out the root cause was never addressed.

## The Solution: Shared Memory

The fix implements what rockot@ suggested 3.5 years ago. Instead of sending the salt via IPC after the process starts, we:

1. **Create a read-only shared memory region** containing the salt in the browser process
2. **Pass the region handle** when launching the child process (platform-specific)
3. **Read the salt immediately** during child process initialization, before any IPCs

```cpp
// Browser side: create and pass shared memory
base::ReadOnlySharedMemoryRegion region = 
    GetPseudonymizationSaltSharedMemoryRegion();
// ... pass region.GetPlatformHandle() to child

// Child side: map and read early in startup
void InitializePseudonymizationSaltFromSharedMemory(
    base::ReadOnlySharedMemoryRegion region) {
  auto mapping = region.Map();
  CHECK(mapping.IsValid());
  uint32_t salt = *static_cast<const uint32_t*>(mapping.memory());
  SetPseudonymizationSalt(salt);
}
```

The key insight: shared memory is available **immediately** when the process starts, before any message loops or IPC handlers run.

## Platform Complexity

Passing handles to child processes is platform-specific:

- **Windows/Linux**: Handle inheritance via command line descriptor
- **macOS**: Mach port rendezvous system (had to bump `kMaxPortCount` from 6 to 7!)

Each platform has different mechanisms for handle passing, and getting this right required touching:
- `content/browser/child_process_launcher_helper.cc`
- `base/apple/mach_port_rendezvous.h`
- Platform-specific launch code

## Testing

Added a browser test that verifies the salt is consistent between browser and child processes:

```cpp
// content/browser/renderer_host/render_process_host_browsertest.cc
IN_PROC_BROWSER_TEST_F(RenderProcessHostTest,
                       PseudonymizationSaltSharedMemoryConsistency) {
  // Verify salt matches between browser and renderer
  uint32_t browser_salt = GetPseudonymizationSalt();
  uint32_t renderer_salt = GetSaltFromRenderer();
  EXPECT_EQ(browser_salt, renderer_salt);
}
```

This ensures the fix works end-to-end, not just that the code compiles.

## Why This Matters

The salt adds randomness to trace hashing - without it, extension IDs in traces could be deanonymized by comparing hashes. In debug builds, the missing salt causes a DCHECK crash. In release builds, it silently uses salt=0, weakening privacy protection.

## Links

- <span style="background: #3b82f6; color: white; padding: 2px 8px; border-radius: 12px; font-size: 11px; font-weight: bold;">IN REVIEW</span> [**CL 7486913: Pass pseudonymization salt via shared memory**](https://crrev.com/c/7486913)
- [Bug 40850085: Chrome Crash - GetPseudonymizationSalt](https://issues.chromium.org/issues/40850085)
- [Original salt introduction CL](https://crrev.com/c/3057922)
- [2023 partial fix by wfh@](https://crrev.com/c/4143865)

---

*Sometimes the best contribution is finishing what others started. The solution was known in 2022 - it just needed someone to implement it.*

Thanks to:
- **Will Harris** for extensive review feedback on determinism and error handling
- **Rakina Zata Amni** for content/ ownership review
- **Mark Mentovai** for base/Apple platform review
