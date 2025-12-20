# Website & Blog Rules

## Website Structure

```
januschka.com/
├── index.html              # Homepage (inline CSS, theme switcher)
├── blog-template.html      # Dynamic blog loader (not used for static posts)
├── build-blog.sh           # Converts .md → .html with Prism syntax highlighting
├── *.md                    # Blog post sources
├── *.html                  # Generated blog posts (from build-blog.sh)
└── RULES.md                # This file
```

## Building Blog Posts

```bash
./build-blog.sh
```

This script:
1. Reads all `*.md` files (except RULES.md, README.md)
2. Generates static HTML with Prism.js syntax highlighting
3. Pre-commit hook runs this automatically

## Adding a New Blog Post

1. Create `new-post.md` with content
2. Run `./build-blog.sh` (or commit to trigger hook)
3. Add to homepage blog section in `index.html`:

```html
<a href="/new-post.html" style="text-decoration: none; color: inherit;">
  <div class="project-card" style="cursor: pointer; position: relative; padding-top: 35px;">
    <span style="position: absolute; top: 15px; right: 15px; background: #22c55e; color: white; padding: 4px 10px; border-radius: 12px; font-size: 11px; font-weight: bold;">🎉 LANDED</span>
    <h3 style="margin-top: 0;">Post Title</h3>
    <p>Post description...</p>
    <div class="project-badges">
      <span class="project-badge">Read Post →</span>
    </div>
  </div>
</a>
```

## Homepage Blog Status Badges

| Status | Color | Badge |
|--------|-------|-------|
| Landed/Merged | Green `#22c55e` | `🎉 LANDED` |
| In Progress | Orange `#f59e0b` | `🚧 IN PROGRESS` |

## Theme System

Homepage themes (index.html):
- **Matte Black** (default): `--accent: #FFC107`
- **Osaka Jade**: `--accent: #2DD5B7`
- **Purple Moon**: `--accent: #9b49c8`
- **GitHub Blue**: `--accent: #58a6ff`

Blog themes (generated posts): GitHub Blue default with same 4 themes.

---

# Blog Post Style Rules

## Linking CLs and PRs

Use **description-first** format with badge on the left for easy scanning:

```
<badge> [**Description**](url)
```

### URL Formats

- **Chromium CLs**: `https://crrev.com/c/{CL_NUMBER}`
- **PDFium CLs**: `https://pdfium-review.googlesource.com/c/pdfium/+/{CL_NUMBER}`
- **GitHub PRs**: `https://github.com/{org}/{repo}/pull/{PR_NUMBER}`

### Status Badges

**MERGED** (green):
```html
<span style="background: #10b981; color: white; padding: 2px 8px; border-radius: 12px; font-size: 11px; font-weight: bold;">MERGED</span>
```

**IN REVIEW** (blue):
```html
<span style="background: #3b82f6; color: white; padding: 2px 8px; border-radius: 12px; font-size: 11px; font-weight: bold;">IN REVIEW</span>
```

**ABANDONED** / **IN PROGRESS** (grey):
```html
<span style="background: #6b7280; color: white; padding: 2px 8px; border-radius: 12px; font-size: 11px; font-weight: bold;">ABANDONED</span>
```

### Examples

**Chromium CL:**
```markdown
- <span style="background: #10b981; color: white; padding: 2px 8px; border-radius: 12px; font-size: 11px; font-weight: bold;">MERGED</span> [**Add jxl-rs to third_party**](https://crrev.com/c/7201443)
```

Renders as:
- <span style="background: #10b981; color: white; padding: 2px 8px; border-radius: 12px; font-size: 11px; font-weight: bold;">MERGED</span> [**Add jxl-rs to third_party**](https://crrev.com/c/7201443)

**GitHub PR:**
```markdown
- <span style="background: #10b981; color: white; padding: 2px 8px; border-radius: 12px; font-size: 11px; font-weight: bold;">MERGED</span> [**FFI-friendly API for Chromium integration**](https://github.com/libjxl/jxl-rs/pull/556)
```

Renders as:
- <span style="background: #10b981; color: white; padding: 2px 8px; border-radius: 12px; font-size: 11px; font-weight: bold;">MERGED</span> [**FFI-friendly API for Chromium integration**](https://github.com/libjxl/jxl-rs/pull/556)

## Linking Chromium Issues

Use the issues.chromium.org URL:

```markdown
[Issue 462919304](https://issues.chromium.org/issues/462919304)
```

---

## Checking Status with CLI Tools

### Chromium CLs (using `ch` CLI)

```bash
# Check single CL status
ch gerrit status 7201443 --format json | jq '{subject, status}'

# Output:
# {
#   "subject": "Add jxl-rs pure Rust JPEG XL decoder to third_party",
#   "status": "MERGED"
# }

# List CLs by owner
ch gerrit list --query "owner:helmut@januschka.com status:merged" --format json
```

### GitHub PRs (using `gh` CLI)

```bash
# Check single PR status
gh pr view 556 --repo libjxl/jxl-rs --json state,title

# Output:
# {
#   "state": "MERGED",
#   "title": "Add FFI-friendly API..."
# }

# List PRs by author
gh pr list --repo libjxl/jxl-rs --author hjanuschka --state all --json number,title,state

# Check multiple PRs at once
for pr in 537 536 535 532 529; do
  gh pr view $pr --repo libjxl/jxl-rs --json number,state | jq -c
done
```

### Status Mapping

| CLI Status | Badge |
|------------|-------|
| `MERGED` | <span style="background: #10b981; color: white; padding: 2px 8px; border-radius: 12px; font-size: 11px; font-weight: bold;">MERGED</span> |
| `OPEN` / `NEW` | <span style="background: #3b82f6; color: white; padding: 2px 8px; border-radius: 12px; font-size: 11px; font-weight: bold;">IN REVIEW</span> |
| `CLOSED` / `ABANDONED` | <span style="background: #6b7280; color: white; padding: 2px 8px; border-radius: 12px; font-size: 11px; font-weight: bold;">ABANDONED</span> |
