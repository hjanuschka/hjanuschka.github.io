*How a single tweet led to a Chromium micro fork and a feature that changes how we think about browser theming*

## 🎉 Update: September 14, 2025 - MERGED & LANDED! A Better Way Through Managed Policies

### The Golden Nugget Discovery

Google initially rejected our CLI approach, but working closely with friends at Brave, a crucial insight emerged: **Chrome's managed policies could set theme colors!** This was a game-changer - policies are an officially supported Chrome feature used by enterprises worldwide.

However, there was a catch: applying policies took 5+ seconds to take effect. This wasn't the instant response Omarchy users expected.

### Making It Instant

I dug deeper into Chrome's policy system and discovered we could add a new flag:
```sh
# Instantly refresh and apply platform policies
chromium --refresh-platform-policy
```

This flag forces Chrome to immediately reload and apply managed policies without the usual delay. The implications go far beyond just theming - it enables instant policy updates for any managed Chrome setting!

### The Implementation Journey

After much discussion and collaboration with Chrome's policy team, we refined the approach. The flag name evolved through several iterations as we better understood the use cases. The final implementation (<span style="background: #10b981; color: white; padding: 2px 8px; border-radius: 12px; font-size: 11px; font-weight: bold;">MERGED</span> [**--refresh-platform-policy flag**](https://crrev.com/c/6900896)) adds:

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

The beauty of this implementation is its simplicity - just a few lines of code that unlock powerful functionality!

### Official Chrome Release

This change has landed and will be released in **Chrome Stable 142**! This means:
- Official support for instant policy updates
- No more waiting for policy refresh intervals
- Works with any managed policy, not just themes

### Omarchy's Lightning-Fast Integration

