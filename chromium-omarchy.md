---
title: "Refreshing Chrome Policies for Dynamic Omarchy Themes"
category: "Chromium"
tech: "C++"
---

*Using managed theme policies and an explicit refresh command to update a running browser.*

## Update: Policy Refresh Landed

### Using Managed Policies

The direct theme CLI approach was not accepted upstream. Discussion with Brave and Chromium reviewers pointed to a supported alternative: Chrome's managed policies can already set theme colors.

However, there was a catch: applying policies took 5+ seconds to take effect. This wasn't the instant response Omarchy users expected.

### Refreshing Without the Delay

The remaining gap was an explicit way to refresh policies in a running browser:
```sh
# Instantly refresh and apply platform policies
chromium --refresh-platform-policy
```

The flag asks a running Chrome instance to reload platform policies immediately instead of waiting for the normal refresh interval. It is general policy infrastructure rather than a theme-specific command.

### Implementation

Review with Chrome's policy team refined the command name and startup behavior. The final implementation (<span style="background: #10b981; color: white; padding: 2px 8px; border-radius: 12px; font-size: 11px; font-weight: bold;">MERGED</span> [**--refresh-platform-policy flag**](https://crrev.com/c/6900896)) adds:

```cpp
// chrome/common/chrome_switches.cc
const char kRefreshPlatformPolicy[] = "refresh-platform-policy";

// chrome/browser/ui/startup/startup_browser_creator.cc
// Trigger immediate policy refresh when Chrome is already running
if (command_line.HasSwitch(switches::kRefreshPlatformPolicy)) {
  g_browser_process->browser_policy_connector()->RefreshPlatformPolicies();
  // Return early to prevent opening a new browser window
  return;
}
```

The command reuses the existing browser policy connector and returns without opening another browser window.

### Chrome Release

The change landed for **Chrome 142**. It applies to managed policies generally, not only theme colors.

### Omarchy Integration

