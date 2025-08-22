#!/bin/bash

# Blog Static Site Generator
# Converts markdown blog posts to static HTML with syntax highlighting

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}Building static blog posts...${NC}"

# Check if required commands exist
command -v node >/dev/null 2>&1 || { echo -e "${RED}Error: Node.js is required but not installed.${NC}" >&2; exit 1; }

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo -e "${BLUE}Installing dependencies...${NC}"
    npm init -y >/dev/null 2>&1
    npm install marked prismjs prism-themes --save-dev
fi

# Create build directory if it doesn't exist
mkdir -p build

# Create Node.js script for markdown processing
cat > build-markdown.js << 'EOF'
const fs = require('fs');
const path = require('path');
const { marked } = require('marked');
const Prism = require('prismjs');

// Load additional languages
require('prismjs/components/prism-bash');
require('prismjs/components/prism-c');
require('prismjs/components/prism-cpp');
require('prismjs/components/prism-python');
require('prismjs/components/prism-json');
require('prismjs/components/prism-shell-session');

// Configure marked to use Prism for syntax highlighting
marked.setOptions({
  highlight: function(code, lang) {
    // Map 'sh' to 'bash' for Prism
    if (lang === 'sh') lang = 'bash';
    
    if (Prism.languages[lang]) {
      return Prism.highlight(code, Prism.languages[lang], lang);
    }
    return code;
  },
  breaks: true,
  gfm: true
});

// Read command line arguments
const mdFile = process.argv[2];
const title = process.argv[3];
const category = process.argv[4] || 'Chromium';
const tech = process.argv[5] || 'C++';

if (!mdFile) {
  console.error('Usage: node build-markdown.js <markdown-file> <title> [category] [tech]');
  process.exit(1);
}

// Read markdown file
const markdown = fs.readFileSync(mdFile, 'utf8');

// Convert to HTML
const htmlContent = marked.parse(markdown);

// Output just the HTML content
console.log(htmlContent);
EOF

