# Osaka Jade Theme - Documentation Index

This directory contains comprehensive theme documentation extracted from the [basecamp/omarchy](https://github.com/basecamp/omarchy) GitHub repository.

## Files in This Collection

### 1. **osaka-jade-theme-report.md** (286 lines)
Complete technical documentation including:
- Full color palette with hex codes and RGB values
- Terminal colors (ANSI 0-15)
- UI element colors for all components
- Graph colors and gradients
- Terminal emulator configurations (Alacritty, Kitty, Ghostty)
- UI component specific colors (Walker, Waybar, Swayosd, Mako, Hyprland)
- Theme file structure overview
- Comparison with Rose-Pine theme
- All 13 available Omarchy themes listed

**Use this file for:** Technical reference, detailed color specifications, comprehensive documentation

### 2. **osaka-jade-colors-quick-reference.txt** (100 lines)
Quick lookup reference including:
- Core palette summary
- ANSI terminal colors (0-15) with descriptions
- Accent colors
- UI elements
- Special colors (lock screen, OSD, etc.)
- Color harmony notes
- RGB values for special engines
- All available themes list

**Use this file for:** Quick color lookups, instant reference, sharing with team

### 3. **osaka-jade-css-variables.css** (239 lines)
Production-ready CSS stylesheet with:
- CSS custom properties for all colors
- Semantic color variables
- Terminal color mappings
- Graph gradient definitions
- Typography variables
- Pre-built component styles (buttons, alerts, inputs, etc.)
- Utility classes
- Dark mode support structure
- Animations and transitions

**Use this file for:** Direct implementation in your website, CSS framework integration

## Quick Start

### For Web Implementation

1. Include the CSS file:
```html
<link rel="stylesheet" href="osaka-jade-css-variables.css">
```

2. Use CSS variables in your styles:
```css
body {
  background-color: var(--color-bg-primary);
  color: var(--color-text-primary);
}

a {
  color: var(--color-accent-cyan);
}
```

### For Design Tools

Reference the quick-reference file for color codes to add to your design system:
- Primary colors: Background #111C18, Text #C1C497
- Accents: Cyan #2DD5B7, Rose #D2689C, Gold #E5C736
- Borders: #214237

### For Configuration Files

See osaka-jade-theme-report.md for specific configurations for:
- Alacritty, Kitty, Ghostty (terminal emulators)
- Btop (system monitor)
- Hyprland (window manager)
- Waybar, Walker, Swayosd (UI elements)

## Core Color Values

| Element | Hex | RGB |
|---------|-----|-----|
| Background | #111C18 | rgb(17, 28, 24) |
| Text | #C1C497 | rgb(193, 196, 151) |
| Primary Accent | #2DD5B7 | rgb(45, 213, 183) |
| Highlight | #E5C736 | rgb(229, 199, 54) |
| Border | #214237 | rgb(33, 66, 55) |

## Theme Characteristics

**Osaka Jade** is a sophisticated dark theme featuring:
- Deep forest green foundation (#111C18)
- Warm sage text (#C1C497) for comfortable reading
- Jade/turquoise accents (#2DD5B7) for interactive elements
- Gold highlights (#E5C736) for important information
- Rose tones (#D2689C) for secondary accents
- Professional appearance suitable for development work

Perfect for:
- Development environments
- Terminal-based workflows
- Productivity applications
- Web design that values readability

## All Available Themes

The Omarchy repository includes 13 pre-configured themes:

Dark Themes:
1. osaka-jade (current)
2. catppuccin
3. everforest
4. tokyo-night
5. nord
6. kanagawa
7. gruvbox
8. ristretto
9. matte-black

Light Themes:
10. catppuccin-latte
11. rose-pine

See osaka-jade-theme-report.md for details on other themes.

## Source Information

- **Repository:** https://github.com/basecamp/omarchy
- **Theme Location:** `/themes/osaka-jade/`
- **License:** MIT (from Omarchy repository)
- **Documentation Generated:** October 16, 2025

## Files Included in Omarchy Theme

```
osaka-jade/
├── alacritty.toml      - Alacritty terminal configuration
├── btop.theme          - System monitor theme
├── chromium.theme      - Chromium browser theme
├── ghostty.conf        - Ghostty terminal configuration
├── hyprland.conf       - Hyprland window manager
├── hyprlock.conf       - Hyprland lock screen
├── icons.theme         - Icon theme reference
├── kitty.conf          - Kitty terminal configuration
├── mako.ini            - Notification daemon configuration
├── neovim.lua          - Neovim editor configuration
├── swayosd.css         - On-screen display styling
├── vscode.json         - VS Code editor settings
├── walker.css          - Launcher menu styling
├── waybar.css          - Status bar styling
├── preview.png         - Visual preview of theme
└── backgrounds/        - Background images (3 variants)
```

## Implementation Examples

### HTML with CSS Variables
```html
<div style="background: var(--color-bg-primary); color: var(--color-text-primary);">
  Your content here
</div>
```

### React/Vue Components
```javascript
const styles = {
  container: {
    backgroundColor: 'var(--color-bg-primary)',
    color: 'var(--color-text-primary)',
  },
  accent: {
    color: 'var(--color-accent-cyan)',
  }
}
```

### Tailwind Config Extension
```javascript
theme: {
  colors: {
    osaka: {
      bg: '#111c18',
      text: '#C1C497',
      accent: '#2DD5B7',
      // ... add more colors
    }
  }
}
```

## Support & Reference

For the original Omarchy documentation and installation:
- Visit: https://omarchy.org
- GitHub: https://github.com/basecamp/omarchy
- License: MIT

---

**Last Updated:** October 16, 2025
**Format:** Markdown + CSS + Text Reference
**Total Documentation:** 625 lines across 3 files
