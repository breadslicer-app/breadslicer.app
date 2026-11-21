---
title: "Cut along a line you draw, and place models to the hundredth"
summary: "Beyond the flat plane: cuts along a stroke or a lasso drawn on the model, adjusted in 3D before they cut, with pins or magnet slots, and suggestions of where to cut. Plus Lay on face, numbers while you move, Mirror, Measure and groups."
slug: cutting-and-placing
date: 2026-11-21
kind: note
tags: [cut, editor, placement]
draft: false
next: true
---

## Cutting

The [plane cut](/blog/plane-cut/) splits a model with a flat plane. Miniatures rarely want a flat cut: an arm leaves the body at an angle, a cloak folds around the legs. Three new ways to cut:

- **Stroke.** Draw a line across the model, from one side to the other; the cut follows it straight through the model, away from you.
- **Lasso.** Draw a closed curve around a part; the cut takes that region out.
- **Suggest a cut.** Breadslicer proposes cuts where the model has creases and narrow necks.

Before you cut, the part of the cut that runs inside the model shows in green, so you see the section the pieces will have.

Once drawn, a stroke or a lasso does not have to be right the first time. It stays on the model as a cutting surface, with the same gizmo as the plane:

- a cube on each point of the stroke moves that point;
- the arrow, or a drag on the surface itself, moves the whole surface;
- the rings tilt it.

Turn the camera and fix it from any side; a right click mid-drag puts it back. Cut then cuts along the surface as it is.

## Keys and magnets

A cut can add **pins** to line the pieces up again, or **magnet slots**, so the pieces snap together after printing.

## Cutting a model that has supports

The pieces of a model with Breadslicer supports get new supports by themselves, in the same Undo step.

A pre-supported model is different: its supports came with the file. Each imported support now goes with the piece its highest point touches. The piece that holds the most keeps its supports, and the others are taken away in the same step. On a tester's pre-supported file cut in half, 1,000 support bodies became 985.

## Placing

- **Lay on face.** Click a flat face and the model turns to stand on it. The face under the cursor lights up first, so you see what you are about to pick.
- **Numbers while you move.** While you move, turn or scale with G, R or S, you can type the amount. Scale can be set per axis.
- **Mirror** along X or Y from the right-click menu. Supports made here are made again in the same step.
- **Measure (Q).** Click two points for the distance and its X, Y and Z parts; Shift+click adds another leg and a total. Points snap to a face's corner when you click near it.
- **Hide and lock.** A hidden model is not drawn and not sliced; a locked one cannot be picked in the view. Both are saved in the project.
- **Groups.** Ctrl+G groups models: they are picked, moved, arranged and supported as one, and share a raft. Dragging one member of a group moves it alone, and the app says so.
- **Orient several.** Auto-orient now works on every selected model at once. The Full search also counts suction cups and peel force.
