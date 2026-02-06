---
title: "Reviving HEv3 & HTTPS-RR in Chromium"
category: "Chromium"
tech: "C++ / DNS / Networking"
---

*Taking matters into my own hands to pursue RFC 9460 support in Chrome.*

## The Beginning: HTTPS Resource Records

It all started with a simple goal: I wanted to implement full support for **HTTPS Resource Records** (HTTPS-RR) in Chromium, specifically RFC 9460. This includes proper handling of `AliasMode` and `ServiceMode` with different target names—features crucial for the modern web's evolution towards more flexible and secure service discovery.

I picked up [Issue 40257146](https://issues.chromium.org/issues/40257146) and went to work. I put together a CL that successfully implemented the logic. It worked! I was ready to land it.

## The Block: "Wait for HEv3"

But then, the code review feedback came in. It wasn't about the correctness of my specific logic, but about the *architecture*. The Chromium team was in the middle of a major network stack refactor known as **Happy Eyeballs v3 (HEv3)**.

My approach was flagged as conflicting with this new direction:

> "My preference would be 'Wait until HEv3 lands and then revisit with proper integration.' At this point I don't have concrete ideas about how we should implement aliases and different target names so I'm not sure we keep or abandon this CL. I think marking this as work in progress... is a reasonable action for now."

It made sense. HEv3 is designed to allow connection attempts to race without waiting for all DNS results—a huge performance win. My implementation, based on the legacy path, might have blocked this optimization. So, I parked the CL and waited.

## The Twist: "We might not do HEv3"

Time passed. HEv3 development dragged on. Then came the update that flipped everything:

> "The HEv3 development has been prolonged and it's difficult to predict when it will be completed. The team are moving towards not implementing HEv3 (that's unfortunate). We may consider supporting HTTPS RR aliases and different target names without HEv3, nothing has been decided yet."

So, the shiny new architecture I was waiting for—the one that blocked my feature—was potentially being abandoned? And we might go back to a non-HEv3 implementation anyway?

## The Revival

That was my "WTF" moment. Instead of waiting for a compromise or abandoning the architectural improvements of HEv3, I decided to **revive the effort myself**. If HEv3 was stalled, I would help unblock it to get my HTTPS-RR features landed *properly*.

I dove deep into the HEv3 design docs and the codebase. I mapped out a detailed plan and started working through a 70+ step checklist to:
1.  Become a regular contributor to the HEv3 codepath (`net/dns`, `net/http`).
2.  Implement HTTPS-RR follow-ups (AliasMode/ServiceMode) *within* the HEv3 model.
3.  Ensure no performance regressions (the whole point of HEv3!).
4.  Ship it.

## Current Status

I've already landed several preparatory CLs and have a stack of 63 changes in flight to completely overhaul the HEv3 codepath for HTTPS-RR support. **The core functionality is now working end-to-end!**

```snippet
<details>
<summary style="cursor: pointer; color: var(--accent); font-weight: bold; margin-bottom: 10px;">View all 63 CLs (Progress: 2 Merged, 61 In Review) →</summary>

<div>

**Landed / Merged:**
- <span style="background: #10b981; color: white; padding: 2px 8px; border-radius: 12px; font-size: 11px; font-weight: bold;">MERGED</span> [**Fix HEv3 intermediate update behavior**](https://crrev.com/c/7532178)
- <span style="background: #10b981; color: white; padding: 2px 8px; border-radius: 12px; font-size: 11px; font-weight: bold;">MERGED</span> [**Ignore H2 sessions for non-SSL in AttemptManager**](https://crrev.com/c/7535202)

**In Review (DNS & Normalization):**
- <span style="background: #3b82f6; color: white; padding: 2px 8px; border-radius: 12px; font-size: 11px; font-weight: bold;">IN REVIEW</span> [**DnsTaskResultsManager target-name behavior**](https://crrev.com/c/7532080)
- <span style="background: #3b82f6; color: white; padding: 2px 8px; border-radius: 12px; font-size: 11px; font-weight: bold;">IN REVIEW</span> [**Canonicalize domain-name matching**](https://crrev.com/c/7532105)
- <span style="background: #3b82f6; color: white; padding: 2px 8px; border-radius: 12px; font-size: 11px; font-weight: bold;">IN REVIEW</span> [**Apply HTTPS metadata via alias targets**](https://crrev.com/c/7534958)
- <span style="background: #3b82f6; color: white; padding: 2px 8px; border-radius: 12px; font-size: 11px; font-weight: bold;">IN REVIEW</span> [**Deduplicate endpoints in DnsTaskResultsManager**](https://crrev.com/c/7531547)
- <span style="background: #3b82f6; color: white; padding: 2px 8px; border-radius: 12px; font-size: 11px; font-weight: bold;">IN REVIEW</span> [**Allow multiple HTTPS completions**](https://crrev.com/c/7531548)
- <span style="background: #3b82f6; color: white; padding: 2px 8px; border-radius: 12px; font-size: 11px; font-weight: bold;">IN REVIEW</span> [**Avoid adding HTTPS query names to DNS aliases**](https://crrev.com/c/7532007)
- <span style="background: #3b82f6; color: white; padding: 2px 8px; border-radius: 12px; font-size: 11px; font-weight: bold;">IN REVIEW</span> [**Surface HTTPS alias records**](https://crrev.com/c/7531967)
- <span style="background: #3b82f6; color: white; padding: 2px 8px; border-radius: 12px; font-size: 11px; font-weight: bold;">IN REVIEW</span> [**Normalize DNS names for endpoint keying**](https://crrev.com/c/7545367)
- <span style="background: #3b82f6; color: white; padding: 2px 8px; border-radius: 12px; font-size: 11px; font-weight: bold;">IN REVIEW</span> [**Normalize HTTPS target names in extractor**](https://crrev.com/c/7543470)
- <span style="background: #3b82f6; color: white; padding: 2px 8px; border-radius: 12px; font-size: 11px; font-weight: bold;">IN REVIEW</span> [**Propagate stale DNS aliases**](https://crrev.com/c/7548052)
- <span style="background: #3b82f6; color: white; padding: 2px 8px; border-radius: 12px; font-size: 11px; font-weight: bold;">IN REVIEW</span> [**Normalize canonical name matching in HostCache**](https://crrev.com/c/7549124)
- <span style="background: #3b82f6; color: white; padding: 2px 8px; border-radius: 12px; font-size: 11px; font-weight: bold;">IN REVIEW</span> [**Log DNS aliases with endpoint updates**](https://crrev.com/c/7549523)
- <span style="background: #3b82f6; color: white; padding: 2px 8px; border-radius: 12px; font-size: 11px; font-weight: bold;">IN REVIEW</span> [**Normalize canonical names in HostCache entries**](https://crrev.com/c/7546723)
- <span style="background: #3b82f6; color: white; padding: 2px 8px; border-radius: 12px; font-size: 11px; font-weight: bold;">IN REVIEW</span> [**HostCache normalization coverage**](https://crrev.com/c/7548494)

**In Review (Followups & ServiceMode):**
- <span style="background: #3b82f6; color: white; padding: 2px 8px; border-radius: 12px; font-size: 11px; font-weight: bold;">IN REVIEW</span> [**Extend DnsTaskResultsManager tests**](https://crrev.com/c/7550310)
- <span style="background: #3b82f6; color: white; padding: 2px 8px; border-radius: 12px; font-size: 11px; font-weight: bold;">IN REVIEW</span> [**Prototype AliasMode followup resolution**](https://crrev.com/c/7548608)
- <span style="background: #3b82f6; color: white; padding: 2px 8px; border-radius: 12px; font-size: 11px; font-weight: bold;">IN REVIEW</span> [**Add bounded recursion + cycle detection**](https://crrev.com/c/7548495)
- <span style="background: #3b82f6; color: white; padding: 2px 8px; border-radius: 12px; font-size: 11px; font-weight: bold;">IN REVIEW</span> [**Extend DnsTaskResultsManager to accept followups**](https://crrev.com/c/7543652)
- <span style="background: #3b82f6; color: white; padding: 2px 8px; border-radius: 12px; font-size: 11px; font-weight: bold;">IN REVIEW</span> [**Add ServiceMode TargetName followup query handling**](https://crrev.com/c/7550314)
- <span style="background: #3b82f6; color: white; padding: 2px 8px; border-radius: 12px; font-size: 11px; font-weight: bold;">IN REVIEW</span> [**Extend tests for ServiceMode multi-target followups**](https://crrev.com/c/7550430)
- <span style="background: #3b82f6; color: white; padding: 2px 8px; border-radius: 12px; font-size: 11px; font-weight: bold;">IN REVIEW</span> [**Validate IsMetadataReady semantics**](https://crrev.com/c/7543703)
- <span style="background: #3b82f6; color: white; padding: 2px 8px; border-radius: 12px; font-size: 11px; font-weight: bold;">IN REVIEW</span> [**Plumb target name through connection layer**](https://crrev.com/c/7550411)
- <span style="background: #3b82f6; color: white; padding: 2px 8px; border-radius: 12px; font-size: 11px; font-weight: bold;">IN REVIEW</span> [**Add connection-layer tests for multi-target ServiceMode**](https://crrev.com/c/7545973)
- <span style="background: #3b82f6; color: white; padding: 2px 8px; border-radius: 12px; font-size: 11px; font-weight: bold;">IN REVIEW</span> [**NetLog or UMA for followup query timing**](https://crrev.com/c/7550437)
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
- <span style="background: #3b82f6; color: white; padding: 2px 8px; border-radius: 12px; font-size: 11px; font-weight: bold;">IN REVIEW</span> [**Cancel in-flight QUIC attempts on session activation**](https://crrev.com/c/7552512)
- <span style="background: #3b82f6; color: white; padding: 2px 8px; border-radius: 12px; font-size: 11px; font-weight: bold;">IN REVIEW</span> [**Align HEv3 TCP/TLS timeout error codes**](https://crrev.com/c/7552570)
- <span style="background: #3b82f6; color: white; padding: 2px 8px; border-radius: 12px; font-size: 11px; font-weight: bold;">IN REVIEW</span> [**Add UMA for HEv3 TCP-based and QUIC attempt outcomes**](https://crrev.com/c/7552650)
- <span style="background: #3b82f6; color: white; padding: 2px 8px; border-radius: 12px; font-size: 11px; font-weight: bold;">IN REVIEW</span> [**Add HEv3 dual-stack TLS fallback test**](https://crrev.com/c/7552670)
- <span style="background: #3b82f6; color: white; padding: 2px 8px; border-radius: 12px; font-size: 11px; font-weight: bold;">IN REVIEW</span> [**Add HEv3 incremental DNS endpoint update test**](https://crrev.com/c/7552730)
- <span style="background: #3b82f6; color: white; padding: 2px 8px; border-radius: 12px; font-size: 11px; font-weight: bold;">IN REVIEW</span> [**Add HEv3 DNS error fallback and multi-endpoint tests**](https://crrev.com/c/7552870)
- <span style="background: #3b82f6; color: white; padding: 2px 8px; border-radius: 12px; font-size: 11px; font-weight: bold;">IN REVIEW</span> [**Add NetLog event for HEv3 SPDY throttle delay**](https://crrev.com/c/7552950)
- <span style="background: #3b82f6; color: white; padding: 2px 8px; border-radius: 12px; font-size: 11px; font-weight: bold;">IN REVIEW</span> [**Record QUIC failure in connection_attempts_**](https://crrev.com/c/7552392)
- <span style="background: #3b82f6; color: white; padding: 2px 8px; border-radius: 12px; font-size: 11px; font-weight: bold;">IN REVIEW</span> [**Convert CHECK to DCHECK in MaybeAttemptTcpBased**](https://crrev.com/c/7552931)
- <span style="background: #3b82f6; color: white; padding: 2px 8px; border-radius: 12px; font-size: 11px; font-weight: bold;">IN REVIEW</span> [**Test preconnect with HTTPS RR metadata endpoints**](https://crrev.com/c/7552951)
- <span style="background: #3b82f6; color: white; padding: 2px 8px; border-radius: 12px; font-size: 11px; font-weight: bold;">IN REVIEW</span> [**Test cancellation mid-followup**](https://crrev.com/c/7552051)
- <span style="background: #3b82f6; color: white; padding: 2px 8px; border-radius: 12px; font-size: 11px; font-weight: bold;">IN REVIEW</span> [**Integration cleanup**](https://crrev.com/c/7545376)

**In Review (HTTPS-RR Core - The Key Gate!):**
- <span style="background: #ef4444; color: white; padding: 2px 8px; border-radius: 12px; font-size: 11px; font-weight: bold;">KEY CL</span> [**Remove TargetName filter in DnsResponseResultExtractor**](https://crrev.com/c/7552252)
- <span style="background: #3b82f6; color: white; padding: 2px 8px; border-radius: 12px; font-size: 11px; font-weight: bold;">IN REVIEW</span> [**End-to-end HTTPS RR different TargetName followup test**](https://crrev.com/c/7552773)
- <span style="background: #3b82f6; color: white; padding: 2px 8px; border-radius: 12px; font-size: 11px; font-weight: bold;">IN REVIEW</span> [**Followup recursion limit + cycle detection test**](https://crrev.com/c/7552933)

**In Review (Metrics & Flag Flip):**
- <span style="background: #3b82f6; color: white; padding: 2px 8px; border-radius: 12px; font-size: 11px; font-weight: bold;">IN REVIEW</span> [**UMA for HEv3 vs legacy path selection**](https://crrev.com/c/7551954)
- <span style="background: #3b82f6; color: white; padding: 2px 8px; border-radius: 12px; font-size: 11px; font-weight: bold;">IN REVIEW</span> [**UMA for DNS resolution time in HttpStreamPool**](https://crrev.com/c/7552052)
- <span style="background: #3b82f6; color: white; padding: 2px 8px; border-radius: 12px; font-size: 11px; font-weight: bold;">IN REVIEW</span> [**UMA for intermediate vs final endpoint usage**](https://crrev.com/c/7551955)
- <span style="background: #f59e0b; color: white; padding: 2px 8px; border-radius: 12px; font-size: 11px; font-weight: bold;">FLAG FLIP</span> [**Enable kHappyEyeballsV3 by default**](https://crrev.com/c/7552932)

</div>
</details>
```

It's a deep dive into Chromium's networking internals—`HostResolver`, `HttpStreamPool`, `DnsTaskResultsManager`—but we're getting there. The goal remains: **Full RFC 9460 support in Chrome, backed by the performance of Happy Eyeballs v3.**

Stay tuned for updates as I work through the checklist.

## A Note on Reality

Will this work? I don't know yet. I'm one contributor with a vision, navigating a codebase shaped by many hands over many years. There will be tough reviews, architectural debates, and probably surprises I haven't anticipated. That's the nature of working in a project as complex as Chromium.

But here's what I do know: the best way to make something happen is to start. Every merged CL is one step closer. Every review comment is an opportunity to learn. And even if the path changes--even if we discover the way forward looks different than what I've mapped out--the effort itself moves the needle.

If there's a will, there's a way. We just might not know the way today.

> *"Only those who will risk going too far can possibly find out how far one can go."*
> — [T.S. Eliot](https://en.wikipedia.org/wiki/T._S._Eliot)
