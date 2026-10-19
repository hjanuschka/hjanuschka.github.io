---
title: "Cloning a 300GB Chromium Checkout in 0.024 Seconds"
category: "Tools"
tech: "btrfs / Linux"
---

*How btrfs subvolumes turn Chromium checkout clones from an overnight job into a free operation*

## The Problem

A Chromium checkout is a monster: ~300GB, millions of small files, a `.git` directory
that has seen things. If you work on multiple things in parallel - a bisect here, an
experiment there, a risky rebase you want a safety net for - you eventually want a
second tree.

The naive options are all bad:

- `cp -a ~/chromium ~/chromium_2` - hours of copying, 300GB more disk gone
- a second `fetch chromium` - hours of network, plus sync time
- `git worktree` - works for the main repo, but Chromium is ~100 sub-repos glued
  together by `gclient`, with generated files and build state the worktree does not cover

On btrfs there is a better way, and once set up, clones are **instant and free**.

## Step 1: Reflink Copy (the gateway drug)

btrfs supports copy-on-write file clones via reflinks. The copy shares all data
blocks with the original - only metadata is written:

```bash
cp -a --reflink=always ~/chromium ~/chromium_2
```

For my 304GB tree this took about **2 minutes** (it is bound by inode creation, not
data), and **zero additional data blocks**. Disk usage barely moves. Files only
start taking real space when one side modifies them - classic copy-on-write.

That alone beats every other option. But we can do better.

## Step 2: Convert the Checkout to a Subvolume

Reflink copy still walks millions of inodes. A btrfs *snapshot* of a *subvolume* is
one metadata operation - but it only works on subvolumes, and your checkout is
probably a plain directory.

The one-time conversion (no root needed):

```bash
# 1. a new empty subvolume
btrfs subvolume create ~/chromium.subvol

# 2. reflink everything into it (the ~2 minute step, no data copied)
cp -a --reflink=always ~/chromium/. ~/chromium.subvol/

# 3. swap names
mv ~/chromium ~/chromium.old
mv ~/chromium.subvol ~/chromium

# 4. once a build confirms everything works, reclaim the old tree
rm -rf ~/chromium.old   # slow; run it overnight
```

Two caveats for step 2: make sure no build (`siso`/`ninja`) is writing to the tree
while it copies, and verify the result before deleting the old directory. In my
case: all 104 local branches, the checked-out branch and `git status` came through
intact.

Note that deleting `~/chromium.old` does **not** free 300GB - the data blocks are
shared with the new subvolume. It only frees the duplicate inode metadata. You
never had the data twice.

## Step 3: Instant Clones, Forever

With `~/chromium` as a subvolume, a full clone of the entire checkout is:

```bash
btrfs subvolume snapshot ~/chromium ~/chromium_2
```

On my machine:

```
real    0m0.024s
```

**24 milliseconds.** All 300GB, all branches, all build state, atomically, with no
additional disk usage. Deleting one is just as fast:

```bash
sudo btrfs subvolume delete ~/chromium_2
```

Compare that with `rm -rf` on a Chromium tree, which takes long enough that you
start it before leaving the office.

| Operation | Plain directory | Subvolume |
|-----------|----------------|-----------|
| Clone | hours (`cp`) / minutes (reflink) | **0.024s** |
| Delete clone | ~1 hour (`rm -rf`) | **instant** |
| Extra disk per clone | 0 (reflink) - 300GB (cp) | **0** |
| Atomic | no | **yes** |

Atomicity matters more than it sounds: a reflink `cp` walks the tree over minutes,
so a build writing concurrently gives you a torn copy. A snapshot is a single
point-in-time image.

## Caveats

A few things worth knowing:

- **Never defragment these trees.** `btrfs filesystem defragment` un-shares
  reflinked extents - your "free" clones suddenly cost real disk. If you run
  periodic defrag anywhere, exclude the checkout subvolumes.
- **Regenerate build state in clones.** Generated files (`out/Default`,
  `.gclient_entries`) can carry absolute paths pointing at the original tree. Run
  `gclient sync` and regenerate the build dir inside a clone before building there,
  so nothing accidentally writes into its sibling.
- **No ongoing maintenance.** Diverged blocks accumulate naturally as the trees
  drift apart; deleting a snapshot reclaims its exclusive extents automatically.
  There is nothing to shrink, rebalance or compact for this use case.
- **Snapshot deletion needs root** (or the `user_subvol_rm_allowed` mount option).
  Creating snapshots does not.

## The Workflow This Unlocks

Since clones are free, they stop being precious:

- **Before a risky rebase:** snapshot, rebase, and if it goes sideways, delete the
  tree instead of untangling it
- **Parallel bisects:** one tree builds while you work in another
- **A/B builds:** same revision, two `args.gn` configurations, zero sync time
- **"What did this look like before the refactor":** keep a snapshot around as a
  browsable reference

The 300GB checkout stops dictating how you work. That is the whole point.

## Thanks to

- The btrfs developers for making copy-on-write boring and reliable enough that
  the interesting part of this post is a `time` output.
