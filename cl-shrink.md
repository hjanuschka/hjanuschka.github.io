---
title: "Your Chromium Checkout Is Twice as Big as It Needs to Be"
category: "Tools"
tech: "Bash / Git"
---

*How gclient quietly doubles the size of your third_party object stores, and a 150-line script that undoes it*

**Status:** 🛠️ [hjanuschka/cl-shrink](https://github.com/hjanuschka/cl-shrink)

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

Measured expectation across my three checkouts: **50-65 GB reclaimed** from 98.5 GB of candidate repos.

## The 65 GB elephant

Which leaves `src/.git`. 65 GB each, and `cl-shrink` skips all three with:

```
SKIP  chromium/src   needs 64 GB free, have 31 GB
```

This is the catch-22 of the whole exercise: repacking a 63 GB pack needs ~63 GB of headroom, which is precisely what you do not have at the moment you care. The dependency pass frees enough to then come back and do them one at a time, which is the intended order of operations.

But the honest observation is that repacking `src` is not the real win available here. Three checkouts storing three independent copies of the same 1.9-million-commit history is 130 GB of pure duplication, and git has a mechanism for exactly this -- `objects/info/alternates`, which lets one repo borrow another's object store. 196.7 GB becomes about 66 GB.

I left it out of the tool, deliberately. A `gc` in the donor repository will happily delete objects that only the borrowers reference, and the borrowers find out by becoming corrupt. gclient has no idea the arrangement exists. It is a genuinely good trick and I may still do it by hand, but it does not belong behind a one-word command that also claims to be safe.

## Install

```bash
curl -fsSL https://raw.githubusercontent.com/hjanuschka/cl-shrink/main/cl-shrink \
  -o ~/.local/bin/cl-shrink && chmod +x ~/.local/bin/cl-shrink
```

Bash 4+ and git 2.20+, nothing else. Everything it removes is restored by `gclient sync`.
