---
title: "Hollowing, two weeks later: lasso, drains, plugs and a minimum cavity width"
summary: "What changed in the Hollow tab after the exact-cavity work: solid areas drawn with a lasso, drains that only drill where they reach, plugs, a minimum cavity width, and a session three times faster with identical results."
slug: hollowing-since-the-report
date: 2026-11-16
kind: note
tags: [hollowing, drains, performance]
draft: false
---

At the end of October we rebuilt hollowing around one rule: [the preview is the result](/reports/exact-hollowing/), to the thousandth of a millimetre. This note is about everything that came after it, in the two weeks before the first release.

## Solid areas, drawn with a lasso

Some parts of a model should stay solid even when the rest is hollow: a thin wrist, the stem of a base, a joint you plan to pin. Press **M** in the Hollow tab and draw a lasso around them, from any camera angle. The lasso becomes a prism along the view (a cone in perspective) in the model's own frame, and wherever it crosses the cavity the cavity's wall is placed **exactly on the lasso's surface**, within 0.05 mm, instead of somewhere inside the grid cell it falls in. Without that step the wall landed up to 0.62 mm inside.

A lasso that cuts a cavity in two leaves two cavities. The live preview pays for it with about a millisecond (11 ms on one miniature, 17 ms on a larger one), so it stays live. While you draw, supports hide completely, lines and dots included, so they do not get in the way.

## Minimum cavity width

A cavity a millimetre wide inside a tail or a sword cannot be washed or cured; it is a resin trap that will crack the print later. **Minimum cavity width** (2 mm by default) removes any part of the cavity narrower than that, by a morphological opening of the cavity, and leaves the part solid. On our large test whale it removes 2.8 % of the cavity, all of it in thin parts.

## Overlapping parts

Many sculptures are several closed parts pushed into each other: a head into a body, a weapon into a hand. Hollowing them part by part leaves walls inside walls. Parts that overlap are now united first, with the [manifold](https://github.com/elalish/manifold) library, then hollowed as one solid (up to 64 parts).

## Drains

- **Only where they reach.** A drain whose axis does not reach the cavity, or leaves the model and enters it again before reaching it, is not drilled. While you place it, the marker under the cursor turns red where it would not reach. Before, a drain on a thin fin could cut straight through the model.
- **Depth**: automatic, measured from the surface to the cavity's wall plus a little, or a fixed depth you choose. A fixed depth that would come out the other side is shortened, and the tool tells you.
- **Shape**: straight or tapered, set by two radii.
- **Plugs**: optionally, each drain gets a plug printed next to the model, 0.1 mm smaller than the hole so it fits after curing.
- **Infill**: a drain removes every whole pillar or bar of infill it touches, plus anything left floating, with 0.5 mm of clearance. Cutting just the stretch inside the drain used to leave pieces of pillar loose inside the model.
- **Undo**: drains and solid areas placed before hollowing are undo steps of their own.

## Never filled

The review can fill small sealed pockets that would trap resin. It never fills a cavity of 1 ml or more, never a suction cup, and never a hollow made in Breadslicer: those ask for drains instead. See [the review in one sweep](/blog/review-in-one-sweep/).

## Faster, with the same result

The hollowing session (the work done once when you open the tab) was rewritten to run in parallel without changing a single output vertex:

- one 1.9 M-triangle miniature: **1.35 s → 0.46 s**;
- a larger one: **1.66 s → 0.69 s**.

Both produce the same mesh as before, compared bit for bit. Projects also record which version of the hollowing engine made each hollow, so a future change can never quietly alter a hollow you saved.
