---
title: "How Breadslicer places supports, and what two weeks of measuring changed"
summary: "Pillars on a grid that spread the peel force, tips that end in a sphere on the exact point, braces for tall trunks, and the bugs a scorecard of 13 scenes found along the way."
slug: how-supports-are-placed
date: 2026-11-10
kind: paper
tags: [supports, method, printing]
draft: false
---

A resin print hangs upside down from the build plate, and every layer is peeled off the film at the bottom of the vat. Supports have two jobs: give every part of the model something to grow from, and carry the peel force of every layer up to the plate without bending, breaking or tearing the raft off. The first job is about **where** tips go. The second is about **how the structure is built**. This note covers both, as they stand in 0.4.0-alpha.1.

## How we judge a change

Supports are easy to make look better and hard to make better. So every change to the engine runs through a **scorecard**: 13 scenes (single miniatures, a plate of four, a large hollow model, a castle, a whale, a worm sculpture), generated with each preset, and counted:

- islands left without a tip, and overhang area farther than the preset's spacing from any tip;
- tips, roots on the plate, feet on the model;
- supports that cross the model (must be 0) or float (must be 0);
- tips buried in the model, and pairs of tips closer than 0.8 mm;
- resin used by supports, and generation time.

A change ships when it moves the number it was meant to move without making the others worse. Twice in these two weeks the numbers looked good and the result did not: some supports made no sense to someone who prints. Since then a change also has to look right to a person, on real models, before it ships.

## Where tips go

Each preset has rules by zone. Overhangs (faces that look down past the preset's angle) get tips at a fixed spacing: every 1.8 mm on Miniatures. Steeper faces get a sparser stabilising row. Islands get their first tip at the point where they start, then more by their area.

Three bugs in this part were found by the scorecard, and each one was quietly costing supports:

**Tips that jumped.** To find the surface at a candidate point, the engine casts a ray upwards from below it. That ray had no ceiling. A candidate on a face that does not look down could jump up to 35 mm, to whatever hung above: a finger, a chin. All the extra tips on one model's hand came from candidates on its body. Capping the ray at the tip ring radius plus 0.5 mm changed, over the 13 scenes with Miniatures: tips 35,286 → 30,486, tips closer than 0.8 mm 5,362 → 4,015, support resin 327.6 → 267.7 cm³, uncovered islands 173 → 110, and supports through the model still 0.

**Faces numbered in the wrong order.** Overhang regions listed their triangles in the order of the file, and the sampler looked them up in the order of its ray-tracing tree, which reorders triangles when it is built. On one model 180 of 435 overhang candidates fell on faces that did not even look down, and parts of the underside got none. Renumbering the regions on the tree's order fixed it; the hand of that model went from 1 tip to 5, one per finger.

**Cones through neighbouring parts.** A tip's cone was checked along its axis only. Now it is checked along its axis, from eight points on the edge of its socket and along its side, and a cone lying almost flat along a surface is refused. The check happens while placing, so the engine tries another route instead of dropping the tip at the end. Cones entering the model more than 0.5 mm before their contact: 21 of 362 → 1 of 400.

## The tip itself

A tip now ends in a **sphere** the diameter of its contact, centred on the exact point, and enters the model by its radius. The contact is a point, so the tip may arrive at an angle; it does not have to aim along the surface's normal. By hand, the tip goes to the exact point under the cursor or turns red with the reason.

That last part had its own trap. Sculpted miniatures can have two million triangles smaller than a screen pixel, and the one under the cursor often looks up inside an overhang that, at half a millimetre, clearly looks down. When the face under the cursor cannot take a tip, Breadslicer now reads the surface within 0.4 mm around the point instead. On a 40 mm miniature, clicks refused with "the surface looks up" went from 135 to 35 out of 280, and clicks on real overhangs did not change.

## The structure

**Pillars on a grid.** Each plate has a grid (7 mm for Miniatures, 4 mm for Figures). Main pillars stand on its nodes, and nearby supports join a pillar with braces instead of each going down on its own. The point is not looks: when one side of a model has many roots and a layer with a large area peels, the plate side of the raft acts as a lever and can lift off. Pillars spread that force over the plate. Trunks away from the grid are still allowed; the grid is a backbone, not a cage.

**Braces for tall and bent trunks.** Every peel pulls on each trunk, and a long unbraced trunk bends. A trunk that rises more than 10 mm above its highest brace is now braced to the neighbours that run alongside it. Trunks sticking out more than 10 mm unbraced: on a 43 mm miniature 47 → 18; on the same at 91 mm with Figures 172 → 57; on a plate of four 245 → 65.

**Small supports for islands.** An island far from the plate used to get its own long branch. Now a branch of 8 mm or more with nothing hanging from it hangs from the nearest existing support if that is shorter. Island branches of 8 mm or more on one test model: 164 → 41. Support resin dropped 4 to 17 % across six scenes, with the same islands covered.

**Full shafts.** Large sets used to be drawn with fewer sides per shaft to save triangles: 8, 6, and on the biggest scenes 3. A three-sided shaft has 59 % less cross-section than the round one the engine planned, and that is the mesh that gets printed. Shafts are now always drawn with 12 sides.

## What a test print taught us

To choose tip sizes we printed a plate of test pads: twelve 10 × 10 × 1.5 mm plates, each held by nine vertical tips 3 mm apart, with contacts of 0.24, 0.35, 0.45 and 0.60 mm and three cone lengths. Only the 0.60 mm column held its pads.

The lesson was not "use 0.60". A pad on tips 3 mm apart gives each tip about 11 mm² of layer to peel. A finer tip needs tips closer together, at the same load per area. That is how the three presets are now built: Miniatures (20–65 mm) with fine tips close together, Figures (65–150 mm) with 0.40 mm tips every 2.4 mm, Statues (150 mm and up) with 0.60 mm every 2.8 mm.

<figure class="narrow">
  <img src="/blog/supports-panel.webp" width="330" height="893" alt="The Supports panel: the three presets, the drawing of the selected support and its tip sizes" loading="lazy" decoding="async">
  <figcaption>The Supports panel: the three presets, and the support of the one selected, drawn to scale.</figcaption>
</figure>

## Generation does not have to be perfect

Generating supports is a first pass. Some islands are only visible layer by layer, after slicing, which is why the [review](/blog/review-in-one-sweep/) exists and why its *Fix all* adds the tips that are still missing. The rule we hold the engine to is the one after Fix all: no island left without a tip, except the ones that have no path to anything or never get as wide as the smallest tip, and those say so. The next build runs that whole cycle in the same press of Generate.
