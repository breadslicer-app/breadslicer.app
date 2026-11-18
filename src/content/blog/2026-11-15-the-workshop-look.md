---
title: "The workshop look: redesigning a slicer without adding a single feature"
summary: "How Breadslicer got its interface: an inventory of what clashed, three directions as mockups before any code, a plate drawn like a technical plan, and a scene where model, supports and selection finally look different."
slug: the-workshop-look
date: 2026-11-15
kind: note
tags: [design, interface]
draft: false
---

By early November Breadslicer did a lot, and it showed: two families of controls side by side, a preferences window that looked like a different program, amber used both for "this is the button to press" and for "something is wrong". Nothing was broken. It just did not look like one tool made by one hand.

The rule for the redesign was strict: **no new features**, and no hours spent on screens before we knew what they should look like.

## Inventory first

We started by photographing every tab and every preferences page in English and Spanish, from the app itself, rendered off-screen. Then we listed what clashed:

- 18 interface files used the toolkit's stock controls next to our own: grey drop-downs and blue checkboxes beside our buttons.
- Preferences and the profile dialogs did not use the theme at all.
- The accent colour meant both "action" and "warning".
- 65 colours were written by hand outside the theme.
- The main button, disabled, was unreadable on the Slice and Export panels.

## Three directions, as mockups

Before touching the app we drew the Prepare screen three ways, in plain HTML, with the real plate and a real model:

- **Toasted**: warm neutrals, amber only for the action, soft sections without boxes.
- **Workshop**: cool graphite, compact, numbers in a monospaced font, amber only for warnings and the active tool, a light primary button, and the plate drawn like a technical plan.
- **Crumb**: larger, rounder, cards and named tools, a light plate.

<figure class="duo">
  <img src="/blog/workshop-direction-toasted.webp" width="1442" height="842" alt="The Prepare screen in the Toasted direction: warm neutrals and soft sections" loading="lazy" decoding="async">
  <img src="/blog/workshop-direction-crumb.webp" width="1442" height="843" alt="The Prepare screen in the Crumb direction: larger, rounder controls and a light plate" loading="lazy" decoding="async">
  <figcaption>Two of the three mockups: Toasted and Crumb.</figcaption>
</figure>

Workshop won, mostly for the plate: a dark floor with a fine grid every 10 mm and a stronger line every 50 mm, rulers along the front and left edges, a bracketed build volume, and a FRONT label you can read from above and from below. We kept the warmth of the name in one place only: the bread.

<figure>
  <img src="/blog/workshop-direction-workshop.webp" width="1442" height="842" alt="The Prepare screen in the Workshop direction: graphite panels, monospaced numbers and the plate drawn like a technical plan" loading="lazy" decoding="async">
  <figcaption>Workshop, the mockup that won: the plate drawn like a technical plan.</figcaption>
</figure>

## Through the kit, not screen by screen

Every change went into the shared kit (theme tokens and controls), not into individual screens. We wrote our own checkbox, drop-down, text field, slider and progress bar with the same properties as the stock ones, so swapping them in was mechanical. Then every window, preferences and dialogs included, moved onto the kit. Message cards got one structure: an icon tile, a title, a body, and actions as rows, with Enter always doing the safe thing.

On Windows the app now draws its own title bar, with the window's own minimise, maximise and close, edges to resize, and the system shadow.

## Four steps

The tabs became four steps in print order: **Prepare · Hollow · Supports · Slice**. Export moved inside Slice: once the slice is up to date, the main button turns from *Slice* into *Export "Plate 1"*. A scene panel on the left lists plates and their objects, takes no room when closed, and only as much as it needs when open.

## A scene you can read

The 3D view had the same problem as the panels: model, supports and selection were all similar greys. We drew mockups of the scene too, then picked "Focus":

- the model in a warm grey, supports in a darker slate, lit from two sides with a soft rim;
- the selection keeps its colours and gets an amber outline;
- everything outside the selection, or off the active plate, dims to half.

<figure>
  <img src="/blog/workshop-scene-before.webp" width="1672" height="643" alt="Three supported miniatures in the old scene look: model and supports in similar greys" loading="lazy" decoding="async">
  <img src="/blog/workshop-scene-focus.webp" width="1672" height="642" alt="The same scene in the Focus look: warm model, darker supports, the selection outlined and the rest dimmed" loading="lazy" decoding="async">
  <figcaption>The same plate before (top) and in Focus (bottom).</figcaption>
</figure>

Text written on the plate (the FRONT label, ruler numbers, plate names you edit in place) is drawn from signed distance fields, so it stays sharp at any zoom instead of turning into blurry pixels.

## The support panel

The one place where we did add something visible is the support editor, because it was the hardest part of the app to understand. Each preset now shows **a live drawing of its support**, in 3D or as a section to scale on a 1 mm grid, with close-ups of the tip and the foot. Every dimension on the drawing is a field: hover it and that part lights up, drag it like a slider in Blender, or type a number. A small arrow puts any field back to its factory value.

<figure class="duo">
  <img src="/blog/support-drawing-3d.webp" width="612" height="480" alt="The live drawing of a support in 3D, with its dimensions as fields" loading="lazy" decoding="async">
  <img src="/blog/support-drawing-section.webp" width="612" height="480" alt="The same support as a section to scale on a 1 mm grid" loading="lazy" decoding="async">
  <figcaption>The support of a preset, in 3D and as a section to scale. Every number is a field.</figcaption>
</figure>

## What it cost

Most of the redesign was in small steps of a day or less, each with before and after pictures rendered by the test suite, so every change could be judged on the screen it touched. Apart from the support editor, no feature was added or removed.
