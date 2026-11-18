---
title: "The review in one sweep: from 58 seconds to 0.65"
summary: "Breadslicer checks every slice for islands, suction cups and other print failures. On a large hollow model that check took a minute and Fix all took fourteen. How we rebuilt it around one pass over the layers."
slug: review-in-one-sweep
date: 2026-11-05
kind: paper
tags: [review, islands, performance, method]
draft: false
---

Every time Breadslicer slices, it reviews the result before you print: parts that start in mid-air (islands), cavities that will act as suction cups against the film, hollows with no drain, things off the plate. The review is the last line between a sliced file and a failed print, so it has to be right. It also has to be fast, or people stop waiting for it.

In early November it was neither on large models. On a hollow worm sculpture of more than 2,000 layers, the review took **58 seconds** and used **8.9 GiB** of memory. *Fix all* on the same scene took **868 seconds**. And after Fix all, some islands it had just supported were still in the list.

## What was slow

We measured before touching anything. Three things stood out:

- **The plate was rasterised several times per review**, once for each kind of check, instead of once.
- **One check exploded after a cavity had been filled**: its working set grew about nineteen-fold, and its time with it.
- **The threads spent most of their time waiting on the Windows heap.** Profiling showed 64 % of samples inside the system allocator, with many threads asking for small blocks at once.

## One sweep over the layers

The new review walks the layers **once**, bottom to top, keeping for each layer only what the next one needs: which regions are lit, which of them touch the region below, which are held by a support. Every check reads that same walk. Nothing is rasterised twice.

For the allocator we switched the app and the command line to **mimalloc**, a small MIT-licensed allocator built for exactly this pattern. The sweep alone went from 3.3 s to 0.57 s with that change.

## What counts as an island

The rule we settled on is the one a person printing would give: **an island is a group of pixels with nothing cured under it, neither model nor support**. Size does not matter: a small island still prints a loose flake that sticks to the film.

To decide "held by a support", the review does not rasterise the support meshes. It asks the support engine for every support's path and contact points, including the small ones that run from model to model, and checks whether a tip ends under the island's first pixels. We checked that against the printed file: the two agree to within 4 pixels.

Two cases are not islands:

- **Specks that last fewer than three layers**, or walls one pixel wide, are erased. They would not survive printing anyway, and the printer file leaves them out too, so the review and the file agree.
- **A part that starts as a thin neck on top of a supported part.** A region born up to three layers earlier, held by a tip, whose pixels mostly continue into the next layer, follows the part below. Without this rule the review split a model's first few layers in two and reported an island that the support right under it was holding.

Decisions you make in the review, such as *Ignore* on a row, are saved in the project, matched by position within 1 mm and 10 layers, and forgotten if you move the model.

## Placing a tip is checking it

The old Fix all placed a tip at the centre of each island and hoped. Sometimes the support engine refused that exact spot and the tip landed beside the island; the island stayed in the list.

Now placing and checking are the same step. For each island the engine is offered a list of candidate points, and each candidate is judged by **the same function the review uses** to decide whether an island is held, without slicing again. A tip that would not hold the island is not kept. If no candidate works, the row says why: there is no path to the plate, or the island never gets as wide as the smallest tip.

That gives us an invariant we test on every change: **after Fix all, no island that received a tip is still listed.** The test runs the whole cycle (generate, slice, review, fix, slice again) on real scenes in five poses.

## Never fill a hollow

One rule came from printing rather than from measuring. The review can fill small sealed pockets that would otherwise trap uncured resin. It used to fill any suction cup it found, including the 121 cm³ cavity of that hollow worm. That would have silently undone the hollowing.

Now only a **sealed** pocket smaller than **1 ml** is ever filled. A suction cup or a cavity of 1 ml or more asks for drain holes instead, and a hollow made in Breadslicer is never filled at all.

## Results

All on our development PC, optimised build, the same worm scene:

| | Before | After |
|---|---|---|
| Review | 58 s | 0.65 s |
| Whole command, open to report | 62 s | 3.2 s |
| Peak memory | 8.9 GiB | 1.76 GiB |
| Fix all | 868 s | 3.0–3.3 s |
| Islands left after Fix all, supports regenerated in five poses | 6–8 per pose | 0 in all five |

*Fix all* now runs off the interface thread: on a scene with 43 findings the window used to freeze for 3.94 s and now stays responsive (29 ms), with a progress card and Cancel. One Ctrl+Z restores the supports, the slice, the list and the fills together.

## Limits

- The review looks at the slice, so it runs after slicing. A faster, incremental re-review after small edits is planned.
- "Held" means a tip ends under the island's first pixels. Whether that tip is strong enough for the peel force is a separate question, which the review does not answer yet.
