---
title: "Auto-orient in half a second"
summary: "How Breadslicer scores thousands of poses of a two-million-triangle miniature: what it measures, why islands are counted on the full mesh, and why it would rather not move your model at all."
slug: auto-orient
date: 2026-10-30
kind: paper
tags: [orient, method, performance]
draft: false
---

The pose of a model decides most of how a resin print goes: how many supports it needs, where their marks end up, how much force each layer pulls off the film, and how long the print takes. Auto-orient searches for a good pose for you. It has two buttons: **Quick**, about half a second on a 1.9 M-triangle miniature, and **Full**, a few seconds, which looks harder.

## What a pose is scored on

Every candidate direction "up" is scored on a few measured terms, then combined with weights that depend on what you ask for (balanced, fewer supports, less peel force, or a faster print):

- **Overhang area**: how much surface looks down past the preset's angle, from a histogram of face directions, which makes testing a direction almost free.
- **Islands**: parts that would start in mid-air, grouped when they are closer than 1.5 mm (one tip holds them all).
- **Peel force per layer**: from the area of each layer and how sharply it jumps from the layer before.
- **Suction cups**: cavities that open downwards and would pull on the film.
- **Support length**, **height** of the print, and how **slender** the model stands.

Before any of that, a pose has to fit the printer, and it must not put tips on areas you painted with *Protect detail*.

## Simplified for speed, full for the verdict

Testing thousands of directions on two million triangles is too slow, so the search runs on a simplified copy of the mesh. But we learned two things the hard way in the prototype:

- **Islands depend on the pose in a simplified mesh.** Simplifying removes small features, and which ones survive changes with the pose. So islands are always counted on the full mesh.
- **Peel force is judged on the full mesh** too, for the few finalists.

The search runs in stages: many directions on the simplified mesh, the best few hundred refined, and the last few judged on the full model. Full mode looks at 16,000 directions and judges 16 finalists on the full mesh, then offers the three that are most different from each other, so you choose between real alternatives instead of three versions of the same pose.

## It would rather not move your model

A new pose is only proposed if it beats the current one by more than **3 %**. A model you already oriented well is not moved for a rounding-error gain, and Auto-orient says "this is already the best pose" instead.

## Numbers

On a 1.9 M-triangle miniature, our development PC, optimised build:

- **Analysis**, done once when the tool opens: 0.33 s.
- **Quick search**: 0.51 s. **Full search**: 3.05 s (with other builds compiling on the same machine).
- For that model, the pose it chose needs about **51** tips against **232** in the pose it arrived in, and the estimated worst peel force drops from about **30 N** to **7.8 N**.

Hovering over a result previews it on the model, live. Applying it is one undo step; turning about the vertical carries the supports along, and tilting regenerates them in the same step.

## Painting detail

Some surfaces should never carry a support mark: a face, an emblem, fine hair. In Orient you can paint them with the *Protect detail* brush. The search treats a tip on protected surface as worse than any amount of extra overhang elsewhere. The paint is saved in the project; making the support engine itself avoid painted areas is the next step.
