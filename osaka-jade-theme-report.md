# Omarchy Theme Analysis Report

## Overview
Successfully identified and documented the **Osaka Jade** theme from the basecamp/omarchy GitHub repository along with other available themes.

**Repository:** https://github.com/basecamp/omarchy  
**Theme Location:** `/tmp/omarchy-repo/themes/osaka-jade/`

---

## Osaka Jade Theme - Complete Color Palette

The Osaka Jade theme is a dark, sophisticated color scheme with earthy and jade-inspired colors.

### Primary Colors

| Element | Hex Code | RGB Value |
|---------|----------|-----------|
| Background | #111C18 | rgb(17, 28, 24) |
| Foreground/Text | #C1C497 | rgb(193, 196, 151) |
| Cursor | #D7C995 | rgb(215, 201, 149) |
| Cursor Text | #000000 | rgb(0, 0, 0) |

### Terminal Colors - Normal (Standard)

| Color | Hex Code | Name |
|-------|----------|------|
| Black (0) | #23372B | Dark slate |
| Red (1) | #FF5345 | Bright red |
| Green (2) | #549E6A | Muted green |
| Yellow (3) | #459451 | Olive green |
| Blue (4) | #509475 | Teal blue |
| Magenta (5) | #D2689C | Dusty rose |
| Cyan (6) | #2DD5B7 | Bright cyan/turquoise |
| White (7) | #F6F5DD | Off-white cream |

### Terminal Colors - Bright (High Intensity)

| Color | Hex Code | Name |
|-------|----------|------|
| Bright Black (8) | #53685B | Gray-green |
| Bright Red (9) | #DB9F9C | Light rose |
| Bright Green (10) | #143614 | Dark forest green |
| Bright Yellow (11) | #E5C736 | Gold |
| Bright Blue (12) | #ACD4CF | Light cyan-blue |
| Bright Magenta (13) | #75BBB3 | Teal |
| Bright Cyan (14) | #8CD3CB | Light turquoise |
| Bright White (15) | #9EEBB3 | Light mint |

### UI Elements (btop/System Monitor)

| Element | Hex Code | Purpose |
|---------|----------|---------|
| Main Background | #111C18 | Application background |
| Main Foreground | #F7E8B2 | Primary text |
| Title Text | #D6D5BC | Box titles |
| Highlight (Hi FG) | #E67D64 | Keyboard shortcuts |
| Selected Background | #364538 | Selected item bg |
| Selected Foreground | #DEB266 | Selected item text |
| Inactive Text | #32473B | Disabled/inactive text |
| Graph Text | #E6D8BA | Text on graphs |

### Box & Border Colors (btop)

| Element | Hex Code |
|---------|----------|
| CPU Box Border | #81B8A8 |
| Memory Box Border | #81B8A8 |
| Network Box Border | #81B8A8 |
| Processes Box Border | #81B8A8 |
| Divider Lines | #81B8A8 |

### Graph Colors (btop)

**Temperature Graph:**
- Start: #BFD99A
- Mid: #E1B55E
- End: #DBB05C

**CPU Graph:**
- Start: #5F8C86
- Mid: #629C89
- End: #76AD98

**Memory/Disk Graphs (Free, Cached, Available, Used):**
- Start: #5F8C86
- Mid: #629C89
- End: #76AD98

**Download Graph:**
- Start: #75BBB3
- Mid: #61949A
- End: #215866

**Upload Graph:**
- Start: #215866
- Mid: #91C080
- End: #549E6A

**Process Box:**
- Start: #72CFA3
- Mid: #D0D494
- End: #DB9F9C

### Terminal Emulator Colors

#### Alacritty
```toml
background = #111C18
foreground = #C1C497
cursor = #D7C995
cursor_text_color = #000000
active_tab_background = #C1C497
inactive_tab_background = #111C18
```

#### Kitty
```
background = #111C18
foreground = #C1C497
cursor_color = #D7C995
cursor_text = #000000
selection_background = #C1C497
selection_foreground = #111C18
```

#### Ghostty
```
background = #111c18
foreground = #C1C497
cursor-color = #D7C995
cursor-text = #000000
```

### UI Component Colors

#### Walker (Menu/Launcher)
- Selected Text: #e1b55e
- Text: #ebfff2
- Base/Background: #11221C
- Border: #214237
- Foreground: #11221C

#### Waybar (Status Bar)
- Foreground: #e6d8ba
- Background: #11221C

#### Swayosd (On-screen Display)
- Background: #11221C
- Border: #589A5F
- Label/Progress: #C0C396

