---
title: "Franken-RBE: Windows Chromium with Linux RBE via WSL2"
category: "Chromium"
tech: "C++ / Build Systems"
---

*It's alive! Stitching together WSL2, Linux RBE, and Windows SDK to build Chrome faster than nature intended.*

**Status:** 🛠️ Guide

---

External RBE for Windows is not a thing. But don't panic -- as long as you have a towel, you can make your way.

Setup takes about 1-3 hours depending on your machine and internet speed. I did this on a cheap $300 mini PC (16GB RAM, Ryzen 5, 2TB SSD). Or just give the [pi.dev](https://pi.dev) agent the link to this blog post and let it do the work for you.

Chromium on Windows is a monster build. If you have **Linux RBE** access but no Windows RBE, you can still build Windows Chrome fast: use **WSL2 as the Linux host** and cross-compile `target_os="win"`.

The end result:

- Windows machine
- WSL2 Ubuntu checkout on ext4
- Linux-hosted Windows cross-build: `~/chromium/src/out/Win-Cross`
- SISO/RBE running against the Linux RBE instance
- `mini_installer.exe` producing a normal Windows Chromium install
- FIDO/Gerrit ReAuth working by SSHing into WSL2 from a machine that can see the security key

Official references:

- [Windows build prerequisites](https://chromium.googlesource.com/chromium/src/+/HEAD/docs/windows_build_instructions.md)
- [Windows cross-builds](https://chromium.googlesource.com/chromium/src/+/lkgr/docs/win_cross.md)
- [Linux build / RBE notes](https://chromium.googlesource.com/chromium/src/+/main/docs/linux/build_instructions.md)
- [Gerrit ReAuth](https://chromium.googlesource.com/chromium/src.git/+/HEAD/docs/gerrit_reauth.md)

Replace `<user>`, `<host>`, `<wsl-ip>`, and paths as needed.

---

```snippet
<div style="margin: 30px 0; padding: 20px; background: rgba(139, 92, 246, 0.08); border: 1px solid rgba(139, 92, 246, 0.3); border-radius: 12px;">
  <h3 style="margin: 0 0 15px 0; color: #a78bfa; font-size: 1.1em;">📑 Table of Contents</h3>
  <ol style="margin: 0; padding-left: 20px; line-height: 1.8;">
    <li><a href="#1-start-with-a-normal-windows-chromium-setup" style="color: #c4b5fd; text-decoration: none;">Start with a normal Windows Chromium setup</a></li>
    <li><a href="#2-install-wsl2-and-give-it-enough-memory" style="color: #c4b5fd; text-decoration: none;">Install WSL2 and give it enough memory</a></li>
    <li><a href="#3-create-the-linux-checkout-on-wsl-ext4" style="color: #c4b5fd; text-decoration: none;">Create the Linux checkout on WSL ext4</a></li>
    <li><a href="#4-package-the-windows-sdktoolchain-for-linux" style="color: #c4b5fd; text-decoration: none;">Package the Windows SDK/toolchain for Linux</a></li>
    <li><a href="#5-the-windows-sdk-mount-ciopfs" style="color: #c4b5fd; text-decoration: none;">The Windows SDK mount: ciopfs</a></li>
    <li><a href="#6-generate-outwin-cross" style="color: #c4b5fd; text-decoration: none;">Generate out/Win-Cross</a></li>
    <li><a href="#7-rbe-auth-for-external-contributors" style="color: #c4b5fd; text-decoration: none;">RBE auth for external contributors</a></li>
    <li><a href="#8-ssh-into-wsl2-for-fido-reauth" style="color: #c4b5fd; text-decoration: none;">SSH into WSL2 for FIDO ReAuth</a></li>
    <li><a href="#9-install-and-run-the-windows-build" style="color: #c4b5fd; text-decoration: none;">Install and run the Windows build</a></li>
  </ol>
  <p style="margin: 15px 0 0 0; padding-top: 10px; border-top: 1px solid rgba(139, 92, 246, 0.2); font-size: 0.9em;">
    <a href="#the-workflow" style="color: #a78bfa; text-decoration: none;">→ The Workflow (TL;DR)</a>
  </p>
</div>
```

---

## 1. Start with a normal Windows Chromium setup

Do this first. Follow the [official Windows build instructions](https://chromium.googlesource.com/chromium/src/+/HEAD/docs/windows_build_instructions.md) and get a regular Windows checkout/build working before adding WSL2:

```text
C:\src\chromium\src
C:\src\chromium\src\out\Default
```

You need:

- Visual Studio with **Desktop development with C++**
- Windows 10/11 SDK + Debugging Tools for Windows
- Windows `depot_tools`
- `DEPOT_TOOLS_WIN_TOOLCHAIN=0`
- a known-good native Windows Chromium build

Why? Because the cross-build reuses your real locally-installed **Visual Studio + Windows SDK**. Later we package that toolchain and feed it to Linux.

Keep this checkout separate. The WSL cross-build gets its own checkout and does not touch `out\Default`.

---

## 2. Install WSL2 and give it enough memory

Install WSL2 from elevated PowerShell:

```powershell
wsl --install --no-distribution
```

Reboot, then install Ubuntu:

```powershell
wsl --install -d Ubuntu-24.04 --no-launch
```

Chromium will OOM with WSL defaults on smaller machines. I run this on a $300 mini PC because RAM is expensive these dAIs. Create `C:\Users\<user>\.wslconfig`:

```ini
[wsl2]
memory=9GB
swap=48GB
swapFile=C:\\Users\\<user>\\wsl-swap.vhdx
processors=6

[experimental]
autoMemoryReclaim=gradual
sparseVhd=true
```

Apply it:

```powershell
wsl --shutdown
```

The big swap file is intentional. SSD is cheaper than RAM, and it is much better for a compile to slow down than for the OOM killer to murder `clang` halfway through the build.

---

## 3. Create the Linux checkout on WSL ext4

Do **not** build under `/mnt/c`. It works, but it is painfully slow. Put the checkout in WSL's Linux filesystem:

```bash
sudo apt update
sudo apt install -y git python3 python-is-python3 curl lsb-release \
  build-essential file ca-certificates

cd ~
git clone https://chromium.googlesource.com/chromium/tools/depot_tools.git
echo 'export PATH="$HOME/depot_tools:$PATH"' >> ~/.bashrc
echo 'export PATH="$HOME/depot_tools:$PATH"' >> ~/.zshrc
source ~/.bashrc

mkdir -p ~/chromium
cd ~/chromium
gclient config --name=src https://chromium.googlesource.com/chromium/src.git
```

Edit `~/chromium/.gclient`:

```python
solutions = [
  { "name"        : "src",
    "url"         : "https://chromium.googlesource.com/chromium/src.git",
    "deps_file"   : "DEPS",
    "managed"     : True,
    "custom_deps" : {},
    "custom_vars" : {
      "rbe_instance": "projects/rbe-chromium-untrusted/instances/default_instance",
    },
  },
]
target_os = ["win"]
```

Two important lines:

- `target_os = ["win"]` downloads Windows cross-build deps.
- `rbe_instance` points to the Chromium external RBE instance for SISO/reclient.

Now sync:

```bash
cd ~/chromium
gclient sync --nohooks --no-history
```

Then install Linux build deps:

```bash
cd ~/chromium/src
./build/install-build-deps.sh --no-prompt --no-chromeos-fonts --no-arm --no-syms
```

---

## 4. Package the Windows SDK/toolchain for Linux

On Windows, package the installed Visual Studio + Windows SDK:

```bash
# Git Bash on Windows
mkdir -p /c/src/chromium/win_toolchain_pkg
cd /c/src/chromium/win_toolchain_pkg

python /c/src/chromium/src/third_party/depot_tools/win_toolchain/package_from_installed.py \
  2022 -w 10.0.26100.0 --noarm --allow_multiple_vs_installs
```

This creates a zip named like `<zip_hash>.zip`.

In WSL, tell depot_tools where to find it. Add these to `~/.bashrc`, `~/.bash_profile`, and `~/.zshrc`:

```bash
export PATH="$HOME/depot_tools:$PATH"
export DEPOT_TOOLS_WIN_TOOLCHAIN_BASE_URL=/mnt/c/src/chromium/win_toolchain_pkg
export GYP_MSVS_HASH_<wanted_hash>=<zip_hash>
export GCLIENT_SUPPRESS_GIT_VERSION_WARNING=1
```

`<wanted_hash>` is printed by Chromium's `vs_toolchain.py` when it asks for a specific toolchain. `<zip_hash>` is the zip filename you just generated.

Run hooks:

```bash
cd ~/chromium
gclient runhooks
```

---

## 5. The Windows SDK mount: ciopfs

The Windows SDK contains filenames that conflict on a case-sensitive Linux filesystem. Chromium solves that with a **ciopfs FUSE mount**:

```text
real data:    ~/chromium/src/third_party/depot_tools/win_toolchain/vs_files.ciopfs
mount point:  ~/chromium/src/third_party/depot_tools/win_toolchain/vs_files
```

If this mount disappears, GN fails with something like:

```text
FileNotFoundError: .../Windows Kits/10/bin/SetEnv.x86.json
```

Manual remount:

```bash
~/chromium/src/build/ciopfs -o use_ino \
  ~/chromium/src/third_party/depot_tools/win_toolchain/vs_files.ciopfs \
  ~/chromium/src/third_party/depot_tools/win_toolchain/vs_files
```

Make it automatic. Create `/usr/local/sbin/mount-winsdk.sh`:

```bash
#!/bin/bash
M=/home/<user>/chromium/src/third_party/depot_tools/win_toolchain/vs_files
B=/home/<user>/chromium/src/third_party/depot_tools/win_toolchain/vs_files.ciopfs
C=/home/<user>/chromium/src/build/ciopfs

if [ -d "$B" ] && ! mountpoint -q "$M"; then
  mkdir -p "$M"
  chown <user>:<user> "$M"
  su <user> -c "$C -o use_ino \"$B\" \"$M\""
fi
```

Enable it in `/etc/wsl.conf`:

```ini
[user]
default=<user>

[boot]
command=/usr/local/sbin/mount-winsdk.sh
```

Verify as the normal WSL user, not root:

```bash
mountpoint ~/chromium/src/third_party/depot_tools/win_toolchain/vs_files
```

If root sees `Permission denied`, that usually means the user-owned FUSE mount is actually active.

---

## 6. Generate `out/Win-Cross`

This is the working `args.gn` shape:

```bash
cd ~/chromium/src

gn gen out/Win-Cross --args='
target_os="win"
target_cpu="x64"
is_debug=false
is_component_build=false
symbol_level=1
use_lld=true
is_clang=true

use_siso=true
use_remoteexec=true
'
```

With those two last lines, Chromium uses SISO with the generated RBE config. The generated config points at:

```text
projects/rbe-chromium-untrusted/instances/default_instance
```

A build starts with a line like:

```text
use RBE instance "projects/rbe-chromium-untrusted/instances/default_instance"
```

Build the installer:

```bash
autoninja -C out/Win-Cross -j 6 mini_installer
```

Use a modest `-j`; WSL still has limited RAM even with swap. But this setup is mainly for **Linux RBE-backed cross-builds**. If you want a fully local Windows build, do that in the normal native Windows checkout (`C:\src\chromium\src`), not in WSL2.

---

## 7. RBE auth for external contributors

For external RBE access, Chromium uses Google Cloud application-default credentials for SISO/reclient:

```bash
gcloud auth application-default login
```

That is only the RBE/build credential. Gerrit upload/review actions also need **ReAuth** with a physical security key.

Note: ReAuth is only needed when you interact with Gerrit - e.g. `git cl upload` or `git cl patch XXXX --force` to pull down a CL. You could also just download and apply diffs manually from the Gerrit web UI if you want to skip this section entirely.

Inside WSL2 the key often is not visible, especially over RDP. The practical solution is: expose SSH into WSL2, then SSH in from a machine/session that can use the FIDO key.

---

## 8. SSH into WSL2 for FIDO ReAuth

```snippet
<div style="text-align: center; margin: 20px 0; padding: 20px; background: rgba(239, 68, 68, 0.1); border: 2px solid #ef4444; border-radius: 12px;">
  <h3 style="color: #ef4444; margin: 0 0 10px 0;">⚠️ Security Warning</h3>
  <p style="margin: 0;">Exposing SSH is dangerous. Read this section carefully. Consider using key-only authentication and turning off SSH when not in use.</p>
</div>
```

Install and start SSH in WSL:

```bash
sudo apt install -y openssh-server
sudo tee /etc/ssh/sshd_config.d/99-wsl.conf >/dev/null <<'EOF'
Port 2222
PasswordAuthentication yes
PubkeyAuthentication yes
AllowTcpForwarding yes
GatewayPorts yes
EOF
sudo ssh-keygen -A
sudo service ssh restart
```

Add your public key:

```bash
mkdir -p ~/.ssh && chmod 700 ~/.ssh
curl -fsSL https://github.com/<github-user>.keys >> ~/.ssh/authorized_keys
chmod 600 ~/.ssh/authorized_keys
```

Expose WSL2 through the Windows host. Elevated PowerShell:

```powershell
$ip = (wsl -d Ubuntu-24.04 hostname -I).Trim().Split()[0]
netsh interface portproxy delete v4tov4 listenport=2222 listenaddress=0.0.0.0
netsh interface portproxy add v4tov4 listenport=2222 listenaddress=0.0.0.0 connectport=2222 connectaddress=$ip
New-NetFirewallRule -DisplayName WSL-SSH-2222 -Direction Inbound -Action Allow -Protocol TCP -LocalPort 2222
```

From a machine with your FIDO key (e.g. your Mac), connect using `luci-auth-ssh-helper`:

```bash
luci-auth-ssh-helper -ssh -port=2222 <user>@<windows-host-or-ip>
```

Once inside WSL, ReAuth just works and RBE builds stop hanging on authentication.

---

## 9. Install and run the Windows build

Do not run `chrome.exe` directly from `\\wsl$`. Windows side-by-side assembly activation does not like the WSL network filesystem. Build and run through `mini_installer.exe` instead.

I keep the Windows helper scripts in a small repo so they are not copy-pasted into every write-up:

> [github.com/hjanuschka/wsl-rbe](https://github.com/hjanuschka/wsl-rbe)

After building:

```bash
autoninja -C out/Win-Cross -j 6 mini_installer
```

Clone or download the helpers on Windows and run:

```cmd
cd wsl-rbe\scripts
set WSL_USER=<your-wsl-user>
install-and-run-winx-chrome.bat --enable-features=WebBluetooth,NewBLEGattSessionHandling
```

The important script is `install-and-run-winx-chrome.bat`. It:

1. Closes any already-running instance of the installed Chromium build
2. Copies `mini_installer.exe` from the WSL output directory
3. Installs Chromium into `%LOCALAPPDATA%\Chromium\Application`
4. Launches the installed `chrome.exe` in the foreground with console logging
5. Forwards any flags you pass

There is also `launch-winx-chrome.bat` for re-running the already-installed build with different flags, without reinstalling.

Useful environment overrides:

```cmd
set WSL_DISTRO=Ubuntu-24.04
set WSL_USER=<your-wsl-user>
set WSL_CHROMIUM_SRC=chromium\src
set WINX_PROFILE=C:\tmp\winxprofile
```

---

## The Workflow

```bash
# WSL2
git credential-luci reauth        # if needed
autoninja -C out/Win-Cross -j 6 mini_installer
```

```cmd
:: Windows
install-and-run-winx-chrome.bat --your-flags-here
```

That is the loop: Linux RBE does the build, WSL2 emits a Windows installer, Windows installs and runs it.

🐧 builds it. 🪟 runs it.

---

## Links

- [Helper scripts: wsl-rbe](https://github.com/hjanuschka/wsl-rbe)
- [Windows build prerequisites](https://chromium.googlesource.com/chromium/src/+/HEAD/docs/windows_build_instructions.md)
- [Windows cross-builds](https://chromium.googlesource.com/chromium/src/+/lkgr/docs/win_cross.md)
- [Linux build / RBE notes](https://chromium.googlesource.com/chromium/src/+/main/docs/linux/build_instructions.md)
- [Gerrit ReAuth](https://chromium.googlesource.com/chromium/src.git/+/HEAD/docs/gerrit_reauth.md)
