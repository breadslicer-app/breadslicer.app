---
title: "178 printers with a face, 807 resin profiles, and a setup card"
summary: "Picking a printer and a resin moved out of Preferences into a card over the main window, with a first-run setup. The library grew to 178 printers, each with its photo, and 807 resin profiles from the makers' own tables. Resins now know what they cost and how long your prints really take."
slug: printers-and-resins-two
date: 2026-11-21
kind: note
tags: [printers, resins, profiles]
draft: false
---

## Printer and resin, in one card

Choosing a printer and a resin used to live in Preferences, a window of its own. It is now a card over the main window, opened from the chip in the top bar:

- the printers, by brand, with search;
- the resins with settings for the printer you picked;
- a form for every setting of either, with **Save as mine** for a copy you can change.

The first time Breadslicer opens, the same card walks through three steps: your printer, your resin, and how you want the mouse to work. The control layouts are Breadslicer's own, a classic resin slicer layout (the default), and the layouts of three common CAD and 3D modelling programs.

A printer that is not in the list can be **added by hand**, starting from a copy of the closest one. Give it the screen resolution and either the pixel size or the plate size; the other one is worked out, and if you give both they must agree within 0.5 %.

## The library

- **Printers: 157 → 178.** Every one has a product photo now, except the generic machine. The Creality CT-005 Pro is gone from the list: it is the inner name of a filament printer.
- **Resin profiles: 308 → 807.** Only from tables the makers publish:
  - **Liqcreate:** 58 resins, 1,076 settings blocks, for 86 printers.
  - **Phrozen:** 80 resins (59 of Phrozen's own, 16 BASF Forward AM, 5 Loctite) for the Phrozen printers, read from Phrozen's public resin settings.
  - **Prusa:** 370 resins from 24 brands for the SL1 and SL1S, which Breadslicer can now slice for (`.sl1` and `.sl1s`).
  - **Creality:** the Halot X1 Neo and X1 Max.
- **Only what fits.** With a printer picked, only resins with settings for that printer are offered.
- **More imports.** Breadslicer now reads more of the machine and resin settings other slicers export, so the settings you already tuned come with you.
- **Provenance.** Every profile says where it came from: which profile it was made from, which file it was imported from, and when.

## What a print costs

Give a resin its price, the bottle's currency, whether it is sold by the millilitre or the gram, and how much you lose per print. The Slice tab then shows a **Cost** card with the cost of the plate and of each model on it, shared by volume.

## How long it really takes

Each export is written down: printer, layers and the estimate. Tell Breadslicer how long the print actually took, and after a few prints it fits two numbers per printer, time per layer and time per print. The estimate then says "± N min". A printer with no prints yet says its time is not calibrated.

## Layers in between

- **Transition layers.** The exposure steps down from the bottom layers to the normal ones over a number of transition layers. The number comes from the resin, or else from the printer, or else 5. File formats that cannot keep that ramp (CXDLP, CTB v2) say so under the format.
- **Adaptive layers.** Layer height can follow the model, thinner where its shape changes fast. Only CTB v3 and newer files store a height per layer, so the switch is offered only for them, in Slice, under Print.

## And

- Two calculators sit inside the forms: the resin form shows the light-off delay and the time per layer; the printer form shows the angle one pixel per layer gives at 0.05 mm.
- Spanish takes a decimal comma everywhere you type a number.