# HTML template function
generate_html() {
    local md_file="$1"
    local output_file="$2"
    local title="$3"
    local category="${4:-Chromium}"
    local tech="${5:-C++}"
    
    echo -e "${BLUE}Processing: $md_file -> $output_file${NC}"
    
    # Generate HTML content from markdown
    local content=$(node build-markdown.js "$md_file" "$title" "$category" "$tech")
    
    # Extract first paragraph for description (remove HTML tags)
    local description=$(echo "$content" | grep -m1 "<p><em>" | sed 's/<[^>]*>//g' | sed 's/&[^;]*;//g' | cut -c1-160)
    
    # Create full HTML page
    cat > "$output_file" << EOF
<!doctype html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>$title - Helmut Januschka</title>
  <meta name="description" content="${description:-$title}">
  
  <!-- Structured Data -->
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "headline": "$title",
    "description": "${description:-$title}",
    "author": {
      "@type": "Person",
      "name": "Helmut Januschka",
      "url": "https://januschka.com",
      "sameAs": [
        "https://github.com/hjanuschka",
        "https://twitter.com/hjanuschka",
        "https://linkedin.com/in/hjanuschka"
      ]
    },
    "publisher": {
      "@type": "Person",
      "name": "Helmut Januschka",
      "url": "https://januschka.com"
    },
    "datePublished": "2024-08-01",
    "dateModified": "$(date -u +%Y-%m-%d)",
    "image": "https://januschka.com/og-image.png",
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": "https://januschka.com/$output_file"
    },
    "keywords": "$category, $tech, Chromium, Open Source, Browser Development",
    "articleSection": "Technology",
    "inLanguage": "en-US",
    "potentialAction": {
      "@type": "ReadAction",
      "target": "https://januschka.com/$output_file"
    }
  }
  </script>
  
  <!-- Open Graph -->
  <meta property="og:title" content="$title">
  <meta property="og:description" content="${description:-$title}">
  <meta property="og:type" content="article">
  <meta property="og:url" content="https://januschka.com/$output_file">
  <meta property="og:site_name" content="Helmut Januschka">
  <meta property="article:author" content="Helmut Januschka">
  
  <!-- Twitter Card -->
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:creator" content="@hjanuschka">
  <meta name="twitter:title" content="$title">
  <meta name="twitter:description" content="${description:-$title}">
  
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;700&display=swap" rel="stylesheet">
  <link href="https://cdn.jsdelivr.net/npm/prismjs@1.29.0/themes/prism-tomorrow.min.css" rel="stylesheet">
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    :root {
      --bg: #0d1117;
      --bg-light: #161b22;
      --bg-lighter: #21262d;
      --text: #ffffff;
      --text-dim: #7d8590;
      --accent: #58a6ff;
      --accent-dim: #1f6feb;
      --border: #30363d;
      --orange: #ff7b72;
    }

    /* Light mode */
    [data-theme="light"] {
      --bg: #ffffff;
      --bg-light: #f6f8fa;
      --bg-lighter: #f1f3f4;
      --text: #24292f;
      --text-dim: #656d76;
      --accent: #0969da;
      --accent-dim: #0550ae;
      --border: #d0d7de;
      --orange: #cf222e;
    }

    /* Matrix Theme */
    [data-theme="matrix"] {
      --bg: #0a0a0a;
      --bg-light: #1a1a1a;
      --bg-lighter: #2a2a2a;
      --text: #ffffff;
      --text-dim: #888888;
      --accent: #00ff41;
      --accent-dim: #00aa2b;
      --border: #333333;
      --orange: #ff6b35;
    }

    /* Cyan Terminal Theme */
    [data-theme="cyan"] {
      --bg: #001b1d;
      --bg-light: #003339;
      --bg-lighter: #004a52;
      --text: #ffffff;
      --text-dim: #9ca3af;
      --accent: #00d9ff;
      --accent-dim: #0891b2;
      --border: #374151;
      --orange: #fbbf24;
    }

    /* Purple Synthwave Theme */
    [data-theme="purple"] {
      --bg: #0f0f23;
      --bg-light: #1a1a3a;
      --bg-lighter: #252550;
      --text: #ffffff;
      --text-dim: #a78bfa;
      --accent: #c084fc;
      --accent-dim: #9333ea;
      --border: #4c1d95;
      --orange: #f59e0b;
    }

    /* Amber Terminal Theme */
    [data-theme="amber"] {
      --bg: #1c1611;
      --bg-light: #2d2318;
      --bg-lighter: #3d301f;
      --text: #ffffff;
      --text-dim: #a3a3a3;
      --accent: #fbbf24;
      --accent-dim: #d97706;
      --border: #57534e;
      --orange: #dc2626;
    }

    /* Classic Monochrome Theme */
    [data-theme="mono"] {
      --bg: #000000;
      --bg-light: #1a1a1a;
      --bg-lighter: #2d2d2d;
      --text: #ffffff;
      --text-dim: #9ca3af;
      --accent: #ffffff;
      --accent-dim: #d1d5db;
      --border: #4b5563;
      --orange: #6b7280;
    }

    /* Pink Neon Theme */
    [data-theme="pink"] {
      --bg: #1a0b1a;
      --bg-light: #2d1b2d;
      --bg-lighter: #402b40;
      --text: #ffffff;
      --text-dim: #d1d5db;
      --accent: #ff10f0;
      --accent-dim: #c026d3;
      --border: #7c2d12;
      --orange: #fb923c;
    }

    body {
      font-family: 'JetBrains Mono', monospace;
      background: var(--bg);
      color: var(--text);
      line-height: 1.6;
      font-size: 14px;
    }

    .container {
      max-width: 900px;
      margin: 0 auto;
      padding: 0 20px;
    }

    /* Navigation */
    .nav {
      background: var(--bg-light);
      border-bottom: 3px solid var(--accent);
      padding: 15px 0;
    }

    .nav-content {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .nav-brand {
      font-weight: bold;
      color: var(--accent);
      font-size: 16px;
    }

    .nav-links {
      display: flex;
      gap: 30px;
    }

    .nav-links a {
      color: var(--text);
      text-decoration: none;
      padding: 8px 16px;
      border: 2px solid transparent;
      border-radius: 6px;
      transition: all 0.3s ease;
    }

    .nav-links a:hover {
      border-color: var(--accent);
      background: var(--bg);
    }

    /* Theme Switcher */
    .theme-switcher {
      display: flex;
      align-items: center;
      gap: 15px;
    }

    .theme-dropdown {
      position: relative;
    }

    .theme-button {
      background: var(--bg-light);
      border: 2px solid var(--border);
      border-radius: 6px;
      color: var(--text);
      padding: 8px 12px;
      cursor: pointer;
      font-family: inherit;
      font-size: 12px;
      display: flex;
      align-items: center;
      gap: 6px;
      transition: all 0.3s ease;
    }

    .theme-button:hover {
      border-color: var(--accent);
      background: var(--bg);
    }

    .theme-menu {
      position: absolute;
      top: 100%;
      right: 0;
      background: #1a1a1a;
      border: 2px solid #333333;
      border-radius: 8px;
      margin-top: 5px;
      min-width: 150px;
      z-index: 1000;
      display: none;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.5);
    }

    .theme-menu.show {
      display: block;
      animation: fadeIn 0.2s ease;
    }

    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(-5px); }
      to { opacity: 1; transform: translateY(0); }
    }

    .theme-option {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 12px 16px;
      color: #ffffff;
      text-decoration: none;
      font-size: 12px;
      transition: background 0.2s ease;
      border: none;
      width: 100%;
      text-align: left;
      background: none;
      cursor: pointer;
      font-family: inherit;
    }

    .theme-option:hover {
      background: #2a2a2a;
      color: #ffffff;
    }

    .theme-option:first-child {
      border-radius: 6px 6px 0 0;
    }

    .theme-option:last-child {
      border-radius: 0 0 6px 6px;
    }

    .theme-preview {
      width: 12px;
      height: 12px;
      border-radius: 50%;
      border: 1px solid #666666;
      flex-shrink: 0;
    }

    /* Blog Post Styles */
    .blog-header {
      background: var(--bg-light);
      border-bottom: 3px solid var(--accent);
      padding: 40px 0;
      margin-bottom: 40px;
    }

    .blog-title {
      font-size: 32px;
      color: var(--accent);
      margin-bottom: 15px;
      line-height: 1.2;
    }

    .blog-meta {
      display: flex;
      gap: 20px;
      color: var(--text-dim);
      font-size: 13px;
    }

    .blog-content {
      background: var(--bg-light);
      border: 2px solid var(--border);
      border-radius: 12px;
      padding: 40px;
      margin-bottom: 40px;
    }

    /* Markdown Content Styles */
    .blog-content h1 {
      color: var(--accent);
      font-size: 28px;
      margin: 30px 0 20px;
      padding-bottom: 10px;
      border-bottom: 2px solid var(--border);
    }

    .blog-content h2 {
      color: var(--orange);
      font-size: 24px;
      margin: 30px 0 15px;
    }

    .blog-content h3 {
      color: var(--accent);
      font-size: 20px;
      margin: 25px 0 15px;
    }

    .blog-content p {
      margin: 15px 0;
      line-height: 1.8;
      color: var(--text);
    }

    .blog-content a {
      color: var(--accent);
      text-decoration: none;
      border-bottom: 1px solid var(--accent);
      transition: all 0.3s ease;
    }

    .blog-content a:hover {
      color: var(--orange);
      border-bottom-color: var(--orange);
    }

    .blog-content ul, .blog-content ol {
      margin: 15px 0;
      padding-left: 30px;
    }

    .blog-content li {
      margin: 8px 0;
      line-height: 1.8;
    }

    .blog-content code {
      background: var(--bg);
      color: var(--accent);
      padding: 2px 6px;
      border-radius: 4px;
      font-family: 'JetBrains Mono', monospace;
      font-size: 13px;
    }

    .blog-content pre {
      background: #1d1f21 !important;
      border: 2px solid var(--border);
      border-radius: 8px;
      padding: 20px !important;
      margin: 20px 0;
      overflow-x: auto;
    }

    .blog-content pre code {
      background: none !important;
      color: #c5c8c6 !important;
      padding: 0;
      text-shadow: none !important;
    }

    /* Override Prism theme colors for better integration */
    .token.comment,
    .token.prolog,
    .token.doctype,
    .token.cdata {
      color: #969896 !important;
    }

    .token.punctuation {
      color: #c5c8c6 !important;
    }

    .token.property,
    .token.tag,
    .token.boolean,
    .token.number,
    .token.constant,
    .token.symbol,
    .token.deleted {
      color: #cc6666 !important;
    }

    .token.selector,
    .token.attr-name,
    .token.string,
    .token.char,
    .token.builtin,
    .token.inserted {
      color: #b5bd68 !important;
    }

    .token.operator,
    .token.entity,
    .token.url,
    .language-css .token.string,
    .style .token.string {
      color: #8abeb7 !important;
    }

    .token.atrule,
    .token.attr-value,
    .token.keyword {
      color: #b294bb !important;
    }

    .token.function,
    .token.class-name {
      color: #81a2be !important;
    }

    .token.regex,
    .token.important,
    .token.variable {
      color: #de935f !important;
    }

    .blog-content blockquote {
      border-left: 4px solid var(--accent);
      padding-left: 20px;
      margin: 20px 0;
      color: var(--text-dim);
      font-style: italic;
    }

    .blog-content em {
      color: var(--text-dim);
      font-style: italic;
    }

    .blog-content strong {
      color: var(--accent);
      font-weight: bold;
    }

    /* Status indicator */
    .status {
      display: inline-block;
      width: 8px;
      height: 8px;
      background: var(--accent);
      border-radius: 50%;
      margin-right: 8px;
      animation: pulse 2s infinite;
    }

    @keyframes pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.3; }
    }

    /* Footer */
    .footer {
      background: var(--bg-light);
      border-top: 3px solid var(--accent);
      padding: 30px 0;
      margin-top: 60px;
      text-align: center;
    }

    .footer-content {
      display: flex;
      justify-content: space-between;
      align-items: center;
      color: var(--text-dim);
    }

    .badge {
      background: var(--bg-lighter);
      color: var(--text);
      padding: 4px 10px;
      border-radius: 12px;
      border: 1px solid var(--border);
      font-size: 11px;
    }

    /* Mobile Responsive */
    @media (max-width: 768px) {
      .blog-title {
        font-size: 24px;
      }
      
      .nav-content {
        flex-direction: column;
        gap: 20px;
      }
      
      .nav-content > div {
        flex-direction: column;
        gap: 15px;
      }
      
      .nav-links {
        gap: 15px;
      }
      
      .theme-switcher {
        justify-content: center;
      }
      
      .blog-content {
        padding: 20px;
      }
      
      .footer-content {
        flex-direction: column;
        gap: 10px;
      }
    }
  </style>
