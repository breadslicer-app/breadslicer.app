---
title: "Plates, Arrange and one raft for all: fitting more miniatures on a plate"
summary: "Several plates in one scene, an arrange that looks at the model at every height, supports shared between copies, and a single line raft under all of them. With the numbers, and one tenth of a degree that changed everything."
slug: plates-arrange-one-raft
date: 2026-11-14
kind: paper
tags: [arrange, plates, supports, performance]
draft: false
---

People who print miniatures for a living fill plates. Every print takes the same time whether the plate holds three miniatures or thirty, so the questions are how many fit, how fast you get there, and whether you had to play Tetris by hand. The goal we set was simple to say: **nobody should ever have to arrange a plate by hand.**

## Plates

A scene holds up to 32 plates, in rows of four. Each plate is one print, on the same printer. They share one undo history and one project file, models can be dragged from one to another, and each plate keeps its own slice and its own review, so going back to a plate you sliced earlier brings its result back instead of slicing again. Names are written on the plate itself, behind its back left corner, and edited in place with a double-click.

## Arrange looks at every height

Most arrange tools pack the **shadow** of each model seen from above. Miniatures are bad at that: a raised wing or a spear covers a lot of plate but only at one height. Breadslicer cuts each model, with its supports, into 1 mm bands and packs bands: two models may overlap from above if, at every height, they stay at least the gap apart (1 mm by default). Each candidate is tried in eight turns, with several passes in parallel (packed to the centre, packed to a corner, rows of copies turned alike), and the result that fits the most wins, then the one that leaves the most room, then the one with the most even peel load.

When a selection does not fit, **Arrange all** adds plates and moves what is left there; plates that end up empty are removed. If you placed some models by hand, it asks whether to keep them where they are (they become obstacles) or to arrange them too.

On 20 miniatures, everything fits in about a second. On 36, 22 fit on one plate by bands against 20 by shadow.

## Copies share their work

A plate of a hundred copies of the same miniature used to cost a hundred of everything: a hundred support runs, a hundred ray-tracing trees, a hundred meshes in memory. Now copies of a model share its geometry, with only their position and turn stored apart, and **Generate computes supports once for each group of identical copies** standing the same way, then carries the result to every copy.

Measured on scenes with 106 and 128 copies of a 40 mm miniature:

| | Before | After |
|---|---|---|
| Memory after opening the project | 2,481 MB | 260 MB |
| Memory after arranging twice | 3,004 MB | 414 MB |
| Generate supports for 128 copies | 1,028 s | 1.5 s |
| Drag a model, per step | 352 ms | 2 ms |
| Arrange all, whole operation | 22 s | 4.4–5.7 s |

The last row was not the arranging itself, which took 3–4 s: it was the 106 separate "the scene changed" notices sent after moving 106 support sets, each one making the view and the review refresh. They are now sent once.

The shapes Arrange needs are also prepared in the background while the scene is still: a second Arrange on 115 models spends 0.11 s on shapes instead of 0.64 s.

## One raft for all

With a raft under each model, rafts touch long before models do. **One raft for all** draws a single line raft under every set of supports on the plate, so Arrange can ignore rafts and pack the models and their supports. Copies end up about 1 mm apart.

Two rules came out of using it:

- **Generate never moves anything.** If new supports run into a neighbour, Breadslicer says so and offers Arrange all, and nothing else.
- **Arrange and Fill measure a model with the supports it is going to get**, even before they exist, by forecasting its supports alone, standing where it will stand. So you can fill a plate first and generate after.

We also made the line raft the default. Its roots now stand on small feet just wider than a line instead of full discs, so even without one raft for all a raft takes less room: on a 40 mm miniature tilted 37°, a plate went from 18 to 24 copies.

## One tenth of a degree

While testing, the same plate sometimes held 23 copies and sometimes 20. The arrange was deterministic: ten runs gave the same result. What changed was the pose. Turning with the keyboard and Shift could leave a model at −36.99° while the panel showed −37.0°, and that hundredth of a degree changed the supports the forecast predicted, and with them how many copies fit: anywhere from 19 to 25.

Turns now land exactly on the tenth of a degree they show (15° with Ctrl, 1° with Ctrl+Shift). A small rounding fix, but it made the plate you see the plate you get, which is the whole point.

## Limits

- One raft for all does not yet cut around models that stand directly on the plate.
- Each model's supports are computed alone, so they no longer avoid a different neighbour; a clash is reported, not solved.
- A pillar grid makes the footprint jump with tiny turns; under one raft for all the grid is turned off.
