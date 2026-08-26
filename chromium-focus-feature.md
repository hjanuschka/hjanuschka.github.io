---
title: "Implementing Chrome's --focus Flag"
category: "Chromium"
tech: "C++"
---

*A command-line option for focusing an existing tab instead of opening a duplicate.*

**Update 16.10.2025:** ✅ Feature landed in Chromium main branch (Chrome 143)

## The Initial Request

A [tweet from @tobi](https://x.com/tobi/status/1957195479361438142) proposed a command-line option for a common automation problem: focus an existing matching tab instead of opening another copy.

His proposed CLI syntax was clean:
```sh
chrome --focus=https://github.com/user/repo
```

## From Request to Implementation

The expected behavior was:
- If a matching tab exists, focus it
- If multiple matches exist, pick the most recently used
- If nothing matches, optionally open a new tab
- Make it scriptable for automation

## Technical Design

### Turning Behavior into Architecture

The spec translated into several technical challenges:

1. **Selector Parsing**: Supporting exact URLs, wildcards, and app IDs
2. **MRU Logic**: Finding and focusing the most recently used tab
3. **Cross-Window Search**: Looking across all Chrome windows
4. **Result Reporting**: JSON output for automation scripts

### The Implementation

The implementation follows Chrome's architecture patterns:

```cpp
// Parse the selector syntax
std::vector<Selector> ParseSelectors(const std::string& input);

// Find matches across all windows
std::vector<MatchCandidate> CollectMatchingTabs(
    const Selector& selector,
    const std::vector<Browser*>& browsers);

// MRU selection - the heart of the feature
void SortCandidatesByMRU(std::vector<MatchCandidate>& candidates);
```

### Making MRU Work

The less direct requirement was "pick the most recently used." The implementation uses session ordering as a practical recency proxy:

```cpp
// Leverage Chrome's SessionID ordering as a proxy for recency
bool CompareMRU(const MatchCandidate& a, const MatchCandidate& b) {
  return a.tab->session_id() > b.tab->session_id();
}
```

SessionIDs increase monotonically, so higher IDs = more recently created. Not perfect MRU, but a pragmatic solution that works.

## The Result

The feature now supports:

### Basic Usage
```sh
# Focus a specific URL
chrome --focus="https://github.com/chromium/chromium"

# Wildcard matching
chrome --focus="*github.com/chromium/*"

# Multiple selectors (first match wins)
chrome --focus="*github.com/*,*gitlab.com/*"
```

### Advanced Features
```sh
# JSON output for scripting
chrome --focus="*github.com/*" --output-json

# Open if not found
chrome --focus="https://example.com" --allow-create

# App ID matching
chrome --focus="app-id:abcdefghijklmnop"
```

## Use Cases

The option can be used for:

1. **Shell integration**: Bind keys to focus specific tabs
2. **IDE integration**: Open documentation without creating duplicate tabs
3. **Workflow automation**: Let scripts select browser content and read a JSON result
4. **Tab management**: Reuse an existing match when one is available


## Acknowledgments

Thanks to:
- **@tobi** for the original request
- **Yoav Weiss** for helping route the proposal
- **Daniel Murphy, Kaan Alsan, Erik Chen, and Jan Keitel** for code review and design feedback

## Implementation Details

**Status:** ✅ All CLs merged to Chromium main branch
- <span style="background: #10b981; color: white; padding: 2px 8px; border-radius: 12px; font-size: 11px; font-weight: bold;">MERGED</span> [**Foundation: Core infrastructure**](https://crrev.com/c/6850334)
- <span style="background: #10b981; color: white; padding: 2px 8px; border-radius: 12px; font-size: 11px; font-weight: bold;">MERGED</span> [**Integration: Wired up to startup flow**](https://crrev.com/c/6943437)
- <span style="background: #10b981; color: white; padding: 2px 8px; border-radius: 12px; font-size: 11px; font-weight: bold;">MERGED</span> [**JSON API: Result file output for automation**](https://crrev.com/c/6946350)
- Reviewers: Erik Chen, Kaan Alsan, Daniel Murphy, Jan Keitel
- Bug: [439499872](https://bugs.chromium.org/p/chromium/issues/detail?id=439499872)

---

**Links:**
- [Original Tweet](https://x.com/tobi/status/1957195479361438142)
- <span style="background: #10b981; color: white; padding: 2px 8px; border-radius: 12px; font-size: 11px; font-weight: bold;">MERGED</span> [**Foundation**](https://crrev.com/c/6850334)
- <span style="background: #10b981; color: white; padding: 2px 8px; border-radius: 12px; font-size: 11px; font-weight: bold;">MERGED</span> [**Integration**](https://crrev.com/c/6943437)
- <span style="background: #10b981; color: white; padding: 2px 8px; border-radius: 12px; font-size: 11px; font-weight: bold;">MERGED</span> [**JSON API**](https://crrev.com/c/6946350)
- [Design Document](https://docs.google.com/document/d/1YRf-BzHTAhqyV6wL6yRxVOU3zhByE6voSEwSNLgPZSU/edit)