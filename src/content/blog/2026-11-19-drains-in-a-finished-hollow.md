---
title: "Drains in a model that is already hollow"
summary: "A model can arrive hollow from another program. Breadslicer used to hollow it again before it could drill a drain. Now it finds the cavity the file already has and drills into it, and it supports the inside of a cavity with half the resin."
slug: drains-in-a-finished-hollow
date: 2026-11-19
kind: note
tags: [hollow, supports]
draft: false
next: true
---

Hollowing in Breadslicer used to work in one direction only: you hollowed a solid model, and the drains were cut while hollowing. A model that came hollow from another program, or one hollowed here and saved, had no way to get a drain except hollowing it again, which drew a new cavity inside the old one.

## Drilling what is there

The Hollow tab now knows when a model is already hollow: either Breadslicer hollowed it, or the model holds a sealed cavity. In that state it does not hollow again. Each drain you place is drilled into the mesh as it is.

The hard part is telling a cavity from any gap. A drain measures the wall and the air behind it with rays. The air only counts if it belongs to a cavity:

- **Cavity air.** We build a voxel map of the air inside the model. A cavity is air that spheres 2 mm across can fill from inside, and that no sphere coming from outside can reach. A thin slit between a part and the body is not a cavity, and neither is the space under an arm.
- **Closed.** 48 rays from the drain's end all have to hit the model.

On a 91 mm Wolverine, hollowing again takes 185 ms and drilling takes 540 ms, so drilling is not faster. What it buys is that the model stays the one you have. Across 950 test points, drilling never opened where the hollowing engine would not. It was more careful in 126 of them, all in cavities narrower than 4 mm.

The first version took a 3 mm slit between a layer of the model and its body for a cavity. That is why the map uses spheres, not single rays.

## Clearer Hollow

- A model that cannot be sliced is repaired first, then hollowed.
- If no cavity fits, the tab says so ("No room to hollow") instead of leaving the model as it was without a word.
- Clicks made while it works are queued, not dropped.
- The Drains card warns about sealed cavities that still need a drain.
- A colour map on the model shows where a drain would work best: green where the wall is low, thin and far from other drains, red over painted detail. It only shows; it never places a drain by itself.

## Supports inside a cavity

A hollow model often needs supports inside the cavity, hanging from the roof to the floor. The engine used the same sizes inside as outside: thin sticks, close together. That trapped resin in the cavity and gave the sticks little to stand on.

Inside a closed cavity, Breadslicer now takes a size with a tip at least twice as wide and a trunk 1 to 1.5 times as wide, or the widest one that fits, and spaces the tips to match. Telling inside from outside uses 128 directions, all of which must hit the model, and the parity of 3 rays, so parts that overlap are not mistaken for a cavity.

In the cavity of a large hollow model:

| Preset | Supports | Their resin |
|---|---|---|
| Miniatures | 160 → 78 | 2.09 → 1.12 cm³ |
| Figures | 99 → 62 | 1.30 → 1.02 cm³ |

The review found the same single island before and after, and no support goes through the model. Solid miniatures come out byte for byte the same.

A second round lets a tip in a cavity hang from a neighbouring stick, as a leaf hangs from a trunk outside.
