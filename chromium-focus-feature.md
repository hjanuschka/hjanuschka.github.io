*How a Twitter conversation led to adding a major new feature to Chromium*

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

Thanks to:
- **Tobi Lütke** for the original idea
- **Yoav Weiss** who is actively supporting me getting forward with this feature

---

*This feature represents what I love about open source: seeing a problem, building a solution, and shipping it to millions of users. One tweet, one implementation, countless improved workflows.*

**Status:** Implementation complete, preparing for Chromium review

**Follow the development:**
- [Original Tweet](https://x.com/tobi/status/1957195479361438142)
- [My GitHub](https://github.com/hjanuschka)