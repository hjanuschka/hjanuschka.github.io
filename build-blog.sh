#!/bin/bash

# Blog static site generator (thin wrapper).
#
# Posts are *.md files with YAML front matter:
#   ---
#   title: "Your Post Title"
#   category: "Chromium"
#   tech: "C++"
#   ---
#
# The actual work lives in:
#   build/build.js    - discovery + assembly from templates/
#   build/render.js   - markdown -> html (marked + Prism)
#   templates/        - post.html, styles.css, nav.html, footer.html, app.js

RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

command -v node >/dev/null 2>&1 || { echo -e "${RED}Error: Node.js is required but not installed.${NC}" >&2; exit 1; }

if [ ! -d "node_modules/marked" ] || [ ! -d "node_modules/js-yaml" ] || [ ! -d "node_modules/prismjs" ]; then
    echo -e "${BLUE}Installing dependencies...${NC}"
    npm init -y >/dev/null 2>&1 || true
    npm install marked prismjs prism-themes js-yaml --save-dev
fi

node build/build.js

echo ""
echo -e "${BLUE}To add a new blog post, create a .md file with front matter:${NC}"
echo -e "${BLUE}  ---${NC}"
echo -e "${BLUE}  title: \"Your Post Title\"${NC}"
echo -e "${BLUE}  category: \"Chromium\"${NC}"
echo -e "${BLUE}  tech: \"C++ / Rust\"${NC}"
echo -e "${BLUE}  ---${NC}"
echo -e "${BLUE}  Your markdown content here...${NC}"
