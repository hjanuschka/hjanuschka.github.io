#!/bin/bash

# Contribution Status Updater
# Scans blog posts for CL/PR links and updates their status badges
#
# Usage: ./update_contribution_status.sh [--dry-run]
#
# Requirements:
#   - gh CLI (GitHub): brew install gh
#   - ch CLI (Chromium): cargo install anthropic-chromium-cli (or your ch tool)
#
# Status badge mappings:
#   MERGED     -> green  #10b981
#   OPEN/NEW   -> blue   #3b82f6  (IN REVIEW)
#   CLOSED     -> grey   #6b7280  (ABANDONED)

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[0;33m'
NC='\033[0m' # No Color

DRY_RUN=false
if [[ "$1" == "--dry-run" ]]; then
    DRY_RUN=true
    echo -e "${YELLOW}Running in dry-run mode - no files will be modified${NC}"
fi

echo -e "${BLUE}=== Contribution Status Updater ===${NC}\n"

# Badge HTML templates
BADGE_MERGED='<span style="background: #10b981; color: white; padding: 2px 8px; border-radius: 12px; font-size: 11px; font-weight: bold;">MERGED</span>'
BADGE_IN_REVIEW='<span style="background: #3b82f6; color: white; padding: 2px 8px; border-radius: 12px; font-size: 11px; font-weight: bold;">IN REVIEW</span>'
BADGE_ABANDONED='<span style="background: #6b7280; color: white; padding: 2px 8px; border-radius: 12px; font-size: 11px; font-weight: bold;">ABANDONED</span>'

# Track statistics
TOTAL=0
MERGED=0
IN_REVIEW=0
ABANDONED=0
ERRORS=0

# Function to check GitHub PR status
check_github_pr() {
    local url="$1"
    # Extract org/repo and PR number
    local repo=$(echo "$url" | sed -E 's|https://github.com/([^/]+/[^/]+)/pull/[0-9]+|\1|')
    local pr_num=$(echo "$url" | sed -E 's|.*/pull/([0-9]+)|\1|')

    local status=$(gh pr view "$pr_num" --repo "$repo" --json state -q '.state' 2>/dev/null || echo "ERROR")
    echo "$status"
}

# Function to check Chromium CL status
check_chromium_cl() {
    local url="$1"
    local cl_num=$(echo "$url" | sed -E 's|https://crrev.com/c/([0-9]+)|\1|')

    # Try using ch CLI if available, otherwise try curl to Gerrit API
    if command -v ch &> /dev/null; then
        local status=$(ch gerrit status "$cl_num" --format json 2>/dev/null | jq -r '.status' 2>/dev/null || echo "ERROR")
        echo "$status"
    else
        # Fallback: curl Gerrit API
        local status=$(curl -s "https://chromium-review.googlesource.com/changes/$cl_num" | tail -1 | jq -r '.status' 2>/dev/null || echo "ERROR")
        echo "$status"
    fi
}

# Function to check PDFium CL status
check_pdfium_cl() {
    local url="$1"
    local cl_num=$(echo "$url" | sed -E 's|https://pdfium-review.googlesource.com/c/pdfium/\+/([0-9]+)|\1|')

    # Curl PDFium Gerrit API
    local status=$(curl -s "https://pdfium-review.googlesource.com/changes/$cl_num" | tail -1 | jq -r '.status' 2>/dev/null || echo "ERROR")
    echo "$status"
}

# Function to get appropriate badge for status
get_badge() {
    local status="$1"
    case "$status" in
        MERGED|merged)
            echo "MERGED"
            ((MERGED++))
            ;;
        OPEN|NEW|open|new)
            echo "IN_REVIEW"
            ((IN_REVIEW++))
            ;;
        CLOSED|ABANDONED|closed|abandoned)
            echo "ABANDONED"
            ((ABANDONED++))
            ;;
        *)
            echo "ERROR"
            ((ERRORS++))
            ;;
    esac
}

echo -e "${BLUE}Scanning markdown files for CL/PR links...${NC}\n"

# Process each markdown file
for md_file in *.md; do
    [[ "$md_file" == "RULES.md" ]] && continue
    [[ "$md_file" == "README.md" ]] && continue
    [[ ! -f "$md_file" ]] && continue

    echo -e "${BLUE}Processing: $md_file${NC}"

    # Find all URLs in this file
    urls=$(grep -oE 'https://crrev\.com/c/[0-9]+|https://pdfium-review\.googlesource\.com/c/pdfium/\+/[0-9]+|https://github\.com/[^/]+/[^/]+/pull/[0-9]+' "$md_file" 2>/dev/null | sort -u || true)

    for url in $urls; do
        ((TOTAL++))

        # Determine URL type and check status
        if [[ "$url" == *"github.com"* ]]; then
            status=$(check_github_pr "$url")
            type="GitHub PR"
        elif [[ "$url" == *"crrev.com"* ]]; then
            status=$(check_chromium_cl "$url")
            type="Chromium CL"
        elif [[ "$url" == *"pdfium-review"* ]]; then
            status=$(check_pdfium_cl "$url")
            type="PDFium CL"
        else
            status="UNKNOWN"
            type="Unknown"
        fi

        badge=$(get_badge "$status")

        # Print status
        case "$badge" in
            MERGED)
                echo -e "  ${GREEN}✓${NC} $type: $url -> ${GREEN}$status${NC}"
                ;;
            IN_REVIEW)
                echo -e "  ${BLUE}○${NC} $type: $url -> ${BLUE}$status${NC}"
                ;;
            ABANDONED)
                echo -e "  ${YELLOW}✗${NC} $type: $url -> ${YELLOW}$status${NC}"
                ;;
            ERROR)
                echo -e "  ${RED}?${NC} $type: $url -> ${RED}ERROR (could not fetch)${NC}"
                ;;
        esac
    done
    echo ""
done

echo -e "${BLUE}=== Summary ===${NC}"
echo -e "Total checked: $TOTAL"
echo -e "${GREEN}Merged: $MERGED${NC}"
echo -e "${BLUE}In Review: $IN_REVIEW${NC}"
echo -e "${YELLOW}Abandoned: $ABANDONED${NC}"
echo -e "${RED}Errors: $ERRORS${NC}"

if [[ "$DRY_RUN" == true ]]; then
    echo -e "\n${YELLOW}Dry run complete. Run without --dry-run to update files.${NC}"
else
    echo -e "\n${GREEN}Status check complete!${NC}"
    echo -e "${BLUE}To update badges in markdown files, manually update the badge colors based on status above.${NC}"
    echo -e "${BLUE}Then run: ./build-blog.sh${NC}"
fi
