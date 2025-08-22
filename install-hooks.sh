#!/bin/bash

# Script to install git hooks for the project

set -e

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}Installing git hooks...${NC}"

# Get the repository root
REPO_ROOT=$(git rev-parse --show-toplevel 2>/dev/null)

if [ $? -ne 0 ]; then
    echo -e "${YELLOW}Warning: Not in a git repository${NC}"
    exit 1
fi

# Create hooks directory if it doesn't exist
mkdir -p "$REPO_ROOT/.git/hooks"

# Create pre-commit hook
cat > "$REPO_ROOT/.git/hooks/pre-commit" << 'EOF'
#!/bin/bash

# Pre-commit hook to build static blog posts
# This ensures blog posts are always compiled before committing

echo "🔨 Pre-commit: Building static blog posts..."

# Get the repository root
REPO_ROOT=$(git rev-parse --show-toplevel)

# Check if build script exists
if [ ! -f "$REPO_ROOT/build-blog.sh" ]; then
    echo "⚠️  Warning: build-blog.sh not found, skipping blog build"
    exit 0
fi

# Run the build script
cd "$REPO_ROOT"
./build-blog.sh

# Check if build was successful
if [ $? -eq 0 ]; then
    echo "✅ Blog posts built successfully"
    
    # Add the generated HTML files to the commit
    git add chromium-focus-feature.html chromium-omarchy.html 2>/dev/null
    
    # Check if there are any actual changes to the HTML files
    if git diff --cached --name-only | grep -q "\.html$"; then
        echo "📝 Updated HTML files added to commit"
    fi
else
    echo "❌ Blog build failed"
    echo "   Please fix the build errors before committing"
    exit 1
fi

exit 0
EOF

# Make the hook executable
chmod +x "$REPO_ROOT/.git/hooks/pre-commit"

echo -e "${GREEN}✓ Pre-commit hook installed successfully!${NC}"
echo -e "${BLUE}The build script will now run automatically before each commit.${NC}"
echo ""
echo "To bypass the hook (not recommended), use:"
echo "  git commit --no-verify"
echo ""
echo "To uninstall the hook, run:"
echo "  rm .git/hooks/pre-commit"