#### Mako (Notifications)
- Text Color: #C1C497
- Border Color: #214237
- Background Color: #11221C

#### Hyprland (Window Manager)
- Active Border: rgb(113, 202, 173) / #71CEAD

#### Hyprlock (Lock Screen)
- Color: rgb(7, 40, 32) / #072820
- Inner Color: rgb(7, 40, 32) / #072820
- Outer Color: rgb(167, 172, 132) / #A7AC84
- Font Color: rgb(167, 172, 132) / #A7AC84
- Check Color: rgb(131, 162, 152) / #83A298

---

## Available Themes in Omarchy

The repository contains 13 pre-configured themes:

1. **osaka-jade** - Dark theme with jade/earthy tones (dark mode)
2. **catppuccin** - Popular pastel color scheme (dark mode)
3. **catppuccin-latte** - Pastel colors (light mode)
4. **everforest** - Forest-inspired colors (dark mode)
5. **rose-pine** - Muted rose and pine tones (light mode)
6. **tokyo-night** - Tokyo-inspired night colors (dark mode)
7. **nord** - Arctic polar night blues (dark mode)
8. **kanagawa** - Japanese-inspired colors (dark mode)
9. **gruvbox** - Warm retro groove colors (dark mode)
10. **ristretto** - Espresso-inspired minimal theme (dark mode)
11. **matte-black** - Simple pure black theme (dark mode)

---

## Theme File Structure

Each theme directory contains configuration files for different applications:

```
/themes/osaka-jade/
├── alacritty.toml          # Alacritty terminal emulator
├── btop.theme              # System monitor (btop)
├── chromium.theme          # Chromium browser
├── ghostty.conf            # Ghostty terminal
├── hyprland.conf           # Hyprland window manager
├── hyprlock.conf           # Hyprland lock screen
├── icons.theme             # Icon theme
├── kitty.conf              # Kitty terminal emulator
├── mako.ini                # Notification daemon
├── neovim.lua              # Neovim editor
├── swayosd.css             # On-screen display styling
├── vscode.json             # VS Code settings
├── walker.css              # Launcher menu styling
├── waybar.css              # Status bar styling
├── preview.png             # Theme preview image
└── backgrounds/            # Background images
    ├── 1-osaka-jade-bg.jpg
    ├── 2-osaka-jade-bg.jpg
    └── 3-osaka-jade-bg.jpg
```

---

## Rose-Pine Theme Comparison

For reference, the Rose-Pine theme shows how other themes in Omarchy are structured:

### Rose-Pine Primary Colors
- Background: #faf4ed (light)
- Foreground: #575279 (dark text)
- Accent Rose: #ebbcba
- Accent Pine: #31748f
- Accent Foam: #9ccfd8
- Accent Iris: #c4a7e7
- Accent Gold: #f6c177
- Accent Love: #eb6f92

---

## Implementation Guide for januschka.com

### Recommended CSS Variables

Create a `:root` CSS configuration:

```css
:root {
    /* Osaka Jade Primary Colors */
    --bg-primary: #111c18;
    --text-primary: #C1C497;
    --text-secondary: #F7E8B2;
    --accent-cyan: #2DD5B7;
    --accent-rose: #D2689C;
    --accent-gold: #DEB266;
    
    /* Terminal Colors */
    --color-black: #23372B;
    --color-red: #FF5345;
    --color-green: #549E6A;
    --color-yellow: #459451;
    --color-blue: #509475;
    --color-cyan: #2DD5B7;
    --color-white: #F6F5DD;
    
    /* UI Elements */
    --border-color: #214237;
    --highlight-color: #71CEAD;
    --cursor-color: #D7C995;
}
```

### Color Harmony Analysis

The Osaka Jade theme demonstrates:
- **Primary Palette:** Deep forest greens (#111c18, #214237) and warm off-whites
- **Accent Strategy:** Uses cyan (#2DD5B7) as primary accent with rose (#D2689C) secondary
- **Contrast:** High contrast between dark backgrounds and light text
- **Visual Hierarchy:** Gold tones (#E5C736, #DEB266) for highlights and selected elements
- **Professional:** Suitable for development and productivity tools

---

## Files Located

All files are located in: `/tmp/omarchy-repo/themes/osaka-jade/`

Key color definition files:
- Alacritty colors: `alacritty.toml`
- Terminal colors: `kitty.conf`, `ghostty.conf`
- System UI: `btop.theme`, `mako.ini`, `waybar.css`
- Advanced colors: `hyprland.conf`, `hyprlock.conf`
- CSS-based UI: `walker.css`, `swayosd.css`

