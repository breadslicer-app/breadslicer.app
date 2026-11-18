---
title: "A live overhang map that knows where your tips are"
summary: "Painting a model red where it needs support is easy. Making the paint agree with the support engine, fade where a tip already holds it, and ignore the noise of two-million-triangle sculpts took three rounds."
slug: overhang-map
date: 2026-11-09
kind: note
tags: [viewport, supports, rendering]
draft: false
---

The overhang map paints a model red where it looks down too steeply to print without support. It updates while you turn the model, so you can find a pose with less red before generating anything. In 0.4.0-alpha.1 it is in the Prepare, Supports and Slice tabs, behind one checkbox.

## In the shader, for free

The map is computed on the GPU, in the same pass that draws the model: each pixel compares its surface normal with the preset's overhang angle. There is no extra mesh, no recomputation when you turn the model, and on a 1.9 M-triangle miniature the cost was within the noise of the frame time, about 3 ms per frame either way.

A map that disagrees with the support engine is worse than no map. So a test renders a model in 432 poses with the real shader and compares, pose by pose, with the faces the engine classifies as overhangs.

## Red only where nothing holds it

Once a model has supports, painting every overhang red is just noise: you want to see what is **left**. Each tip now clears a disc around it, as wide as the preset's tip spacing (1.8 mm on Miniatures, 2.4 mm on Figures, 2.8 mm on Statues). We chose that radius instead of a tip's own size on purpose: the engine places tips so that no point of an overhang is farther than that spacing from one. With a smaller radius, red spots would show between tips that are correctly placed.

Getting thousands of tips into a fragment shader took some care. The graphics profile we target does not allow storage buffers, so tips go to the GPU as two small data textures: tips sorted by a hash of the 3D cell they fall in, and a table of where each cell starts. A red pixel looks at no more than 8 cells. On a full-screen miniature with 1,391 tips, frame time was 7.1–8.9 ms with tips against 7.7–8.4 ms without: no visible cost.

The first version only counted the tips of trunks, branches and leaves. The small supports that run from model to model have a tip at each end and were ignored, so their spots stayed red. Counting every contact of every support, a 40 mm miniature went from 583 to 1,325 points and the red area covered from 83.3 % to 96.7 %.

## The noise of fine meshes

Sculpted miniatures often have millions of triangles smaller than a pixel. On a surface that looks up, such as the top of a shoulder pad with a hammered texture, a few of those tiny triangles always look down, and the map showed them as red specks that no support could ever fix.

Now each vertex reads the **surface around it** instead of its own triangles: the average normal of the surface within 0.4 mm, each face weighted by its area inside that sphere. Two guards keep real detail: a vertex only reads the surface if none of its edges is longer than half that reach (so models with large triangles look exactly as before), and only if the normals around it agree (so thin walls keep their own sides). It runs in a background thread, once per mesh: 976 k vertices in 0.21 s, and 81 % of the vertices of that miniature read the surface. The specks on straps, armour and the mesh of a shield disappeared; the real overhangs stayed red and look more even.

The same 0.4 mm reading is used when you place a tip by hand, so the map and the Add tool agree about which way a surface looks.

## From below

Tips are easier to place from under the model, and under the plate everything is in the way. When the camera goes below the plate, the plate fades out, and so does the raft (option: *Hide the raft*). Supports can turn into dotted lines with a small ball at each contact (option: *Supports as dotted lines*), so you see where they touch without the trunks hiding the model. The tools see through what is hidden: Remove and Move tip pick the support behind the faded raft.
