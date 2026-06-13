    // Command Palette
    const palette = document.getElementById('commandPalette');
    const paletteInput = document.getElementById('commandInput');
    const paletteResults = document.getElementById('commandResults');
    let selectedIndex = 0;

    const commands = [
      { icon: '🏠', name: 'Go to Home', keywords: ['home', 'top', 'start'], action: () => window.location.href = '/' },
      { icon: '👤', name: 'Go to About', keywords: ['about', 'bio', 'me'], action: () => window.location.href = '/#about' },
      { icon: '💼', name: 'Go to Experience', keywords: ['experience', 'work', 'career'], action: () => window.location.href = '/#experience' },
      { icon: '🚀', name: 'Go to Projects', keywords: ['projects', 'code', 'github'], action: () => window.location.href = '/#projects' },
      { icon: '📝', name: 'Go to Blog', keywords: ['blog', 'posts', 'articles'], action: () => window.location.href = '/#blog' },
      { icon: '📧', name: 'Go to Contact', keywords: ['contact', 'email', 'reach'], action: () => window.location.href = '/#contact' },
      { icon: '📋', name: 'Copy Email', keywords: ['copy', 'email', 'clipboard'], action: () => { navigator.clipboard.writeText('helmut@januschka.com'); } },
      { icon: '🐙', name: 'Open GitHub', keywords: ['github', 'code', 'repos'], action: () => window.open('https://github.com/hjanuschka', '_blank') },
      { icon: '🐦', name: 'Open Twitter/X', keywords: ['twitter', 'x', 'social'], action: () => window.open('https://twitter.com/hjanuschka', '_blank') },
      { icon: '💼', name: 'Open LinkedIn', keywords: ['linkedin', 'professional'], action: () => window.open('https://linkedin.com/in/hjanuschka', '_blank') },
      { icon: '📄', name: 'Blog: Edge-to-Edge for Fullscreen PWAs', keywords: ['blog', 'edge', 'pwa', 'android', 'cutout', 'notch'], action: () => window.location.href = '/chromium-pwa-edge-to-edge.html' },
      { icon: '📄', name: 'Blog: Touch Drag-and-Drop on Linux', keywords: ['blog', 'touch', 'drag', 'drop', 'linux'], action: () => window.location.href = '/chromium-touch-drag-drop-linux.html' },
      { icon: '📄', name: 'Blog: Web Bluetooth Negotiated MTU', keywords: ['blog', 'bluetooth', 'mtu', 'gatt', 'ble'], action: () => window.location.href = '/chromium-webbluetooth-mtu.html' },
      { icon: '📄', name: 'Blog: Web Bluetooth Cancel Pending Connect', keywords: ['blog', 'bluetooth', 'cancel', 'connect', 'aosp', 'android'], action: () => window.location.href = '/chromium-webbluetooth-cancel-connect.html' },
      { icon: '📄', name: 'Blog: 2025 Chromium Wrap-Up', keywords: ['blog', '2025', 'chromium', 'owner', 'wrap'], action: () => window.location.href = '/2025-chromium-contributions.html' },
      { icon: '📄', name: 'Blog: JPEG XL Returns to Chrome', keywords: ['blog', 'jxl', 'jpeg', 'xl', 'rust'], action: () => window.location.href = '/chromium-jxl-resurrection.html' },
      { icon: '📄', name: 'Blog: Tab Focus Feature', keywords: ['blog', 'tab', 'focus', 'tobi'], action: () => window.location.href = '/chromium-focus-feature.html' },
      { icon: '📄', name: 'Blog: Dynamic Chrome Themes', keywords: ['blog', 'omarchy', 'theme', 'dhh'], action: () => window.location.href = '/chromium-omarchy.html' },
      { icon: '📄', name: 'Blog: Wayland Crash Debugging', keywords: ['blog', 'wayland', 'crash', 'debug'], action: () => window.location.href = '/chromium-wayland-crash.html' },
      { icon: '📄', name: 'Blog: Pi Coding Agent', keywords: ['blog', 'pi', 'agent', 'terminal', 'mario', 'badlogic'], action: () => window.location.href = '/pi-coding-agent.html' },
    ];

    function openPalette() {
      palette.classList.remove('hidden');
      paletteInput.value = '';
      selectedIndex = 0;
      renderResults(commands);
      setTimeout(() => paletteInput.focus(), 10);
    }

    function closePalette() {
      palette.classList.add('hidden');
      paletteInput.value = '';
    }

    function filterCommands(query) {
      if (!query) return commands;
      const q = query.toLowerCase();
      return commands.filter(cmd =>
        cmd.name.toLowerCase().includes(q) ||
        cmd.keywords.some(k => k.includes(q))
      );
    }

    function renderResults(results) {
      paletteResults.innerHTML = results.map((cmd, i) =>
        '<li class="command-result' + (i === selectedIndex ? ' selected' : '') + '" data-index="' + i + '">' +
          '<span class="icon">' + cmd.icon + '</span>' +
          '<span class="name">' + cmd.name + '</span>' +
        '</li>'
      ).join('');
    }

    function executeCommand(results) {
      if (results[selectedIndex]) {
        results[selectedIndex].action();
        closePalette();
      }
    }

    document.addEventListener('keydown', function(e) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        openPalette();
      }
      if (e.key === 'Escape' && !palette.classList.contains('hidden')) {
        closePalette();
      }
    });

    paletteInput.addEventListener('input', function() {
      const results = filterCommands(this.value);
      selectedIndex = 0;
      renderResults(results);
    });

    paletteInput.addEventListener('keydown', function(e) {
      const results = filterCommands(this.value);
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        selectedIndex = Math.min(selectedIndex + 1, results.length - 1);
        renderResults(results);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        selectedIndex = Math.max(selectedIndex - 1, 0);
        renderResults(results);
      } else if (e.key === 'Enter') {
        e.preventDefault();
        executeCommand(results);
      }
    });

    paletteResults.addEventListener('click', function(e) {
      const item = e.target.closest('.command-result');
      if (item) {
        selectedIndex = parseInt(item.dataset.index);
        executeCommand(filterCommands(paletteInput.value));
      }
    });

    palette.querySelector('.command-palette-backdrop').addEventListener('click', closePalette);
