---
title: "Generate does the rest"
summary: "Generating supports used to be the first of several steps: slice, read the review, add supports to the islands, fix the rest. Now Generate runs all of it, without asking. A rule came with it: what the app can fix by itself, it fixes."
slug: generate-does-the-rest
date: 2026-11-18
kind: note
tags: [supports, review, workflow]
draft: false
---

A tester showed us their routine for supporting a miniature by hand in another slicer, and it came down to two moves: put supports everywhere the general rules ask for, then look for the islands, the parts of a layer that start in the air, and give each one a support. Breadslicer had both pieces, but they were separate steps. You pressed Generate, then Slice, then read the review, then said yes to "Add supports?", then pressed Fix all.

## One click

Now Generate does all of it:

1. it places the supports, as before;
2. it slices the plate quietly, with no dialog over the window, only to find the islands;
3. it supports every island it found;
4. it runs **Fix all** until the review is clean, up to 3 passes.

All of it is undone by Ctrl+Z in two steps: the island supports, then Generate. While it works, the Islands card says "Finding the islands and supporting them…" and the status bar says when it is done.

Slicing a plate whose supports Breadslicer made no longer asks "Add supports?" either: the missing ones go in by themselves. The question stays only for plates with no supports of ours.

We tried it on real miniatures with the Miniatures preset. After Generate, the review held only notes: no island left without a support, and nothing that needed a decision.

## The rule

This changed how we decide what goes in front of you. **Whatever the app can do for you, it does, with no question and no extra button.** A question is for something only you can decide: whether to replace a slice made with another printer, whether to keep or separate the supports that came with a file. A button that always gets the same answer is a step we should have taken for you.

The same rule moved other things:

- **Repair.** A model that cannot be sliced is repaired before hollowing.
- **Supports out of date.** Supports that no longer fit the model they stand on are redone.
- **Lift.** Lift 5 mm is on by default.
- **Slicing.** Slicing a plate with mesh errors no longer refuses: the slicer repairs its own copy and says it did.
