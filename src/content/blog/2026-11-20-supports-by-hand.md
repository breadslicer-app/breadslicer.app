---
title: "Supports by hand: pick, drag, draw a line, paint an area"
summary: "The Supports tab now has a Select tool that picks placed supports and edits them in place, a Line tool and an Area tool for rows and patches of supports, view modes for crowded scenes, and an editor for the presets that place supports by zone."
slug: supports-by-hand
date: 2026-11-20
kind: note
tags: [supports, editor]
draft: false
next: true
---

Automatic supports get most of a model right. The rest is done by hand, and every hand tool in Breadslicer edits the supports as data, not as a mesh: each change is one Undo step and is saved in the `.bread` file.

## The tools

The Supports tab has two pages:

- **Auto** holds the presets (Miniatures, Figures, Statues) and generates.
- **Manual** holds the hand tools and the four hand sizes, XS, S, M and L. They are numbers of your own that never change a preset.

The tools, with their keys:

- **Select (E).** Click a support to pick it.
  - The shape panel then shows the picked support's own numbers. Change the tip, trunk or foot width and the support takes them where it stands.
  - With several picked, the panel says "several" and a change applies to all.
  - **Own trunk** splits a hanging support off onto a route of its own. **Hang from nearest** reattaches it to the closest support it reaches.
  - **Drag a trunk** to move it across the plate, its foot and elbows with it and its tip where it was. Elbows the new route would lean past 45° go, and one is made where the route needs it.
  - **Drag one of its elbows** to move that elbow on the plane facing you, between the parts above and below it.
  - What hangs from a moved support is routed again from its own tip.
  - Own trunk and Hang from nearest leave a support others hang from as it is.
- **Add**, **Move tip** and **Brace**, as before ([one support at a time](/blog/how-supports-are-placed/)).
- **Line (N).** Two clicks on the model draw a row of supports between them that follows the surface, at the spacing you set.
- **Area (P).** Paint a patch of the model and it gets a grid of supports; Shift+click fills the faces around the click that lean less than 25° from it.
- **Remove**, with a click, a box or a brush.

Line and Area always use the sizes of the support preset in use. Add uses the hand size you picked.

<figure class="narrow">
  <img src="/blog/manual-supports-panel.webp" width="330" height="888" alt="The Manual supports page: the tool row, the hand support drawn in 3D with its sizes, and the four hand sizes" loading="lazy" decoding="async">
  <figcaption>The Manual page: the tools, and the hand support drawn with its own sizes.</figcaption>
</figure>

## Painted detail

Faces painted as detail are now avoided by the engine. A tip planned on painted detail moves half a spacing away, or takes a finer size, and the line of the last Generate says how many it moved.

## Seeing through a crowd

A full plate of supports hides the model. Scene settings now has three ways to draw them:

- **Full.**
- **Contacts only:** just the tips, where they touch the model.
- **Translucent:** see-through, with the model solid.

The setting is remembered.

## Presets by zone, editable

The presets that give each zone of a model its own size and spacing (overhangs, steep faces, islands by area, the bottom) can now be edited in the Supports tab:

- the sizes for each zone, with a picture of each size;
- the bracing pattern for the bottom, the middle and the top of the trunks;
- how small an island may be ignored;
- how far down to look for the plate.

## Still to come

- Moving parts with the arrows of the move gizmo, with snapping.
- Moving a branch by its body.
- Merging two trunks.
- Picking braces on their own.
