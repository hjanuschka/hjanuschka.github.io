---
title: "Another Try at Finally Bringing HTTPS-RR to Chrome"
category: "Chromium"
tech: "C++ / DNS / Networking"
---

*The first attempt failed in fairly legendary fashion. The ground has shifted since - so here is take two.*

**Status:** 🚧 In Review

## Recap: The First Attempt

A while back I wrote about [reviving HEv3 and HTTPS-RR in Chromium](/reviving-hev3-https-rr.html). The short version: I wanted to complete Chromium's RFC 9460 support (AliasMode, ServiceMode target names, and friends), built it on the legacy resolver path, and the review flagged it as conflicting with the in-flight Happy Eyeballs v3 network-stack refactor. The change was parked, HEv3 dragged on, and the effort was ultimately rejected. Legendary fashion, as I put it in the issue.

The gap it was trying to close never went away. [Issue 40257146](https://issues.chromium.org/issues/40257146) - "Fully implement HTTPS-RR" - is still open, and Chromium's incomplete RFC 9460 implementation causes real interoperability problems: the same HTTPS record deployment works in other browsers but not in Chromium, so operators have to keep legacy A/AAAA paths alive specifically for Chrome (see the interop evidence in [issue 388545139](https://issues.chromium.org/issues/388545139)).

## What Changed

The thing that blocked the first attempt is also what unblocks this one: the new cache resolver landed, and the HEv3 plumbing the previous review wanted me to wait for now exists. That means the implementation no longer has to fight the architecture - it can stay inside the existing resolver path instead of bolting onto the legacy one.

So I restarted, from a different angle. Instead of one large change, this version is split into **five small, ordered CLs** that each do one thing and build on the previous. Compared to the last approach it is much smaller, and it stays within the paths the networking team already maintains.

## What This Completes

RFC 9460 has several pieces Chromium did not fully implement. The stack closes them:

- **ServiceMode address hints** - use `ipv4hint` / `ipv6hint` from the record.
- **AliasMode** - resolve alias records (and alias chains), solving the CNAME-at-apex problem.
- **Non-matching target names** - follow `TargetName` in ServiceMode, for multi-CDN setups.
- **Follow-up queries** - issue A/AAAA follow-ups for target names, including when the origin name has no usable address of its own.
- **Alternate ports** - honor `port=` from the record.

## The Change Stack

Five CLs, in order:

- <span style="background: #3b82f6; color: white; padding: 2px 8px; border-radius: 12px; font-size: 11px; font-weight: bold;">IN REVIEW</span> [**[HTTPS-RR 1/5] Extract HTTPS-RR ServiceMode address hints**](https://chromium-review.googlesource.com/c/chromium/src/+/7984025)
- <span style="background: #3b82f6; color: white; padding: 2px 8px; border-radius: 12px; font-size: 11px; font-weight: bold;">IN REVIEW</span> [**[HTTPS-RR 2/5] Extract HTTPS-RR AliasMode records as alias results**](https://chromium-review.googlesource.com/c/chromium/src/+/7984026)
- <span style="background: #3b82f6; color: white; padding: 2px 8px; border-radius: 12px; font-size: 11px; font-weight: bold;">IN REVIEW</span> [**[HTTPS-RR 3/5] Use HTTPS-RR records with non-matching target names**](https://chromium-review.googlesource.com/c/chromium/src/+/7984027)
- <span style="background: #3b82f6; color: white; padding: 2px 8px; border-radius: 12px; font-size: 11px; font-weight: bold;">IN REVIEW</span> [**[HTTPS-RR 4/5] Issue HTTPS-RR followup queries for target names**](https://chromium-review.googlesource.com/c/chromium/src/+/7984028)
- <span style="background: #3b82f6; color: white; padding: 2px 8px; border-radius: 12px; font-size: 11px; font-weight: bold;">IN REVIEW</span> [**[HTTPS-RR 5/5] Honor alternate ports from HTTPS resource records**](https://chromium-review.googlesource.com/c/chromium/src/+/8259314)

## Proving It End to End

Claiming "HTTPS-RR works" is easy; showing it is the point. I set up a live domain (`h3q.top`) with real HTTPS records and **intentionally unusable origin addresses**, so a successful request *has* to have gone through the HTTPS-RR path rather than a normal A/AAAA lookup.

Everything - the DNS setup, the nginx/QUIC config, the live browser checks, and a prebuilt amd64 Debian package - lives on the [project page](https://static.januschka.com/i-40257146/). The coverage matrix walks through the cases that matter:

| Scenario | What it proves |
|---|---|
| Direct baseline | ServiceMode hints on the queried name |
| Hint-only target | `ipv4hint` / `ipv6hint` used when the origin has no usable address |
| IPv6-only hint | resolution from an `ipv6hint` alone |
| No-address origin | HTTPS-RR path when the origin name has no A/AAAA at all |
| ServiceMode + alternate port | `port=` is honored |
| Two-link alias chain | AliasMode chain resolution |

## Why This One Might Move

A few reasons for cautious optimism:

- The architectural blocker from last time (waiting on HEv3 / the new resolver) is gone.
- The change is small and ordered, not one monolith, so it is reviewable in pieces.
- It stays within the existing resolver path instead of the legacy one.
- There is concrete interoperability evidence that this matters, not just a spec-completeness argument.

To set expectations: I am an external contributor, not a Googler. This is still a sizeable change and there will likely be bumps, and it needs the networking team's architectural review to go anywhere. But compared to the last attempt, this one is in much better shape - and the thing that stopped it before has finally landed.

## Links

- [Issue 40257146 - Fully implement HTTPS-RR](https://issues.chromium.org/issues/40257146)
- [First attempt (rejected): Reviving HEv3 & HTTPS-RR](/reviving-hev3-https-rr.html)
- [Project page: stack, DNS setup, live tests, prebuilt .deb](https://static.januschka.com/i-40257146/)
- [Issue 388545139 - real-world interop evidence](https://issues.chromium.org/issues/388545139)
- [RFC 9460 - SVCB and HTTPS resource records](https://www.rfc-editor.org/rfc/rfc9460.html)
