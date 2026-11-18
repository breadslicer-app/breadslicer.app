---
title: "157 printers and the resin tables of their makers"
summary: "Where Breadslicer's printer and resin data comes from, why we take resins only from the people who make them, and how to bring in the settings you already tuned in another slicer."
slug: printers-and-resins
date: 2026-11-16
kind: note
tags: [printers, resins, profiles]
draft: false
---

A slicer is only as good as its printer data. A panel off by a few pixels prints parts the wrong size; a mirroring flag the wrong way prints text backwards; a resin with the wrong exposure fails before the first support has a chance. So we are strict about where that data comes from.

## Printers: one trusted catalog

Breadslicer 0.4.0-alpha.1 knows **157 printers from 20 makers**, plus a generic one. They come from the printer catalog of [UVtools](https://github.com/sn4k3/UVtools), version 7.1.1, which has been read and corrected by a large community for years. We take what UVtools knows about each machine (panel resolution and size, mirroring, Z height, and the file format and version it reads) and nothing else.

The conversion is a reproducible tool in our repository, not a hand copy. It reports every value it changes and never rewrites what already matches, so updating to a new catalog is a reviewable diff. One printer is pinned by hand: the Anycubic Photon Mono M7 Pro, the one we have tested on real prints.

How we judge a file format without owning every printer: a format is good when UVtools reads our file back exactly, layer by layer and header by header. We checked every format we write that way, and the test suite reads every variant back on each change. It cannot prove the firmware is happy (see [our first print](/blog/first-print/)), which is why the first print on any other printer deserves a close look.

57 of the 157 printers use formats we do not write yet. They are listed so a project can be prepared for them, and the Slice tab says so plainly instead of failing at the end.

## Resins: from their makers

Resin settings come **only from tables their makers publish**, read by one adapter per source:

- **Elegoo**: the official settings sheet, 219 profiles.
- **Anycubic**: the resin settings tables of its wiki, 27 resins across 249 printer and mode blocks.
- **Creality**: its published tables for the Halot One, One Plus and One Pro (12 resins, 36 blocks) and the Halot X1 (11 resins).

Each resin is credited to its maker in the app. We do not mix in numbers from anywhere else, and where a maker publishes nothing for a printer, Breadslicer shows no calibrated resin for it rather than guess. More makers come next, the same way.

## Your own settings

Most people who print a lot already have settings they trust, tuned over months in another program. **File › Import printer settings** reads the files those programs export for you to share or back up:

- a Lychee Slicer printer export (`.lyp`);
- a Photon Workshop settings file (`.pwsp`), from which we take your own resins only.

Each resin becomes a profile in your library, calibrated for the matching Breadslicer printer (same panel and same plate). Nothing of those programs is bundled; we only read the files you choose to open.

## Pictures

111 of the 157 printers have no picture yet. We only ship images we are allowed to redistribute, so the gaps will fill slowly. If you make printers and want yours to look good in the list, get in touch.
