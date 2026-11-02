---
title: "Exact hollowing: the preview is the result"
summary: Why the cavity Breadslicer shows and the cavity it makes used to differ by millimetres, and the three changes that made them the same mesh.
date: 2026-11-02
draft: true
tags: [hollow, geometry, method]
---

## The rule

Hollowing a resin model saves resin and lowers the peel force on every layer. You choose a wall thickness, the slicer shows a translucent cavity inside the model, and you place drain holes so the resin can get out. The whole workflow rests on one promise: **the cavity on screen is the cavity that gets printed**. If it is not, a drain aimed at the visible cavity can end in solid resin, and a wall shown as 2 mm can print thinner.

In October 2026 Breadslicer did not keep that promise. This report describes how we measured the gap and the three changes that closed it.

## How the cavity is made

The model is placed in a grid of small cubes (voxels, 0.65 mm in the measurements below). For every cube we need the distance to the model's surface; the cavity is every point deeper than the wall thickness. Its boundary is then turned back into a triangle mesh.

Before the changes, two things went wrong:

1. **The distance was estimated, not measured.** It was propagated through the grid from the surface, which is fast but drifts. With a 2 mm wall the preview's median wall was 2.27–2.31 mm, and in the printed result some spots were much thinner: on a 1.5 M-triangle whale model 2.3 % of the wall was more than 0.1 mm thinner than asked, down to 1.27 mm.
2. **Preview and result were two calculations.** The preview drew the raw boundary; *Hollow* then smoothed the field and built a different mesh. On a 91 mm miniature the 95th percentile of the distance between the two surfaces was **8.92 mm**, with a maximum of 32 mm: whole channels shown as hollow came out solid.

## Step 1: measure the wall exactly

For every voxel within a band around the surface (the wall plus a few voxels), we now compute the true distance to the nearest triangle, using a bounding-volume hierarchy so each query only looks at a handful of triangles. The band is measured once per session and reused while you drag the wall slider.

With a 2 mm wall, the preview's median wall became **2.000 mm** on every test model, with the first percentile at or above **1.957 mm**, and nothing in the result thinner than the wall minus 0.1 mm. Because the old estimate erred on the thick side, the exact wall also hollows a little more: **4–8 % more resin saved**.

## Step 2: smoothing that can only add material

Smoothing the field rounds off the voxel steps, but it can also move the surface. We capped it: after smoothing, every voxel's value may only move towards *more* wall, by at most a quarter of a voxel (0.16 mm here), and a voxel that was cavity stays cavity. Preview and result now shared every voxel, and the 95th percentile of their difference on the 91 mm miniature fell from 8.92 mm to **0.18 mm**.

The measurement also showed something we did not expect: on exact distances, smoothing barely smooths. The raw surface was already as even as the smoothed one.

## Step 3: one cavity

So we removed the second calculation. The cavity is now the boundary of the exact field, built once per session; the preview shows it, and *Hollow* places that same mesh and cuts the drains against it. The difference between preview and result is **0.000 mm**: every triangle of the preview is in the result.

Building it once also exposed an old bug: the same edge of the grid was sometimes interpolated from opposite ends in two neighbouring cells, and rounding put the two points in different places, leaving hairline cracks the old code had to repair afterwards. Each edge is now always interpolated from the same end, and the cavity comes out closed without repair.

## Results

Wall 2 mm, voxel 0.65 mm, on a sphere, a rotated cube, a 91 mm miniature (1.9 M triangles) and a whale (1.5 M triangles):

| | At the start | After step 2 | After step 3 |
|---|---|---|---|
| Preview → result, largest distance | up to 32 mm (miniature) | 0.09–0.60 mm | **0.000 mm** |
| Median wall | 2.27–2.31 mm (preview) | 2.03–2.08 mm (result) | **1.999–2.002 mm** |
| Wall thinner than 1.9 mm | up to 2.3 % of the surface | none | **none** |
| Live preview, miniature | not measured | 300–325 ms | **182–190 ms** |
| Dragging the wall slider, miniature | not measured | 156–165 ms | **63–68 ms** |
| Hollow, miniature | not measured | 823–877 ms | **519–526 ms** |
| Peak memory, miniature | not measured | 396 MB | **380 MB** |

Two interleaved runs per figure, on our development machine (Ryzen 7 5800X, 32 GB). A test model with a thin fin shows the practical effect: before, the cavity ended 0.3 mm below where the preview drew it and a drain at the tip of the fin was refused; now both end at the same height and the drain goes through.

## Limits

- **The cavity is faceted at the voxel size.** We chose exactness over a smoother inner surface, which never prints anyway. The old "smooth the inner surface" option was removed.
- **Memory.** The grid is capped by memory (1 GiB), not by a fixed size. On a very large model the voxel grows to fit, and the summary says so.
- **Thin parts stay solid.** Where the model is thinner than twice the wall, there is no cavity to make, and none is shown.

*This report is a draft. Numbers come from our own measurements of development builds and will be updated when a public build ships.*