The downstream <span style="background: #10b981; color: white; padding: 2px 8px; border-radius: 12px; font-size: 11px; font-weight: bold;">MERGED</span> [**Omarchy theme integration**](https://github.com/basecamp/omarchy/pull/1251) combines the refresh flag with JSON policy updates:

```sh
# Set theme via managed policy (Linux example)
sudo mkdir -p /etc/chromium/policies/managed
echo '{
  "BrowserThemeColor": "#ff6b35"
}' | sudo tee /etc/chromium/policies/managed/theme.json

# Instantly apply to running Chrome instances
chromium --refresh-platform-policy --no-startup-window
```

For macOS users:
```sh
# Create policy directory
sudo mkdir -p /Library/Managed\ Preferences/com.google.Chrome

# Set theme color policy
sudo defaults write /Library/Managed\ Preferences/com.google.Chrome BrowserThemeColor -string "#ff6b35"

# Apply instantly
open -a "Google Chrome" --args --refresh-platform-policy --no-startup-window
```

Compared with the direct theme CLI, the policy approach:
1. reads configuration from the existing policy files;
2. bypasses the normal refresh interval;
3. lets Chrome's policy and theme systems apply the update;
4. works with existing managed deployments.

### Brave Integration

Brave cherry-picked the change for its Chrome 141-based release.

### Other Uses

The `--refresh-platform-policy` flag is not theme-specific. Managed deployments can use it to reload any platform policy without restarting the browser.

The theme use case therefore resulted in a general policy-refresh command.

---

## The Initial Request

The work started with [a request from DHH](https://x.com/hjanuschka/status/1954552977814855845): change Chrome's theme colors dynamically from the command line.

The context was important - when Chrome uses GTK/Qt themes, this already works automatically. But when using Chrome's "Classic" theme (which many prefer for consistency across platforms), there was no CLI way to control colors. While you could manually change themes through settings for each instance, Omarchy needed scriptable control - just like it has for other applications.

The proposed interface was:
```sh
# Change theme when using Chrome's Classic theme
chrome --set-user-color="255,0,0"
```

For [Omarchy](https://omarchy.org), the requirement was consistency with its other scriptable desktop theme integrations.

## Why Scriptable Theming Was Needed

The gap in Chrome's theming:
- **GTK/Qt themes**: Follow system theme updates automatically
- **Classic theme**: No CLI control, must use GUI per instance
- **Omarchy's need**: Scriptable theming like other apps have

The request highlighted the difference between Classic-theme configuration and the existing GTK/Qt integration.

## Existing Theme Infrastructure

Most of the required theme behavior already existed in Chromium. The direct CLI prototype connected that infrastructure to a new entry point.

## The Implementation

### Finding the Existing Code

Chrome's theme system already included the required primitives:
```cpp
// Theme colors are defined in the ThemeService
class ThemeService : public KeyedService {
  // Material Design 3 (GM3) color generation
  ui::ColorProviderManager::Key GetColorProviderKey();
  
  // This notifies observers when theme changes
  void NotifyThemeChanged();
};
```

The Material Design 3 (GM3) theming logic was all there - it just needed a CLI entry point.

### Adding Command-Line Support

The implementation added several switches that work together:
```cpp
// Core theme switches in chrome_switches.cc
const char kSetDefaultTheme[] = "set-default-theme";      // Reset to system
const char kSetUserColor[] = "set-user-color";            // GM3 seed color
const char kSetColorScheme[] = "set-color-scheme";        // light/dark/system
const char kSetColorVariant[] = "set-color-variant";      // Material variants
const char kSetGrayscaleTheme[] = "set-grayscale-theme";  // Grayscale overlay
```

The switches can be combined:
```sh
# Dark blue vibrant theme
chrome --set-user-color="100,150,200" \
       --set-color-scheme="dark" \
       --set-color-variant="vibrant"

# Light neutral theme with custom color
chrome --set-user-color="255,107,53" \
       --set-color-scheme="light" \
       --set-color-variant="neutral"

# System theme with grayscale
chrome --set-color-scheme="system" \
       --set-grayscale-theme="true"
```

### Leveraging Chrome's Theme System

The prototype reused:
- Material Design 3 (GM3) dynamic color generation
- ProcessSingleton IPC for notifying running instances
- ThemeService infrastructure for applying changes
- Support for all Material color variants

Combined with `--no-startup-window`, it could update a running instance without opening another window.

## Alternative: A GTK Theme Generator

A separate experiment generated GTK themes from Chrome's Material Design 3 colors: [material-gtk-generator](https://github.com/hjanuschka/material-gtk-generator).
```sh
# Generate a GTK theme from Chrome's GM3 colors
material-gtk-generator --seed-color="#FF6B6B" --output-dir=~/.themes/
```

If the Chromium CL did not land, Omarchy could generate a matching GTK theme, apply it system-wide, and let Chrome consume it through the existing Linux theme integration. The tool remains useful for matching other GTK applications to the same palette.

## The Omarchy Chromium Fork

While upstream review continued, Omarchy used dedicated build infrastructure to distribute the direct CLI prototype through [Omarchy Chromium](https://github.com/omacom-io/omarchy-chromium). [DHH's video](https://www.youtube.com/watch?v=ZEFYTdzYxQM) explains the downstream-fork approach.

### The Patch

The direct CLI prototype is contained in one CL (<span style="background: #6b7280; color: white; padding: 2px 8px; border-radius: 12px; font-size: 11px; font-weight: bold;">ABANDONED</span> [**Direct CLI approach**](https://crrev.com/c/6832165) - superseded by policy approach):
It connects the command-line switches to the existing theme service and can be rebased as a downstream patch.

## Real-World Usage

### For Omarchy Users

Omarchy's theme switcher writes the policy value and asks the running browser to refresh it alongside the other desktop theme updates.

### For Scripts

The CLI switches can be used for automation:
```sh
# Match browser to terminal theme (Classic theme only)
chromium --set-user-color="$(get-terminal-color-rgb)"

# Different themes for different workspaces with variants
workspace-1: chromium --set-user-color="26,26,26" \
                      --set-color-variant="neutral"
workspace-2: chromium --set-user-color="0,43,54" \
                      --set-color-variant="tonal_spot"

# Time-based theming with color schemes
if [[ $(date +%H) -gt 18 ]]; then
  chromium --set-color-scheme="dark" \
           --set-user-color="0,0,0"
else
  chromium --set-color-scheme="light" \
           --set-user-color="255,255,255"
fi

# Update running instances without opening new window
chromium --no-startup-window \
         --set-user-color="100,200,150" \
         --set-color-variant="expressive"
```

Note: This works specifically with Chrome's Classic theme. If you're using GTK/Qt themes, Chrome already responds to system theme changes automatically.

### Integration with Window Managers

Window managers can now theme browsers to match the desktop:
```python
# Example i3wm integration
import i3ipc
import subprocess

def on_workspace_focus(i3, event):
    workspace = event.current.name
    themes = {
        "1: term": ("0,0,0", "dark", "neutral"),
        "2: web": ("26,26,46", "dark", "tonal_spot"), 
        "3: code": ("15,52,96", "dark", "vibrant")
    }
    if workspace in themes:
        color, scheme, variant = themes[workspace]
        subprocess.run([
            "chromium",
            "--no-startup-window",
            f"--set-user-color={color}",
            f"--set-color-scheme={scheme}",
            f"--set-color-variant={variant}"
        ])

i3 = i3ipc.Connection()
i3.on("workspace::focus", on_workspace_focus)
i3.main()
```

## Current State

### Upstream Progress
The direct CLI approach (<span style="background: #6b7280; color: white; padding: 2px 8px; border-radius: 12px; font-size: 11px; font-weight: bold;">ABANDONED</span> [**CL 6832165**](https://crrev.com/c/6832165)) was superseded by the policy-based solution (<span style="background: #10b981; color: white; padding: 2px 8px; border-radius: 12px; font-size: 11px; font-weight: bold;">MERGED</span> [**CL 6900896**](https://crrev.com/c/6900896)), which landed in Chrome 142.

### Extended Features
The direct CLI prototype includes:
- **Material variants**: tonal_spot, neutral, vibrant, expressive
- **Color schemes**: light, dark, system
- **Grayscale mode**: For accessibility
- **No startup window**: Update running instances silently
- **GM3 color generation**: Full Material Design 3 palette from seed color

### Other Browsers
Brave has discussed downstream use of the direct CLI patch.

## Using the Downstream Build

### For Arch/Omarchy Users

The AUR package is available (replaces the standard Chromium):
```sh
yay -S omarchy-chromium-bin

# Teal expressive theme
chromium --set-user-color="78,205,196" \
         --set-color-variant="expressive"

# Reset to default
chromium --set-default-theme
```

---

*The upstream solution uses Chrome's existing policy system; the downstream fork retains the more direct theme CLI.*

**Links:**
- [Original Tweet](https://x.com/hjanuschka/status/1954552977814855845)
- <span style="background: #10b981; color: white; padding: 2px 8px; border-radius: 12px; font-size: 11px; font-weight: bold;">MERGED</span> [**Policy refresh flag**](https://crrev.com/c/6900896)
- <span style="background: #6b7280; color: white; padding: 2px 8px; border-radius: 12px; font-size: 11px; font-weight: bold;">ABANDONED</span> [**Direct CLI approach**](https://crrev.com/c/6832165)
- [Omarchy Chromium Fork](https://github.com/omacom-io/omarchy-chromium)
- [Material GTK Generator (Plan B)](https://github.com/hjanuschka/material-gtk-generator)
- [DHH's Video: Power of OSS - Idea to Fork](https://www.youtube.com/watch?v=ZEFYTdzYxQM)
- [Omarchy.org](https://omarchy.org)
- [DHH's Blog Post](https://world.hey.com/dhh/omarchy-micro-forks-chromium-1287486d)