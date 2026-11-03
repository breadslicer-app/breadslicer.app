---
title: Mesh repair that makes broken models printable
summary: How Repair turns models a slicer cannot cut into models that slice, what it refuses to do, and how we measure it on 170 meshes.
date: 2026-11-02
draft: false
tags: [repair, geometry, method]
---

## The problem

A slicer cuts a model into layers by intersecting it with horizontal planes and filling what is inside. That only works if "inside" is well defined: every edge of the surface must be shared by exactly two faces, facing consistently, with no gaps. Many models people download are not like that. They come with cracks a few microns wide, faces stacked twice, separate parts that touch along a single edge, holes, or pieces turned inside out. They look fine on screen and cannot be sliced.

Until late October 2026, Breadslicer's **Repair** button changed many of these meshes but left **none** of the broken ones in our test set sliceable. This report describes the repair that replaced it, how we decide that a repair worked, and where it stops.

## What "repaired" means

We use one test, the same one the slicer runs before cutting: a mesh is **sliceable** when every vertex is a finite number, every face is valid, and every edge has exactly two faces. Since 2026-10-31 the slicer also accepts two closed solids that touch along an edge, separating them itself in a private copy, so some models in the set slice without any repair at all.

A repair **counts** only if the mesh was not sliceable when opened and is sliceable afterwards, **and stays sliceable after being saved as STL and opened again**. STL stores loose triangles, not which vertex is which, so a repair that relies on two vertices at the same spot being different would be undone by saving. We also count the opposite: a mesh that was sliceable before and is not after Repair is a failure, whatever else improved.

## The test set

- **18 synthetic meshes**, generated in code with a fixed random seed so the set is the same on every machine: a clean sphere, holes of different sizes, patches of flipped faces, an inside-out shell, cubes sharing an edge or a face, duplicated faces, a fin on an edge, cracks of 1 µm and 50 µm, overlapping spheres, loose specks, and two hollow models with a correct and an inverted cavity. 12 of them cannot be sliced as they are.
- **127 real files**, 152 non-empty meshes: sculpted miniatures and their separate parts, pre-supported miniatures (some hollow), terrain, CAD parts, models already "repaired" by other tools and their originals, multi-part 3MF projects, and a public resin test model. The files belong to their authors and are not published; the list and the results are kept with the project.

The measurement runs as a test in an optimised build, applies Repair exactly as the button does, then saves each result as STL, reopens it and checks it again.

## How Repair works

Repair runs a short series of steps. Each one is **judged**: we keep a copy, run the step, measure the number of bad edges before and after, and keep the result only if it went down. Up to three rounds; if the end result is not better, the original is returned untouched.

1. **Duplicate faces.** A face that appears twice with the same orientation loses one copy, never both.
2. **Weld cracks.** Boundary vertices closer than 0.005 mm are joined. That is half a pixel of the finest printer we support (10.5 µm): anything closer could never show up in a layer.
3. **Separate parts that touch.** Where three or more faces share an edge, faces are paired around the edge by angle and each pair gets its own copy of the vertices, so the parts become separate closed solids.
4. **Orient.** Each connected piece is made consistent as a whole, then turned the right way out by its volume, except cavities, which must face inwards.
5. **Close holes.** Holes up to 200 edges are filled with the smallest-area surface; larger ones with a fan. A hole bigger than **30 %** of the model's area is left open and reported: at that size we would be inventing the model, not repairing it.
6. **Survive STL.** Vertices that ended up at the same spot as another are moved 0.001 mm towards their own faces, so saving as STL cannot weld them back.

Two more guards protect the model: a round that loses more than half of a piece, or reduces the volume of a closed piece, is rejected. Faces of zero area are left in place and reported as a note: removing them means collapsing edges, which can break the mesh again, and they never change a single pixel.

## Results

| | Broken when opened | Sliceable after Repair | Still sliceable after STL round trip | Healthy meshes broken by Repair |
|---|---|---|---|---|
| Synthetic, before | 12 | 0 | 0 | 0 |
| Synthetic, after | 12 | **12** | **12** | **0** |
| Real, before | 35 | 1 | 1 | 0 |
| Real, after | 35 | **35** | **35** | **0** |

Measured on 2026-10-31. The "before" row of the real set opens every file thanks to a 3MF reading fix made the same week; with the older reader 14 of the 3MF files did not open at all, and none of the 38 broken meshes it could open became sliceable.

Since the slicer learned to separate touching solids on its own, 7 real meshes and 2 synthetic ones slice without Repair; the remaining 28 real and 10 synthetic broken meshes all slice after it, and after the STL round trip.

**Time.** Over the broken real meshes the median is **0.59 s per file** and **0.86 s per million faces**. The slowest, a 2.5-million-face model, takes **7.2 s**. Optimised build, on a Ryzen 7 5800X with 32 GB.

## Limits

- **Large holes stay open.** Above 30 % of the surface we report the hole instead of filling it.
- **Self-intersections are not defects.** Two overlapping closed parts slice correctly as a union, so Repair leaves them alone.
- **"Sliceable" is not "right".** A closed mesh that is entirely inside out is sliceable; Repair fixes orientation, but the metric would not notice if it did not. The synthetic set includes such cases on purpose and we check them separately.
- **Exporting a support mesh as STL** can still break meshes that were fine inside a project; that is an exporter issue, tracked separately.

## What is next

Repair now shows what it did, object by object, with progress and Cancel, and marks what it could not fix on the model. For models that are beyond repair, rebuilding the surface (clearly labelled as such, because it moves the surface) is on the [roadmap](/roadmap/) for later.

*Numbers come from our own measurements of development builds and will be updated when a public build ships.*
