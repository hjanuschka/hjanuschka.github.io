---
title: "Your Chromium Checkout Is Twice as Big as It Needs to Be"
category: "Tools"
tech: "Bash / Git"
---

*How gclient quietly doubles the size of your third_party object stores, and a 200-line script that undoes it*

**Status:** 🛠️ [hjanuschka/cl-shrink](https://github.com/hjanuschka/cl-shrink)

```snippet
<div style="border: 1px solid var(--accent); border-left: 4px solid var(--accent); border-radius: 8px; padding: 18px 22px; margin: 28px 0; background: var(--bg-secondary);">
  <div style="font-weight: bold; color: var(--accent); font-size: 13px; letter-spacing: 0.08em; margin-bottom: 10px;">TL;DR</div>
  <pre style="margin: 0 0 12px 0;"><code class="language-bash">cl-shrink ~/chromium</code></pre>
  <p style="margin: 0; color: var(--text-muted); font-size: 14px; line-height: 1.6;">
    Reclaims <strong>50-65%</strong> of the disk your Chromium <code>third_party</code> git repos
    are sitting on. <code>gclient sync</code> builds those object stores out of thin packs whose
    deltas are never recomputed, and <code>git gc</code> will not fix it -- only
    <code>git repack -f</code> does. Everything it removes is restored by <code>gclient sync</code>.
  </p>
</div>
```

## 99%

My disk hit 99% full. 2 TB, 33 GB left, and three Chromium checkouts wondering why I was upset.

The obvious suspects were innocent. `out/` directories are expected to be enormous, and I had already cleaned them. So I went looking for where the space actually was, and the answer turned out to be the one directory I had never thought to question: `.git`.

```
3 x <root>/src/.git            196.7 GB   (65 GB each -- the same repo, three times)
753 third_party dep repos      100.7 GB
                               ---------
total .git across 3 checkouts  297.4 GB
```

297 GB of git metadata. For reference, the working trees and build output in those same checkouts came to roughly 330 GB. Half my Chromium footprint was object storage.

The `src/.git` triplication is its own (fascinating, dangerous) story, more on that at the end. The interesting part is the 100 GB spread over 753 dependency repos, because that number should not exist.

## Thin packs, forever

A fresh `git clone` gets a pack file built by the server, which has the luxury of looking at the entire history at once and picking good delta bases for every object. The result is tightly compressed.

`gclient sync` does not clone. It runs incremental `git fetch` against repos you already have. Each fetch returns a **thin pack**: a small bundle of new objects, deltified against objects the server knows you already possess. Your client expands it into a standalone pack and writes it next to the others. Those deltas are never reconsidered. Nothing ever looks at the pack you got in May and the pack you got in September and asks whether objects in one would compress better against objects in the other.

Do that twice a week for six months and you get this:

| repo | pack files | `.git` |
|------|-----------|--------|
| `src/third_party/skia` | **50** | 1.01 GB |
| `src/third_party/tflite/src` | 16 | 1.57 GB |

Fifty pack files. Each internally fine, collectively redundant.

## git gc does not fix this

This was the part that surprised me. My first instinct was `git gc`, and it accomplished almost nothing:

```
$ git gc --prune=now
1.01 GB -> 0.90 GB   (-13%)
```

Thirteen percent, and all of it from pruning unreachable objects rather than better compression. `git gc` consolidates your fifty packs into one pack, but it **reuses the existing deltas** while doing it. That is a deliberate and usually correct optimization: recomputing delta chains is expensive, and for a normal repo the existing ones are fine. For a repo assembled entirely out of thin packs, the existing ones are the whole problem.

The flag that matters is `-f`:

```
$ git repack -a -d -f
1.01 GB -> 0.40 GB   (-61%)
```

`-f` throws away every existing delta and runs the delta search from scratch across all objects at once -- which is to say, it does locally what the server did when it built your original clone pack. Sixty-one percent, in four minutes.

Pushing the delta search window further helps a little more, at a price:

| step | skia `.git` | wall time |
|------|------------|-----------|
| untouched | 1.01 GB | - |
| `git gc --prune=now` | 0.90 GB (-13%) | 1 min |
| `git repack -a -d -f` | **0.40 GB (-61%)** | 4 min |
| `git repack -a -d -f --window=250 --depth=50` | 0.33 GB (-68%) | 9 min |

The default window gets you the overwhelming majority of the win for a quarter of the CPU. `--window=250` is there for when you have cores to burn overnight.

## The refs nobody asked for

While measuring, I counted refs. `tflite` carries **452 tags and 7,721 remote-tracking refs**. Chromium's own `src` carries **38,516 tags**, which between them hold 1.67 million objects (5.6% of the repo) reachable from nothing else -- release-branch cherry-picks that exist only because a tag points at them.

Every one of those refs is an anchor preventing objects from being pruned, and for a gclient dependency not one of them is load-bearing. `DEPS` pins every git dependency by SHA:

```bash
$ grep -oE "@[^'\"]+" DEPS | grep -vE "^@[0-9a-f]{40}$" | wc -l
0   # (after excluding CIPD packages, which aren't git)
```

So deleting `refs/tags` in a dependency repo is free. The pinned revision stays reachable through `origin/main` and `HEAD`, and in the pathological case where it does not, `gclient sync` re-fetches it. On `tflite` that is what turns -55% into a respectable number instead of a rounding error.

## cl-shrink

The recipe is three commands, so most of [cl-shrink](https://github.com/hjanuschka/cl-shrink) is the part that keeps you from hurting yourself:

```bash
cl-shrink --dry-run ~/chromium              # report, change nothing
cl-shrink ~/chromium ~/chromium_2           # shrink
cl-shrink -a ~/chromium                     # --window=250, 7% more for 4x the CPU
```

```
$ cl-shrink --dry-run ~/chromium
scanning for git repositories...
found 278 repositories

  chromium/src/third_party/skia                     1.03 GB  repack only (local commits)
  chromium/src/third_party/swiftshader              1.17 GB  repack+prune
  chromium/src/third_party/tflite/src               1.57 GB  repack+prune
  chromium/src/v8                                   1.55 GB  repack+prune
  SKIP  chromium/src                                needs 64 GB free, have 31 GB
  ...

175 repositories processed, 214 skipped, 0m elapsed
candidate .git total: 51.6 GB -- expect 50-65% reclaim (25-33 GB)
```

The guards that turned out to matter:

**It checks free space per repo.** `git repack` writes the complete new pack before unlinking the old one, so peak usage is roughly double the largest existing pack. Running out of disk mid-repack on the tool you reached for *because* you were out of disk would be a poor outcome. Repos that do not fit get skipped with the number printed.

**It never prunes a repo holding local work.** If `git log --branches --not --remotes` is non-empty, or there is a stash, the repo gets repacked but keeps all its tags and reflogs. `--include-local` opts out. My `src` has 314 CL branches on it; nothing in there is "recoverable by gclient sync".

**It refuses to start during a build.** `pgrep` for `gclient`, `autoninja`, `siso`. Repacking under a running build is not catastrophic but it is not polite either.

**It is resumable.** A stamp file per repo, compared against pack mtimes, so a re-run skips anything that has not been fetched since. At 4 minutes per GB a full three-checkout pass runs for hours, and you will want to interrupt it.

Measured expectation across my three checkouts: **50-65 GB reclaimed** from 98.5 GB of candidate dependency repos.

## The 65 GB elephant

Which leaves `src/.git` itself. 65 GB each, and the first version of the tool refused to touch them:

```
SKIP  chromium/src   needs 64 GB free, have 31 GB
```

This is the catch-22 of the whole exercise. `git repack -a` has to write out a complete replacement for every pack before it may unlink the originals, so peak usage includes a second copy of the largest one. For a 63 GB clone pack that means 63 GB of headroom -- precisely what you do not have at the moment you go looking for disk space.

Giving up there bothered me, because `src` is where the growth actually happens. Look at the pack layout of a six-month-old checkout:

```
63857 MB  pack-bcaac772...pack     <- the original clone, from the server
  937 MB  pack-483be575...pack     <- everything below here is gclient sync
  218 MB  pack-2563e89d...pack
  185 MB  pack-1d1a58c0...pack
  166 MB  pack-eb1791b6...pack
  ... 24 more ...
29 packs
```

One big well-built pack from Google's servers, and 28 thin packs accreted one `gclient sync` at a time. The 63 GB is not the problem -- it is already well deltified and it is not growing. The 2.8 GB tail is the problem, and it will keep growing forever.

And git has a mode for exactly that shape: `git repack --geometric=2 -d` maintains the packs in a geometric progression, which in practice means it rolls up the small ones and leaves the giant one alone. Peak disk usage is the size of the rolled-up set -- a couple of GB, not 63.

```
BEFORE: 68049 MB, packs=29
$ git repack --geometric=2 -d      1m38s
AFTER:  66579 MB, packs=4         -1469 MB
```

1.5 GB and 29 packs down to 4, in 98 seconds, on a checkout where the "proper" repack needs 20x more free space than exists. So `--top-level` opts into the solution repos and picks whichever it can afford:

```bash
cl-shrink ~/chromium                # skip chromium/src -- solution repo (--top-level to include)
cl-shrink --top-level ~/chromium    # full repack if headroom allows, geometric if not
```

Two details that made it work rather than merely run. First, solution repos are processed **last**, after the dependency pass -- the 25+ GB that pass frees is often exactly what lets `src` clear the headroom check in the same invocation. Second, they always count as holding local work, so they are repacked but never pruned. My `src` has 133 branches and 38,897 tags on it; after a geometric pass, all 133 and all 38,897 are still there and `git fsck` is clean.

## The thing I did not automate

There is a bigger win sitting right there, and I left it alone on purpose.

Three checkouts storing three independent copies of the same 1.9-million-commit history is 130 GB of pure duplication. Git has a mechanism for this -- `objects/info/alternates`, which lets one repository borrow another's object store. 196.7 GB becomes about 66 GB. No compression tricks, no CPU, just not storing the same bytes three times.

It is also a loaded gun. A `gc` in the donor repository will cheerfully delete objects that only the borrowers reference, and the borrowers find out by becoming corrupt. gclient has no idea the arrangement exists and will not warn you. It is a genuinely good trick, and I may still do it by hand, but it does not belong behind a one-word command that also advertises itself as safe.

## Install

```bash
curl -fsSL https://raw.githubusercontent.com/hjanuschka/cl-shrink/main/cl-shrink \
  -o ~/.local/bin/cl-shrink && chmod +x ~/.local/bin/cl-shrink
```

Bash 4+ and git 2.20+, nothing else. Everything it removes is restored by `gclient sync`.