</head>
<body>
  <!-- Navigation -->
  <nav class="nav">
    <div class="container">
      <div class="nav-content">
        <div class="nav-brand">
          <span class="status"></span>
          hjanuschka@world
        </div>
        <div style="display: flex; align-items: center; gap: 30px;">
          <div class="nav-links">
            <a href="/">← Back to Home</a>
            <a href="/#projects">Projects</a>
            <a href="/#contact">Contact</a>
          </div>
          <div class="theme-switcher">
            <div class="theme-dropdown">
              <button class="theme-button" id="themeButton">
                <span class="theme-preview" style="background: var(--accent);"></span>
                Themes ▼
              </button>
              <div class="theme-menu" id="themeMenu">
                <button class="theme-option" data-theme="blue">
                  <span class="theme-preview" style="background: #58a6ff;"></span>
                  GitHub Blue
                </button>
                <button class="theme-option" data-theme="light">
                  <span class="theme-preview" style="background: #0969da;"></span>
                  Light Mode
                </button>
                <button class="theme-option" data-theme="matrix">
                  <span class="theme-preview" style="background: #00ff41;"></span>
                  Matrix Green
                </button>
                <button class="theme-option" data-theme="cyan">
                  <span class="theme-preview" style="background: #00d9ff;"></span>
                  Cyan Terminal
                </button>
                <button class="theme-option" data-theme="purple">
                  <span class="theme-preview" style="background: #c084fc;"></span>
                  Purple Synthwave
                </button>
                <button class="theme-option" data-theme="amber">
                  <span class="theme-preview" style="background: #fbbf24;"></span>
                  Amber Terminal
                </button>
                <button class="theme-option" data-theme="mono">
                  <span class="theme-preview" style="background: #ffffff;"></span>
                  Monochrome
                </button>
                <button class="theme-option" data-theme="pink">
                  <span class="theme-preview" style="background: #ff10f0;"></span>
                  Pink Neon
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </nav>

  <!-- Blog Header -->
  <div class="blog-header">
    <div class="container">
      <h1 class="blog-title">$title</h1>
      <div class="blog-meta">
        <span>⚡ $category</span>
        <span>🔧 $tech</span>
        <span>👤 Helmut Januschka</span>
      </div>
    </div>
  </div>

  <!-- Blog Content -->
  <article class="container">
    <div class="blog-content">
