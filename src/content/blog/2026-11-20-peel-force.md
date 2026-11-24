---
title: "How hard each layer pulls"
summary: "Every layer of a resin print is pulled off the film. Breadslicer now estimates that pull layer by layer, shares it out among the tips holding each part, warns about tips asked to carry too much, and draws it all in a chart in the Slice tab."
slug: peel-force
date: 2026-11-20
kind: note
tags: [slicing, review, supports]
draft: false
---

When a layer cures, it sticks to the film at the bottom of the vat, and the printer pulls it off before the next one. The bigger and the more closed the layer, the harder that pull. A part that breaks off mid-print usually broke on one of those pulls.

## Per layer

A new part of the slicing core estimates the peel force of each layer from what the layer is:

- its **area**;
- its **shape**, not only its size;
- its **suction cups**: an enclosed pocket that seals against the film pulls much harder than its area alone says.

## Per tip

That force has to go through the supports. For each separate part on each layer, the core treats the part as rigid and shares the pull among the tips that hold it, by where they are.

The review uses this: a tip asked to carry more than its size can is a new finding, with the layer where it happens.

## In the Slice tab

The Layers card has a chart, layer by layer, of:

- area;
- perimeter;
- estimated force;
- estimated time.

The heaviest layers stand out at a glance.

## Not calibrated yet

The numbers come from the shape of each layer, not from measurements on our printers. They are meant to compare layers and parts; as absolute newtons they are an estimate. Calibrating them takes printed test pieces, which is next.
