---
title: "Your work is never the experiment"
summary: "Autosave, crash recovery, previous versions, repairs that keep your supports, and a diagnostics export that never sends anything on its own. The parts of a slicer nobody notices until they are missing."
slug: never-lose-work
date: 2026-11-07
kind: note
tags: [projects, reliability, privacy]
draft: false
---

Our main goal is to be the best slicer there is, and to optimise everything, down to the millisecond. One rule sits above that goal: **speed never risks the user's file.** This note collects the work that only matters on a bad day.

## Autosave and recovery

Every two minutes, if there are unsaved changes, Breadslicer writes the scene in the background, never in the middle of a drag, to its own folder (never next to your file). Each running copy of the app has its own folder, locked while it runs, so two windows never overwrite each other's autosave.

If Breadslicer closes without saving (a crash, a power cut, the task manager), the next start offers to bring every window back, each pointing at its original file and marked unsaved, so Ctrl+S saves where you expect. Leftovers older than 30 days are cleaned up on their own.

## Previous versions

Saving over a `.bread` project keeps the version you are replacing: up to 10 per project, 1 GB in total. *File › Previous versions…* opens one as your project, marked unsaved, so you decide whether to save it back.

## Repairs that keep your supports

Repairing a mesh changes it a little: a crack welded, three faces dropped. Before, that silently made the supports of the model out of date, and saving wrote them as a fixed mesh you could no longer edit. Now Repair redraws each support set on the repaired model, as long as every tip still lands within 0.02 mm of the surface. If one does not, a card says which model's supports went out of date and offers to *Recalculate* them keeping your hand edits, or *Regenerate*.

When slicing refuses a model because its mesh is broken, the card that says so has a **Repair** button that repairs only the refused models and slices again.

## Projects that open the same way

Projects are saved as `.bread`, a format we are publishing as an open lossless replacement for STL ([bread.synrgs.tech](https://bread.synrgs.tech)). Supports are stored as data, not as a mesh, so they open editable; hollows keep their original model and settings; and copies of one model store its geometry once. A project saved, reopened and saved again comes out byte for byte the same.

Saving a 3MF of a huge sliced scene used to build the whole file in memory (up to 19 GB in one case) and could close the app. It is now written in parts to a temporary file and renamed into place at the end, so a full disk or a crash leaves your previous file untouched.

## Diagnostics that stay yours

*Help › Export Diagnostics…* builds a zip that helps us understand a problem: system information, scene statistics (numbers only), recent events and logs. Every line passes through a scrubber that removes your user name and folder paths. Including the scene itself is a separate checkbox, off by default.

An optional diagnostic log can record a session in more detail. Turning it on asks first, lasts until you close the app, and is off again on the next start. **Nothing is ever sent on its own**: we only see what you choose to send us.