I quickly assembled <span style="background: #10b981; color: white; padding: 2px 8px; border-radius: 12px; font-size: 11px; font-weight: bold;">MERGED</span> [**Omarchy theme integration**](https://github.com/basecamp/omarchy/pull/1251) that integrates the new flag with JSON policy updates. Here's how it works in practice:

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

This approach is **even faster than our original CLI implementation** because:
1. Policies are read directly from disk (no IPC overhead)
2. The refresh flag bypasses all delays
3. Chrome's native policy system handles the theme application
4. Works with existing enterprise policy infrastructure

### Brave Ships It Early

Brave has cherry-picked this change and will ship it even faster with their release based on Chrome 141! This shows the power of open-source collaboration - features can reach users through multiple channels.

### The Bigger Picture

The `--refresh-platform-policy` flag opens up new possibilities beyond theming:
- Instant enterprise policy updates without browser restart
- Dynamic security policy adjustments
- Real-time configuration changes for managed deployments
- Scriptable policy management for power users

This is a perfect example of how solving one problem (theme switching) led to a more general solution that benefits the entire Chrome ecosystem.

---

## The Tweet That Started Everything

It began with [a challenge from DHH](https://x.com/hjanuschka/status/1954552977814855845) (David Heinemeier Hansson, creator of Ruby on Rails). He wanted something that seemed simple but revealed an interesting gap: the ability to change Chrome's theme colors dynamically from the command line.

The context was important - when Chrome uses GTK/Qt themes, this already works automatically. But when using Chrome's "Classic" theme (which many prefer for consistency across platforms), there was no CLI way to control colors. While you could manually change themes through settings for each instance, Omarchy needed scriptable control - just like it has for other applications.

His vision was clear:
```sh
# Change theme when using Chrome's Classic theme
chrome --set-user-color="255,0,0"
```

This wasn't just about aesthetics. For DHH's new [Omarchy Linux distribution](https://omarchy.org), this represented a core philosophy: giving power users complete control over their environment through simple, scriptable interfaces.

## Why This Matters

The gap in Chrome's theming:
- **GTK/Qt themes**: Work great, update automatically
- **Classic theme**: No CLI control, must use GUI per instance
- **Omarchy's need**: Scriptable theming like other apps have

DHH's request highlighted this inconsistency. Why shouldn't the Classic theme be as flexible as GTK/Qt integration?

## The Pleasant Surprise

The implementation turned out to be easier than expected - the code was already in Chromium! The theme system was robust and well-designed. It just wasn't exposed via command-line interface.

My task was essentially plumbing: connecting existing functionality to a new entry point.

## The Implementation

### Finding the Existing Code

Chrome's theme system was already sophisticated:
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

These switches can be combined for complete control:
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

The beauty was that Chrome already had:
- Material Design 3 (GM3) dynamic color generation
- ProcessSingleton IPC for notifying running instances
- ThemeService infrastructure for applying changes
- Support for all Material color variants

Combined with `--no-startup-window`, themes update without opening new windows!

## Plan B: The GTK Theme Generator

While working on the Chrome patch, I also explored an alternative approach: what if we could generate GTK themes using Chrome's Material Design 3 logic?

This led to [material-gtk-generator](https://github.com/hjanuschka/material-gtk-generator):
```sh
# Generate a GTK theme from Chrome's GM3 colors
material-gtk-generator --seed-color="#FF6B6B" --output-dir=~/.themes/
```

This was Plan B - if the Chromium CL didn't land, we could:
1. Generate GTK themes matching Chrome's GM3 palette
2. Apply them system-wide
3. Chrome would pick them up automatically

It's still useful for creating cohesive desktop themes!

## The Micro Fork: Getting It to Users Fast

DHH didn't want to wait for Google's review process. He made a decisive move: **invest in build infrastructure** to ship a micro fork immediately.

### What Happened

1. **DHH's Decision**: "Let's ship this NOW to Omarchy users"
2. **Build Infrastructure**: DHH funded dedicated build servers
3. **The Micro Fork**: [Omarchy Chromium](https://github.com/omacom-io/omarchy-chromium) was born
4. **Immediate Availability**: Users got the feature within days, not months

There's an excellent [YouTube video by DHH](https://www.youtube.com/watch?v=ZEFYTdzYxQM) about the power of open source - showing how we went from idea to fork at incredible speed.

### The Patch

The entire feature is contained in a single CL (<span style="background: #6b7280; color: white; padding: 2px 8px; border-radius: 12px; font-size: 11px; font-weight: bold;">ABANDONED</span> [**Direct CLI approach**](https://crrev.com/c/6832165) - superseded by policy approach):
- Minimal, focused changes
- Clean integration with existing code
- Easy to maintain and rebase
- No invasive modifications

## Real-World Usage

### For Omarchy Users

Omarchy users just use the built-in theme switcher - it all happens automatically in the background! The system handles the Chrome theming seamlessly alongside other applications.

### For Power Users and Scripters

The CLI switches enable powerful automation:
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

## What's Next?

### Upstream Progress
The direct CLI approach (<span style="background: #6b7280; color: white; padding: 2px 8px; border-radius: 12px; font-size: 11px; font-weight: bold;">ABANDONED</span> [**CL 6832165**](https://crrev.com/c/6832165)) was superseded by the policy-based solution (<span style="background: #10b981; color: white; padding: 2px 8px; border-radius: 12px; font-size: 11px; font-weight: bold;">MERGED</span> [**CL 6900896**](https://crrev.com/c/6900896)), which landed in Chrome 142.

### Extended Features
The complete feature set includes:
- **Material variants**: tonal_spot, neutral, vibrant, expressive
- **Color schemes**: light, dark, system
- **Grayscale mode**: For accessibility
- **No startup window**: Update running instances silently
- **GM3 color generation**: Full Material Design 3 palette from seed color

### Other Browsers
Brave has shown interest in downstream landing our patch.

## Try It Yourself

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

*Sometimes the best features are already there, waiting to be exposed. Thanks to DHH's vision and investment, Omarchy users don't have to wait.*

**Links:**
- [Original Tweet](https://x.com/hjanuschka/status/1954552977814855845)
- <span style="background: #10b981; color: white; padding: 2px 8px; border-radius: 12px; font-size: 11px; font-weight: bold;">MERGED</span> [**Policy refresh flag**](https://crrev.com/c/6900896)
- <span style="background: #6b7280; color: white; padding: 2px 8px; border-radius: 12px; font-size: 11px; font-weight: bold;">ABANDONED</span> [**Direct CLI approach**](https://crrev.com/c/6832165)
- [Omarchy Chromium Fork](https://github.com/omacom-io/omarchy-chromium)
- [Material GTK Generator (Plan B)](https://github.com/hjanuschka/material-gtk-generator)
- [DHH's Video: Power of OSS - Idea to Fork](https://www.youtube.com/watch?v=ZEFYTdzYxQM)
- [Omarchy.org](https://omarchy.org)
- [DHH's Blog Post](https://world.hey.com/dhh/omarchy-micro-forks-chromium-1287486d)