---
title: "Two more minis per plate: a separator for Arrange"
summary: "Arrange and Fill bed now finish with a pass that pushes in what did not fit and moves the neighbours aside until nothing overlaps. On a pre-supported miniature, Fill bed goes from 18 to 20 copies, and the search that made it slow went from 13.2 s to 1.7 s."
slug: arrange-denser
date: 2026-11-18
kind: paper
tags: [arrange, performance]
draft: false
---

Arrange packs models by their real shape, height band by height band, so that an arm can reach over a shorter model as long as the two never come closer than the gap ([how it works](/blog/plates-arrange-one-raft/)). It searched for a place for each model in turn, from the biggest to the smallest, and stopped when one did not fit. That leaves holes a person would fill by hand.

## The separator

After the search, a new pass tries again with what was left out. It puts the next model in anyway, overlapping, and then moves the models around it a little at a time until no two overlap:

- It works on the same height masks as the search, merged into 4 height bands so each test is cheap.
- Each move is checked again on the fine footprint before it is kept.
- It runs for up to 30 rounds, with 16 tries each from fixed seeds. The first try that works wins, so the same scene always gives the same result.
- It goes from the smallest model left to the biggest, and stops at the first one that does not fit.

Fill bed uses it for each copy after the last one the search placed.

On a pre-supported Dragonborn Wizard on an Anycubic Photon Mono M7 Pro:

| | Before | After |
|---|---|---|
| Fill bed | 18 copies | 20 copies, 1.7 s |
| Arrange all, 40 copies | 3 plates | 2 plates |
| Mixed plates | | 1 to 2 more models on the first plate |

With 120 rounds instead of 30 it reaches 21 copies per plate, in about 5 s. We kept 30.

## Where the time went

A real project, a miniature under one raft for all, took 27.9 s to fill. We measured it by stages:

- about 6 s drawing the supports each copy is going to have;
- 13 s searching for the densest lattice of copies;
- 5 s in the separator.

The lattice search tried every grid on the full footprint and the full plate. It now works on both merged into 4 bands, and goes from **13.2 s to 1.7 s with the same copies**. The supports a model is going to have are now drawn in the background while the scene is still, so they are usually ready before you press the button.

## What we measured with

A bench test copies a real model onto a plate as many times as Arrange and Fill bed will take, records the copies per plate and the time, and can save the layout as an image. It runs on any STL and on the sets of models we keep for this, so every change to Arrange is compared on the same scenes.
