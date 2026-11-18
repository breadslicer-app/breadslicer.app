---
title: "Our first print, and the last layer that froze the printer"
summary: "The first model sliced by Breadslicer came out perfect, in the exact spot on the plate, and then the printer hung on its final layer. How we found out why, with short test prints instead of guesses."
slug: first-print
date: 2026-10-31
kind: note
tags: [printing, file-formats, anycubic]
draft: false
---

On 30 October 2026 a resin printer ran a file written by Breadslicer for the first time. The model was a public resin test piece, repaired in Breadslicer, on an Anycubic Photon Mono M7 Pro. It came out clean, with every detail, and exactly where we had placed it on the plate: the bottom right corner, the corner we had just fixed.

Then the printer stopped on layer 405 of 405 and never finished. The Stop button did nothing. It had to be switched off at the wall.

## Where the model lands on the plate

The part that worked first. A day earlier we had compared our file with the slicer's own scene and found that every layer we wrote was **turned half a turn**: the plate's front was at the back. Nothing looked wrong on screen, and a model in the middle of the plate prints the same either way, which is how it went unnoticed. A model in a corner, or text, does not.

The cause was the order in which rows and columns of each layer image were written, chosen once for one printer and reused for all. Every layer now starts from the front of the plate (−Y) and its +X side, and only then applies the mirroring each printer needs. After the fix our layer images for a test miniature match the reference scene on 99.8 % of the pixels; the remaining 0.2 % are edge pixels where two rasterisers round differently. The first print landed in the corner it was put in, which is the test that counts.

## The last layer

Our first guess was the obvious one. That build wrote one final layer with **no lit pixels at all**, a leftover of how the layer count was rounded. We checked how UVtools handles such a layer: it writes it byte for byte the same way we did, but UVtools never *creates* one; its own tools put a single grey placeholder pixel in an otherwise empty layer "to ensure the correct handling by the firmware". So we stopped writing dark top layers, put a placeholder pixel in any empty layer in the middle of a print, and sent a new file.

It froze again, on layer 403 of 404, with 25 seconds to go.

The empty layer was not the cause, or not the only one. Files written by two other slicers for the same model, which also end on an empty layer, finish fine on the same printer. Guessing again would have cost another 40-minute print per guess.

## Short prints instead of guesses

We wrote a set of seven tiny test files: a 5 × 5 × 0.7 mm square, 14 layers, a few minutes each. Each one changed a single thing in the file's header and layer table, compared with our original:

1. our file as it was;
2. every field set the way the printer maker's own software writes it;
3. only the "per-layer parameters" flag turned off;
4. only one reserved field in the layer definitions set to zero;
5. only the model's Z position written as the maker's file does;
6. the two-stage lift settings as the maker's file has them;
7. only the ZIP container written the same way.

Number 2, everything the way the maker's software writes it, finished 14 of 14 layers, and the remaining time shown by the printer was right from the first layer. From there we kept every difference where the two reference files agreed with each other and disagreed with us: per-layer parameters only when the layers really differ from the printer's own ramp, the lift always written as two stages, the raster settings of the machine, the minimum planner speed, the order of the temperature curve, and a ZIP written as a stream with data descriptors. All of it lives in the writer as constants; no printer profile changed.

A new short print with the rewritten writer finished. So did the full model, 404 of 404 layers.

## What we kept from it

- **The plate orientation is pinned by tests**, so it cannot quietly turn again.
- **Every format reads back in UVtools**, layer by layer and header by header, in the test suite. It does not prove the firmware is happy, which is why the first print on a printer still deserves attention, and why our release notes say so.
- **Test prints are cheap when they are small.** Seven files of 14 layers told us more in an afternoon than reading headers for two days.

The fix shipped for all six Anycubic ZIP formats, not only the M7 Pro's.
