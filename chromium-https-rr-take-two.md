---
title: "Another Try at Finally Bringing HTTPS-RR to Chrome"
category: "Chromium"
tech: "C++ / DNS / Networking"
---

*The first attempt failed in fairly legendary fashion. The ground has shifted since - so here is take two.*

**Status:** 🚧 In Review

## Recap: The First Attempt

A while back I wrote about [reviving HEv3 and HTTPS-RR in Chromium](/reviving-hev3-https-rr.html). The short version: I wanted to complete Chromium's RFC 9460 support - AliasMode, ServiceMode target names, address hints - built it on the legacy resolver path, and the review flagged it as conflicting with the in-flight Happy Eyeballs v3 network-stack refactor. The change was parked, HEv3 dragged on, and the effort was ultimately rejected.

It grew into a 63-change plan that tried to revive HEv3, add new connection-attempt abstractions, and implement HTTPS-RR all at the same time. The architecture kept moving underneath it, most of that stack never reached reviewable scope, and many prototype changes were abandoned. Legendary fashion, as I described it in the issue.

The gap it was trying to close never went away. [Issue 40257146](https://issues.chromium.org/issues/40257146) - "Fully implement HTTPS-RR" - is still open, and Chromium's incomplete RFC 9460 implementation causes real interoperability problems: the same HTTPS record deployment works in other browsers but not in Chromium, so operators have to keep legacy A/AAAA paths alive specifically for Chrome (see the interop evidence in [issue 388545139](https://issues.chromium.org/issues/388545139)).

## What Changed

The thing that blocked the first attempt is also what unblocks this one: the new cache resolver landed, and the HEv3 plumbing the previous review wanted me to wait for now exists. This attempt starts *after* that plumbing is in place, and stays entirely in the resolver path that owns DNS transactions:

- extraction in `DnsResponseResultExtractor`
- bounded follow-ups in `HostResolverDnsTask`
- endpoint assembly in `DnsTaskResultsManager`

It does not invent a second query path and it does not restructure the connection layer. The result is **five small, ordered CLs** with one responsibility each - far easier to review independently, and far easier to drop or revise when feedback changes the design.

## What This Completes

The original implementation handled a narrow ServiceMode shape. The stack keeps HTTPS-RR metadata associated with its target, resolves target addresses, follows AliasMode links, accepts usable hints even when the origin has no address of its own, and carries an allowed alternate port into the connection endpoint. Concretely, from RFC 9460:

- **ServiceMode address hints** - use `ipv4hint` / `ipv6hint` from the record.
- **AliasMode** - turn priority-zero records into resolver aliases, and follow alias chains (solving the CNAME-at-apex problem).
- **Non-matching target names** - keep metadata and hints when the `TargetName` differs from the query name, for multi-CDN setups.
- **Follow-up queries** - schedule bounded A/AAAA/HTTPS follow-ups for target names, including when the origin name has no usable address.
- **Alternate ports** - carry a scheme-allowed `port=` through to the connection attempt.

## The Change Stack

Five CLs, in intended landing order - each has one concern and depends on the one above it:

- <span style="background: #3b82f6; color: white; padding: 2px 8px; border-radius: 12px; font-size: 11px; font-weight: bold;">IN REVIEW</span> [**[HTTPS-RR 1/5] Extract HTTPS-RR ServiceMode address hints**](https://chromium-review.googlesource.com/c/chromium/src/+/7984025) - extracts `ipv4hint` and `ipv6hint` under the HTTPS-RR feature.
- <span style="background: #3b82f6; color: white; padding: 2px 8px; border-radius: 12px; font-size: 11px; font-weight: bold;">IN REVIEW</span> [**[HTTPS-RR 2/5] Extract HTTPS-RR AliasMode records as alias results**](https://chromium-review.googlesource.com/c/chromium/src/+/7984026) - turns priority-zero HTTPS records into resolver aliases.
- <span style="background: #3b82f6; color: white; padding: 2px 8px; border-radius: 12px; font-size: 11px; font-weight: bold;">IN REVIEW</span> [**[HTTPS-RR 3/5] Use HTTPS-RR records with non-matching target names**](https://chromium-review.googlesource.com/c/chromium/src/+/7984027) - keeps metadata and hints for ServiceMode `TargetName`s.
- <span style="background: #3b82f6; color: white; padding: 2px 8px; border-radius: 12px; font-size: 11px; font-weight: bold;">IN REVIEW</span> [**[HTTPS-RR 4/5] Issue HTTPS-RR followup queries for target names**](https://chromium-review.googlesource.com/c/chromium/src/+/7984028) - schedules bounded target queries and preserves the final service endpoints.
- <span style="background: #3b82f6; color: white; padding: 2px 8px; border-radius: 12px; font-size: 11px; font-weight: bold;">IN REVIEW</span> [**[HTTPS-RR 5/5] Honor alternate ports from HTTPS resource records**](https://chromium-review.googlesource.com/c/chromium/src/+/8259314) - carries a scheme-allowed HTTPS-RR port through metadata to connection attempts.

## Proving It End to End

Claiming "HTTPS-RR works" is easy; showing it is the point. The [project sampler](https://static.januschka.com/i-40257146/) runs real cross-origin requests through public DNS against a live host, `bartlby.org`, served by Caddy at `159.195.20.167`.

The trick is that most test names have **intentionally unusable or absent origin addresses** - the `192.0.2.0/24` (TEST-NET) block, or no A/AAAA at all - so a request can only succeed if the browser discovered a usable endpoint through HTTPS-RR processing. The direct case is a control. For example, the ServiceMode name resolves like this:

```text
httpsrr-service-origin.bartlby.org   A = 192.0.2.1        (intentionally unusable)
  -> HTTPS RR  priority 1  target = httpsrr-service-target.bartlby.org  port = 8443
  -> connection endpoint  159.195.20.167:8443   (SNI and origin stay the URL host)
```

The coverage matrix walks the cases:

| Case | Origin address | HTTPS-RR behavior | Expected endpoint |
|---|---|---|---|
| Direct | `159.195.20.167` | control, no RR dependency | `159.195.20.167:443` |
| ServiceMode | `192.0.2.1` | `TargetName` A/AAAA + `port=8443` | `159.195.20.167:8443` |
| Hint-only | `192.0.2.1` | target A/AAAA NODATA; use `ipv4hint` | `159.195.20.167:443` |
| No-address origin | none | owner HTTPS RR supplies its only endpoint via `ipv4hint` | `159.195.20.167:443` |
| IPv6-only hint | none | owner HTTPS RR supplies its only endpoint via `ipv6hint` | `[2a0a:4cc0:c1:3cb4:e822:68ff:fef3:fed5]:443` |
| AliasMode | `192.0.2.1` | priority-0 target A/AAAA/HTTPS | `159.195.20.167:443` |
| Alias chain | `192.0.2.1` | two links, six bounded follow-ups | `159.195.20.167:443` |

The sampler also carries the full lab setup - `server.py`, `Caddyfile`, the `bartlby.org` zone file, the browser-test and net-log validators - plus a prebuilt release, non-component Debian package (`chromium-https-rr_153.0.7994.0_amd64.deb`) so the whole thing is reproducible.

To validate locally, run a fresh profile with the supplemental-query timeout disabled, so the browser waits for the RFC 9460 result instead of falling back to A/AAAA:

```bash
out/Default/chrome \
  --user-data-dir=/tmp/chrome-httpsrr \
  --no-first-run \
  --enable-features=AsyncDns,UseDnsHttpsSvcb:UseDnsHttpsSvcbInsecureExtraTimeMax/0/UseDnsHttpsSvcbInsecureExtraTimePercent/0/UseDnsHttpsSvcbInsecureExtraTimeMin/0/UseDnsHttpsSvcbSecureExtraTimeMax/0/UseDnsHttpsSvcbSecureExtraTimePercent/0/UseDnsHttpsSvcbSecureExtraTimeMin/0,UseDnsHttpsSvcbHttpsRr,HappyEyeballsV3 \
  https://static.januschka.com/i-40257146/
```

## Why This One Might Move

A few reasons for cautious optimism:

- The architectural blocker from last time (waiting on HEv3 / the new resolver) is gone.
- The change is small and ordered, not a 63-CL monolith, so it is reviewable in pieces.
- It stays within the existing resolver path (`DnsResponseResultExtractor`, `HostResolverDnsTask`, `DnsTaskResultsManager`) instead of building a parallel one.
- There is concrete interoperability evidence that this matters, not just a spec-completeness argument.

To set expectations: I am an external contributor, not a Googler. This is still a sizeable change and it needs the networking team's architectural review to go anywhere. But compared to the last attempt, this one is in much better shape - and the thing that stopped it before has finally landed.

## Links

- [Issue 40257146 - Fully implement HTTPS-RR](https://issues.chromium.org/issues/40257146)
- [First attempt (rejected): Reviving HEv3 & HTTPS-RR](/reviving-hev3-https-rr.html)
- [Project sampler: stack, DNS zone, live tests, prebuilt .deb](https://static.januschka.com/i-40257146/)
- [Issue 388545139 - real-world interop evidence](https://issues.chromium.org/issues/388545139)
- [RFC 9460 - SVCB and HTTPS resource records](https://www.rfc-editor.org/rfc/rfc9460.html)
