---
title: "Around the view: one progress bar, a floating review, the layers everywhere"
summary: "Small things that add up: one progress bar for every long job, the review floating over the view, the layer slider in every tab, a card with every shortcut, links that open in the running window, and pictures of your projects in Windows Explorer."
slug: around-the-view
date: 2026-11-20
kind: note
tags: [interface]
draft: false
next: true
---

## One progress bar

Opening, saving, generating supports and slicing each showed progress their own way: a dialog here, a bar in a card there. There is now one: a technical ruler at the bottom centre of the view, with what is running, the percentage and Cancel. Cards keep a small bar of their own for work that belongs to them. Slicing no longer dims the window; an invisible layer stops clicks on the scene while it runs, and Esc cancels.

<figure>
  <img src="/blog/progress-ruler.webp" width="690" height="137" alt="One progress bar at the bottom of the view: Generating support structure, 68 %, with a ruler and Cancel" loading="lazy" decoding="async">
  <figcaption>One progress bar, at the bottom of the view, for every long job.</figcaption>
</figure>

## The review over the view

In the Slice tab, the review used to sit in the right panel under the print setup and the cost, squeezed into what was left. It now floats over the view, bottom left:

- it grows with the window, and only its list scrolls;
- its title folds it away;
- each finding wraps its text and shows its layers under it.

When Fix all ends, the plate is sliced again, so the list you read is about the scene as it is.

<figure class="narrow">
  <img src="/blog/review-floating.webp" width="350" height="405" alt="The review card floating over the view, with two errors, why Fix all left them, and the layers they are on" loading="lazy" decoding="async">
  <figcaption>The review, floating over the view: each finding says its layers, and why Fix all left it.</figcaption>
</figure>

## The layers in every tab

The layer slider is in every tab now, not only in Slice. Outside a slice, it cuts the models live at the height you pick, and the cut face is closed, so you never see inside a model. With a slice that is current, every tab shows the slice's own layers.

## Every shortcut, on one card

F1, or Help, opens a card with every keyboard shortcut, by tab. While it is open, nothing behind it moves; F1 closes it again. The status bar reminds you that F1 is there.

Some shortcuts are new:

- **Select all, deselect and invert** with the keyboard.
- **Duplicate** the selection in one step.
- **G** moves on the plate by default, and G again confirms.
- **Shift+click** in the object list picks a range.
- **A drag on empty space** draws a selection box.
- **Q** measures, in every tab.

<figure>
  <img src="/blog/shortcuts-card.webp" width="1000" height="696" alt="The keyboard shortcuts card, grouped into General, View, Slice, Objects, Hollow and Supports" loading="lazy" decoding="async">
  <figcaption>Every shortcut on one card: F1.</figcaption>
</figure>

## Links and files

- **`breadslicer://` links.** They open in the window you already have: a file, the diagnostics, the preferences. A link never downloads anything.
- **Pictures in Explorer.** A project you save by hand carries a picture of its scene, which Windows Explorer shows.
- **Export selection.** Exports the picked models alone; hidden models are left out of any export.
- **Names.** A model is named after its file, whatever name the file gives it inside.
- **Models off the plates.** A model past every plate is listed under "Off the plates", and it is never sliced as part of the first plate.
- **Tools close by themselves** when the model they work on is deleted or another project opens.
