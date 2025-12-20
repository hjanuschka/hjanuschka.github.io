*How a Twitter conversation led to adding a major new feature to Chromium*

**Update 16.10.2025:** ✅ Feature landed in Chromium main branch (Chrome 143)

## The Origin Story

It started with [a tweet from Tobi Lütke](https://x.com/tobi/status/1957195479361438142) (CEO of Shopify). He proposed an elegant solution to a problem every developer faces: tab proliferation. His idea was simple but powerful - Chrome should focus existing tabs instead of blindly creating new ones.

His proposed CLI syntax was clean:
```sh
chrome --focus=https://github.com/user/repo
```

I saw the tweet, loved the idea, and thought: "Why wait? Let's build this into Chrome right now."

## From Concept to Implementation

The vision was clear:
- If a matching tab exists, focus it
- If multiple matches exist, pick the most recently used
- If nothing matches, optionally open a new tab
- Make it scriptable for automation

This became my north star for the implementation.

## The Technical Journey

### Turning Ideas into Architecture

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

The most challenging part was "pick the most recently used." Chrome doesn't directly track this, so I had to be creative:

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

## Real-World Impact

This feature changes how developers interact with Chrome:

1. **Shell Integration**: Bind keys to focus specific tabs
2. **IDE Integration**: Jump to documentation without tab duplication
3. **Workflow Automation**: Scripts can intelligently manage browser state
4. **Reduced Memory**: Fewer duplicate tabs = less RAM usage


## Acknowledgments

> Getting a feature into Chromium is a journey, not a sprint. The review process pushed me to think deeper about edge cases, performance implications, and API design. Every piece of feedback made this feature better. Huge thanks to all the reviewers who invested their time and expertise to make this happen.

Thanks to:
- **Tobi Lütke** for the original idea
- **Yoav Weiss** who is actively supporting me getting forward with this feature
- **Daniel Murphy, Kaan Alsan, Erik Chen, Jan Keitel** for thorough code reviews and valuable feedback
- **The entire Chromium community** for the collaborative review process

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
- [My GitHub](https://github.com/hjanuschka)