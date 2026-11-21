---
title: "Supports saved as data, rebuilt in a browser"
summary: "A .bread file does not store the support mesh: it stores what the supports are. A page outside Breadslicer now proves it, rebuilding every support of a real project piece by piece in about 30 ms and slicing it in the browser. And the format grew two chunks: roles and metadata."
slug: supports-as-data
date: 2026-11-21
kind: note
tags: [bread, file-format, supports]
draft: false
next: true
---

Breadslicer's `.bread` files keep supports as data, not as a mesh: where each tip touches the model, the trunks, the joints, the braces, the raft, and the sizes and settings they were made with. Opening a project rebuilds the supports from that, so they open editable, exactly as they were.

## Rebuilt outside Breadslicer

[synrgs.tech/ecosystem](https://synrgs.tech/ecosystem) now opens a real Breadslicer project in the browser: a Death Knight miniature by [MZ4250](https://mz4250.com/) (CC BY 4.0), oriented and supported in Breadslicer. The page:

1. reads the scene, with the model's orientation;
2. reads the support document of the file's supports chunk (version 2);
3. rebuilds every support from it, piece by piece: 81 bases, 81 trunks, 152 leaves, 243 braces and 349 tips, in about 30 ms;
4. slices each layer through the model and its supports.

The page shares no code with Breadslicer. It reads the file through the bread-format library's JavaScript binding and draws the supports from the data alone. That is the point of storing supports as data: a support you see in Breadslicer is something any program can rebuild, inspect or slice, not a pile of triangles. The page's code is open: [lib/ecosystem/supports.ts](https://github.com/SynrgStudio/portfolioweb/blob/main/lib/ecosystem/supports.ts) rebuilds the supports.

## Roles and metadata

bread-format 0.5.0, which Breadslicer now uses, adds two chunks.

- **Roles.** A leaf of the scene can say it holds supports or a raft. Breadslicer used to tell its supports and rafts apart by name, so a model whose file happened to call it "Supports" was taken for one. Now Breadslicer:
  - keeps a role on every mesh that is not a model, set where the mesh is made and when a project opens;
  - writes the roles to the file;
  - reads names only for files saved before roles existed, and opens those as it always did.
- **Metadata.** A file can carry a title, a description, the designer, a copyright line, a license, a source, a creation date, the program that made it, and a lasting id per part. Breadslicer keeps every entry when it saves a project again. An entry about a part follows that part; the entries of a part you deleted are dropped. Showing and editing them in the app comes later.

Files written by 0.5.0 without either chunk are byte for byte what 0.4.0 wrote, and older readers skip both chunks.
