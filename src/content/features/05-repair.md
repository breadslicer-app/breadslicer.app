---
title: Broken models, printable.
kicker: Repair
order: 5
facts:
  - { k: Test set, v: "Every broken model sliceable after Repair" }
  - { k: Safe, v: "Never keeps a step that makes a model worse" }
  - { k: Speed, v: "Median 0.86 s per million faces" }
---

Downloaded models are often broken in ways a slicer cannot cut: cracks, faces stacked twice, parts that touch on a single edge, holes, pieces inside out. Repair welds the cracks, separates touching parts, orients every piece and closes the holes, and checks after each step that nothing got worse and no material was lost.

Then it tells you what it did, object by object, with times, and marks in red or amber whatever is still wrong. It can be cancelled at any point, leaving the scene as it was. The method and the numbers are in the report [Mesh repair that makes broken models printable](/reports/mesh-repair/).
