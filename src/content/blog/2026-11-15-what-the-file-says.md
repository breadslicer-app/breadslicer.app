---
title: "Trust the file: resin counted from pixels, and a layer view down to the printer's pixel"
summary: "Two features that stop estimating and read what will actually be printed: the resin estimate, which was almost 18 % high on a large model, and a layer view that zooms until you see the printer's own pixels and grey levels."
slug: what-the-file-says
date: 2026-11-15
kind: note
tags: [slicing, estimates, layer-view, file-formats]
draft: false
---

A slicer shows you a lot of things that are close to what will print: the 3D model, the mesh volume, a preview of each layer. What the printer gets is different: a stack of images, one per layer, in a fixed grid of pixels, each with a grey level the file format may round. Two changes this month moved Breadslicer from the first kind of answer to the second.

## Resin, counted from what is lit

The resin estimate used to add up the volume of each mesh. That counts twice wherever two meshes overlap: a model and its supports, two parts of a sculpture glued together, a raft and the feet standing on it. On a large hollow model with supports, the estimate said **388.5 ml**.

Now the estimate counts **the lit pixels of every layer**, rasterised exactly as for the printer file, times the pixel area and the layer height. The same model reads **329.944 ml**. UVtools, counting pixels of the exported file independently, reads **329.953 ml**.

Two details make it fast enough to run on every slice:

- It is rasterised **without antialiasing**. Partial grey pixels at the edges change the result by a few thousandths of a millilitre (with 4× antialiasing the same model reads 329.942 ml), but take 30 times longer: 26.6 s against 0.9 s.
- It runs in the slicing thread, right after slicing, and is cached with the slice. Reopening a project with a saved slice measures it once.

## The layer view, down to the printer's pixel

The layer view could always zoom, but what it showed was our own picture of the layer, drawn for the screen. Now, past a certain zoom, it switches to **the printer's pixels**: the same grid, the same placement on the plate, and the same grey levels the file format stores. Some formats keep 16 grey levels, some 128, some 256; a 50 % grey in one is not exactly 50 % in another, and the view shows what your printer will get. It zooms to 24 screen pixels per printer pixel, with a grid between them, and the readout says which pixel you are on.

To be sure it is the same, a test exports a layer to two real formats (an Anycubic `.pwsz` and a Creality `.cxdlp`), reads the files back, and compares them with what the view shows, pixel by pixel.

The work it takes, measured on the largest panel we support (11,520 × 8,640 pixels):

- rasterising one layer: **0.9 ms** without antialiasing, **68 ms** with it;
- cutting out the part on screen: 3–8 ms.

Getting it to feel smooth took two more rounds after the first build. Fast zooming built several images per wheel step, up to 12 million texels each, and the window stuttered: now the view waits until it has been still for 50 ms, with a cap of 4 million texels. And when panning quickly, the edges of the zoomed image showed the coarse picture underneath: the view now builds half a screen of margin on each side, rebuilds at most every 50 ms and only when you leave what it already has, and fills in the margin 250 ms after you stop.

Highlights from the review are drawn on the same pixels, so an island or a suction cup you click in the list is shown exactly where it is in the file.