$content
    </div>
  </article>

  <!-- Footer -->
  <footer class="footer">
    <div class="container">
      <div class="footer-content">
        <span>© 2025 Helmut Januschka</span>
        <span class="badge">Powered by marked.js + Terminal Vibes</span>
      </div>
    </div>
  </footer>

  <script>
    // Theme switcher functionality
    const themeButton = document.getElementById('themeButton');
    const themeMenu = document.getElementById('themeMenu');
    const themeOptions = document.querySelectorAll('.theme-option');

    // Toggle theme menu
    themeButton.addEventListener('click', function() {
      themeMenu.classList.toggle('show');
    });

    // Close theme menu when clicking outside
    document.addEventListener('click', function(e) {
      if (!themeButton.contains(e.target) && !themeMenu.contains(e.target)) {
        themeMenu.classList.remove('show');
      }
    });

    // Theme selection
    themeOptions.forEach(option => {
      option.addEventListener('click', function() {
        const theme = this.getAttribute('data-theme');
        
        if (theme === 'blue') {
          document.documentElement.removeAttribute('data-theme');
        } else {
          document.documentElement.setAttribute('data-theme', theme);
        }
        
        // Save theme preference
        localStorage.setItem('theme', theme);
        
        // Close menu
        themeMenu.classList.remove('show');
      });
    });

    // Load saved theme
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme && savedTheme !== 'blue') {
      document.documentElement.setAttribute('data-theme', savedTheme);
    }

    // Smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
          target.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
          });
        }
      });
    });
  </script>
  
  <!-- Prism.js for syntax highlighting -->
  <script src="https://cdn.jsdelivr.net/npm/prismjs@1.29.0/components/prism-core.min.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/prismjs@1.29.0/plugins/autoloader/prism-autoloader.min.js"></script>
  <script>
    // Highlight all code blocks
    Prism.highlightAll();
  </script>
</body>
</html>
EOF
    
    echo -e "${GREEN}✓ Generated: $output_file${NC}"
}

# Build blog posts
generate_html \
    "chromium-focus-feature.md" \
    "chromium-focus-feature.html" \
    "From Tweet to Chrome: Implementing Tobi Lütke's Browser Focus Feature" \
    "Chromium" \
    "C++"

generate_html \
    "chromium-omarchy.md" \
    "chromium-omarchy.html" \
    "Dynamic Chrome Themes: Building DHH's Vision for Omarchy" \
    "Chromium" \
    "C++"

# Clean up temporary files
rm -f build-markdown.js

echo -e "${GREEN}✓ Build complete!${NC}"
echo -e "${BLUE}Blog posts have been compiled to static HTML with syntax highlighting.${NC}"