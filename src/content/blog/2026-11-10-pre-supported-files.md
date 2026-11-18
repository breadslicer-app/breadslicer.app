---
title: "Telling supports from the model in a pre-supported STL"
summary: "Many miniatures are sold already supported, as one mesh. Breadslicer now recognises the supports on import and lets you keep them, separate them or replace them with its own, without a single false alarm on 141 ordinary models."
slug: pre-supported-files
date: 2026-11-10
kind: paper
tags: [import, supports, geometry, method]
draft: false
---

A lot of miniatures are sold **pre-supported**: the designer placed supports by hand and exported model and supports as one STL. For a slicer that file is just triangles. It cannot move the supports with the model, regenerate them, or tell the review which parts are supports, so islands and suction cups are judged wrong.

Breadslicer now looks at every model file you import and, if it carries supports, asks once:

- **Keep as it is**: nothing changes (and it does not ask again for that object, even after a repair).
- **Separate**: the model keeps its file name and the supports become a separate object, "Imported supports", in the same undo step. They follow the model when you move it on the plate or turn it about the vertical.
- **Replace with Breadslicer supports** (the default): the imported supports go and the model is ready for Generate.

Import several pre-supported files at once and you get one question for all of them.

## How it finds the supports

Supports have a shape that sculpted models rarely have: long, thin and round, standing on a flat raft. The classifier works on that:

1. **Shells and pieces.** The mesh is split into its connected shells, and shells into pieces.
2. **Surfaces of revolution.** Each piece is fitted against a cylinder or cone around its own axis. Trunks, branches and tip cones fit well; arms, spears and hair do not, because their sections are not round.
3. **The raft.** A flat slab no more than 3.5 mm thick at the bottom, under the candidates.
4. **Reaching the base.** A candidate counts as support only if it connects down to the raft or to another support. A round, thin piece floating in the model (a staff, a candle) stays model.
5. **Leftovers.** Small loose bits are given to whatever they touch. A stub of trunk with a tip that touches the model, or a lone ball that touches nothing, is support. Anything doubtful goes with the model, so the worst case is a support left on the model, never a part of the model thrown away.

Files where supports were **fused** into the model (merged into one closed surface, for example by a repair tool) cannot be separated cleanly. They are recognised by the shape of their cross-sections a few millimetres above the raft (many small round loops), and Breadslicer says so instead of offering to separate them.

## How we checked it

- On models whose designer also published the unsupported version, the separated model has **exactly the same faces** as the unsupported file, in four of four cases.
- On **141 ordinary models** from a downloads folder with no "support" in their names, it flagged 4 as pre-supported, and looking at them from the side, all 4 were. Across that folder and our pre-supported test set it reported fused supports on 4 files, all of them pre-supported miniatures whose supports really are merged into the model (two of them had been fused by a repair tool).
- It takes 9 to 490 ms per file, in the background, so the question appears as soon as the files have finished loading.

## Supports that follow, and supports that go

Moving a model on the plate or turning it about the vertical carries its imported supports along. Raising, tilting or scaling it would leave them hanging in the wrong place, so in those cases they are removed in the same undo step and the model waits for Breadslicer's own supports. Deleting a model takes its supports with it, and copy, paste and Fill the plate copy them too.

The *Remove* tool works on imported supports one body at a time (click, box or brush), so you can clear a few you do not trust and generate only where they were.
