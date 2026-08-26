---
title: "An Abandoned HEv3 and HTTPS-RR Prototype"
category: "Chromium"
tech: "C++ / DNS / Networking"
---

**Status:** ❌ Rejected

*What the first RFC 9460 implementation attempted, why its scope grew, and why it was not accepted.*

```snippet
<div style="margin: 24px 0; padding: 16px 20px; background: rgba(177, 75, 75, 0.12); border: 1px solid #b14b4b; border-radius: 8px;">
  <strong style="color: #b14b4b;">Update: this effort was rejected.</strong>
  <p style="margin: 8px 0 0 0;">The networking team is taking a different direction with ongoing refactoring work, so these CLs will not land in their current form. The write-up stays up as a record of the investigation and the patches that came out of it.</p>
</div>
```

## Initial HTTPS-RR Change

[Issue 40257146](https://issues.chromium.org/issues/40257146) tracks gaps in Chromium's RFC 9460 support, including `AliasMode` and `ServiceMode` records with different target names.

The first CL implemented that behavior on Chromium's legacy resolver path. Its functional tests passed, but code review identified an architectural conflict with the Happy Eyeballs v3 (HEv3) network-stack work.

## The Block: "Wait for HEv3"

The Chromium networking team was in the middle of the **Happy Eyeballs v3 (HEv3)** refactor. The review recommendation was to wait and integrate with that architecture:

> "My preference would be 'Wait until HEv3 lands and then revisit with proper integration.' At this point I don't have concrete ideas about how we should implement aliases and different target names so I'm not sure we keep or abandon this CL. I think marking this as work in progress... is a reasonable action for now."

HEv3 allows connection attempts to race without waiting for every DNS result. A legacy-path implementation risked duplicating or constraining that work, so the CL was parked.

## HEv3 Became Uncertain

Later, the project reported that HEv3's completion date was uncertain:

> "The HEv3 development has been prolonged and it's difficult to predict when it will be completed. The team are moving towards not implementing HEv3 (that's unfortunate). We may consider supporting HTTPS RR aliases and different target names without HEv3, nothing has been decided yet."

That uncertainty prompted a broader prototype combining HEv3 plumbing with the missing HTTPS-RR behavior. Its scope included DNS result normalization, target-name follow-ups, connection-attempt representation, fallback behavior, metrics, and integration tests.

## Outcome

Two preparatory fixes landed, but the larger prototype stack was not accepted in its current form. Most entries below were experiments used to understand subsystem boundaries; many were abandoned without formal review.

```snippet
<details>
<summary style="cursor: pointer; color: var(--accent); font-weight: bold; margin-bottom: 10px;">Prototype CL inventory</summary>

<div>

**Landed / Merged:**
- <span style="background: #10b981; color: white; padding: 2px 8px; border-radius: 12px; font-size: 11px; font-weight: bold;">MERGED</span> [**Fix HEv3 intermediate update behavior**](https://crrev.com/c/7532178)
- <span style="background: #10b981; color: white; padding: 2px 8px; border-radius: 12px; font-size: 11px; font-weight: bold;">MERGED</span> [**Ignore H2 sessions for non-SSL in AttemptManager**](https://crrev.com/c/7535202)

**In Review (DNS & Normalization):**
- <span style="background: #3b82f6; color: white; padding: 2px 8px; border-radius: 12px; font-size: 11px; font-weight: bold;">IN REVIEW</span> [**DnsTaskResultsManager target-name behavior**](https://crrev.com/c/7532080)
- <span style="background: #3b82f6; color: white; padding: 2px 8px; border-radius: 12px; font-size: 11px; font-weight: bold;">IN REVIEW</span> [**Canonicalize domain-name matching**](https://crrev.com/c/7532105)
- <span style="background: #6b7280; color: white; padding: 2px 8px; border-radius: 12px; font-size: 11px; font-weight: bold;">ABANDONED</span> [**Apply HTTPS metadata via alias targets**](https://crrev.com/c/7534958)
- <span style="background: #3b82f6; color: white; padding: 2px 8px; border-radius: 12px; font-size: 11px; font-weight: bold;">IN REVIEW</span> [**Deduplicate endpoints in DnsTaskResultsManager**](https://crrev.com/c/7531547)
- <span style="background: #6b7280; color: white; padding: 2px 8px; border-radius: 12px; font-size: 11px; font-weight: bold;">ABANDONED</span> [**Allow multiple HTTPS completions**](https://crrev.com/c/7531548)
- <span style="background: #3b82f6; color: white; padding: 2px 8px; border-radius: 12px; font-size: 11px; font-weight: bold;">IN REVIEW</span> [**Avoid adding HTTPS query names to DNS aliases**](https://crrev.com/c/7532007)
- <span style="background: #6b7280; color: white; padding: 2px 8px; border-radius: 12px; font-size: 11px; font-weight: bold;">ABANDONED</span> [**Surface HTTPS alias records**](https://crrev.com/c/7531967)
- <span style="background: #3b82f6; color: white; padding: 2px 8px; border-radius: 12px; font-size: 11px; font-weight: bold;">IN REVIEW</span> [**Normalize DNS names for endpoint keying**](https://crrev.com/c/7545367)
- <span style="background: #3b82f6; color: white; padding: 2px 8px; border-radius: 12px; font-size: 11px; font-weight: bold;">IN REVIEW</span> [**Normalize HTTPS target names in extractor**](https://crrev.com/c/7543470)
- <span style="background: #6b7280; color: white; padding: 2px 8px; border-radius: 12px; font-size: 11px; font-weight: bold;">ABANDONED</span> [**Propagate stale DNS aliases**](https://crrev.com/c/7548052)
- <span style="background: #6b7280; color: white; padding: 2px 8px; border-radius: 12px; font-size: 11px; font-weight: bold;">ABANDONED</span> [**Normalize canonical name matching in HostCache**](https://crrev.com/c/7549124)
- <span style="background: #3b82f6; color: white; padding: 2px 8px; border-radius: 12px; font-size: 11px; font-weight: bold;">IN REVIEW</span> [**Log DNS aliases with endpoint updates**](https://crrev.com/c/7549523)
- <span style="background: #3b82f6; color: white; padding: 2px 8px; border-radius: 12px; font-size: 11px; font-weight: bold;">IN REVIEW</span> [**Normalize canonical names in HostCache entries**](https://crrev.com/c/7546723)
- <span style="background: #6b7280; color: white; padding: 2px 8px; border-radius: 12px; font-size: 11px; font-weight: bold;">ABANDONED</span> [**HostCache normalization coverage**](https://crrev.com/c/7548494)

**In Review (Followups & ServiceMode):**
- <span style="background: #3b82f6; color: white; padding: 2px 8px; border-radius: 12px; font-size: 11px; font-weight: bold;">IN REVIEW</span> [**Extend DnsTaskResultsManager tests**](https://crrev.com/c/7550310)
- <span style="background: #6b7280; color: white; padding: 2px 8px; border-radius: 12px; font-size: 11px; font-weight: bold;">ABANDONED</span> [**Prototype AliasMode followup resolution**](https://crrev.com/c/7548608)
- <span style="background: #6b7280; color: white; padding: 2px 8px; border-radius: 12px; font-size: 11px; font-weight: bold;">ABANDONED</span> [**Add bounded recursion + cycle detection**](https://crrev.com/c/7548495)
- <span style="background: #3b82f6; color: white; padding: 2px 8px; border-radius: 12px; font-size: 11px; font-weight: bold;">IN REVIEW</span> [**Extend DnsTaskResultsManager to accept followups**](https://crrev.com/c/7543652)
- <span style="background: #6b7280; color: white; padding: 2px 8px; border-radius: 12px; font-size: 11px; font-weight: bold;">ABANDONED</span> [**Add ServiceMode TargetName followup query handling**](https://crrev.com/c/7550314)
- <span style="background: #3b82f6; color: white; padding: 2px 8px; border-radius: 12px; font-size: 11px; font-weight: bold;">IN REVIEW</span> [**Extend tests for ServiceMode multi-target followups**](https://crrev.com/c/7550430)
- <span style="background: #3b82f6; color: white; padding: 2px 8px; border-radius: 12px; font-size: 11px; font-weight: bold;">IN REVIEW</span> [**Validate IsMetadataReady semantics**](https://crrev.com/c/7543703)
- <span style="background: #3b82f6; color: white; padding: 2px 8px; border-radius: 12px; font-size: 11px; font-weight: bold;">IN REVIEW</span> [**Plumb target name through connection layer**](https://crrev.com/c/7550411)
- <span style="background: #6b7280; color: white; padding: 2px 8px; border-radius: 12px; font-size: 11px; font-weight: bold;">ABANDONED</span> [**Add connection-layer tests for multi-target ServiceMode**](https://crrev.com/c/7545973)
- <span style="background: #6b7280; color: white; padding: 2px 8px; border-radius: 12px; font-size: 11px; font-weight: bold;">ABANDONED</span> [**NetLog or UMA for followup query timing**](https://crrev.com/c/7550437)
- <span style="background: #3b82f6; color: white; padding: 2px 8px; border-radius: 12px; font-size: 11px; font-weight: bold;">IN REVIEW</span> [**ServiceMode multi-target test coverage**](https://crrev.com/c/7545968)

**In Review (Connection Layer & Plumbing):**
- <span style="background: #3b82f6; color: white; padding: 2px 8px; border-radius: 12px; font-size: 11px; font-weight: bold;">IN REVIEW</span> [**Add ServiceEndpointConnectionAttempt representation**](https://crrev.com/c/7543527)
- <span style="background: #3b82f6; color: white; padding: 2px 8px; border-radius: 12px; font-size: 11px; font-weight: bold;">IN REVIEW</span> [**Plumb ServiceEndpointConnectionAttempt through connect jobs**](https://crrev.com/c/7551690)
- <span style="background: #3b82f6; color: white; padding: 2px 8px; border-radius: 12px; font-size: 11px; font-weight: bold;">IN REVIEW</span> [**Add TCPServiceEndpointConnectJob and wire SSLConnectJob**](https://crrev.com/c/7551870)
- <span style="background: #3b82f6; color: white; padding: 2px 8px; border-radius: 12px; font-size: 11px; font-weight: bold;">IN REVIEW</span> [**Update QuicSessionPool::Job for pre-resolved endpoints**](https://crrev.com/c/7551990)
- <span style="background: #3b82f6; color: white; padding: 2px 8px; border-radius: 12px; font-size: 11px; font-weight: bold;">IN REVIEW</span> [**Add preconnect support in HttpStreamPool**](https://crrev.com/c/7552050)
- <span style="background: #3b82f6; color: white; padding: 2px 8px; border-radius: 12px; font-size: 11px; font-weight: bold;">IN REVIEW</span> [**Add HEv3 ECH fallback handling**](https://crrev.com/c/7552250)
- <span style="background: #3b82f6; color: white; padding: 2px 8px; border-radius: 12px; font-size: 11px; font-weight: bold;">IN REVIEW</span> [**Add idle socket lookup or bypass mode**](https://crrev.com/c/7552390)
- <span style="background: #3b82f6; color: white; padding: 2px 8px; border-radius: 12px; font-size: 11px; font-weight: bold;">IN REVIEW</span> [**Move proxy resolution to HttpStreamFactory**](https://crrev.com/c/7552510)
- <span style="background: #6b7280; color: white; padding: 2px 8px; border-radius: 12px; font-size: 11px; font-weight: bold;">ABANDONED</span> [**Cancel in-flight QUIC attempts on session activation**](https://crrev.com/c/7552512)
- <span style="background: #6b7280; color: white; padding: 2px 8px; border-radius: 12px; font-size: 11px; font-weight: bold;">ABANDONED</span> [**Align HEv3 TCP/TLS timeout error codes**](https://crrev.com/c/7552570)
- <span style="background: #3b82f6; color: white; padding: 2px 8px; border-radius: 12px; font-size: 11px; font-weight: bold;">IN REVIEW</span> [**Add UMA for HEv3 TCP-based and QUIC attempt outcomes**](https://crrev.com/c/7552650)
- <span style="background: #3b82f6; color: white; padding: 2px 8px; border-radius: 12px; font-size: 11px; font-weight: bold;">IN REVIEW</span> [**Add HEv3 dual-stack TLS fallback test**](https://crrev.com/c/7552670)
- <span style="background: #3b82f6; color: white; padding: 2px 8px; border-radius: 12px; font-size: 11px; font-weight: bold;">IN REVIEW</span> [**Add HEv3 incremental DNS endpoint update test**](https://crrev.com/c/7552730)
- <span style="background: #3b82f6; color: white; padding: 2px 8px; border-radius: 12px; font-size: 11px; font-weight: bold;">IN REVIEW</span> [**Add HEv3 DNS error fallback and multi-endpoint tests**](https://crrev.com/c/7552870)
- <span style="background: #6b7280; color: white; padding: 2px 8px; border-radius: 12px; font-size: 11px; font-weight: bold;">ABANDONED</span> [**Add NetLog event for HEv3 SPDY throttle delay**](https://crrev.com/c/7552950)
- <span style="background: #3b82f6; color: white; padding: 2px 8px; border-radius: 12px; font-size: 11px; font-weight: bold;">IN REVIEW</span> [**Record QUIC failure in connection_attempts_**](https://crrev.com/c/7552392)
- <span style="background: #3b82f6; color: white; padding: 2px 8px; border-radius: 12px; font-size: 11px; font-weight: bold;">IN REVIEW</span> [**Convert CHECK to DCHECK in MaybeAttemptTcpBased**](https://crrev.com/c/7552931)
- <span style="background: #6b7280; color: white; padding: 2px 8px; border-radius: 12px; font-size: 11px; font-weight: bold;">ABANDONED</span> [**Test preconnect with HTTPS RR metadata endpoints**](https://crrev.com/c/7552951)
- <span style="background: #3b82f6; color: white; padding: 2px 8px; border-radius: 12px; font-size: 11px; font-weight: bold;">IN REVIEW</span> [**Test cancellation mid-followup**](https://crrev.com/c/7552051)
- <span style="background: #3b82f6; color: white; padding: 2px 8px; border-radius: 12px; font-size: 11px; font-weight: bold;">IN REVIEW</span> [**Integration cleanup**](https://crrev.com/c/7545376)

**In Review (HTTPS-RR Core - The Key Gate!):**
- <span style="background: #ef4444; color: white; padding: 2px 8px; border-radius: 12px; font-size: 11px; font-weight: bold;">KEY CL</span> [**Remove TargetName filter in DnsResponseResultExtractor**](https://crrev.com/c/7552252)
- <span style="background: #3b82f6; color: white; padding: 2px 8px; border-radius: 12px; font-size: 11px; font-weight: bold;">IN REVIEW</span> [**End-to-end HTTPS RR different TargetName followup test**](https://crrev.com/c/7552773)
- <span style="background: #6b7280; color: white; padding: 2px 8px; border-radius: 12px; font-size: 11px; font-weight: bold;">ABANDONED</span> [**Followup recursion limit + cycle detection test**](https://crrev.com/c/7552933)

**In Review (Metrics & Flag Flip):**
- <span style="background: #3b82f6; color: white; padding: 2px 8px; border-radius: 12px; font-size: 11px; font-weight: bold;">IN REVIEW</span> [**UMA for HEv3 vs legacy path selection**](https://crrev.com/c/7551954)
- <span style="background: #3b82f6; color: white; padding: 2px 8px; border-radius: 12px; font-size: 11px; font-weight: bold;">IN REVIEW</span> [**UMA for DNS resolution time in HttpStreamPool**](https://crrev.com/c/7552052)
- <span style="background: #3b82f6; color: white; padding: 2px 8px; border-radius: 12px; font-size: 11px; font-weight: bold;">IN REVIEW</span> [**UMA for intermediate vs final endpoint usage**](https://crrev.com/c/7551955)
- <span style="background: #f59e0b; color: white; padding: 2px 8px; border-radius: 12px; font-size: 11px; font-weight: bold;">FLAG FLIP</span> [**Enable kHappyEyeballsV3 by default**](https://crrev.com/c/7552932)

</div>
</details>
```

The prototype showed that combining resolver changes, connection-layer refactoring, and RFC 9460 behavior in one stack was too broad for useful review. The later [HTTPS-RR take-two](/chromium-https-rr-take-two.html) keeps the work inside the resolver path and separates it into smaller changes.

## What This Attempt Established

Even though the stack was rejected, it identified the relevant ownership boundaries: `DnsResponseResultExtractor`, `HostResolverDnsTask`, `DnsTaskResultsManager`, and the connection-attempt layer. It also made clear that RFC 9460 behavior should be reviewed separately from unrelated HEv3 architecture changes.
