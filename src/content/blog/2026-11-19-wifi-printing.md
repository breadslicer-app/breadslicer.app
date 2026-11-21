---
title: "Sending a print over Wi-Fi: from 11 minutes to 16 seconds"
summary: "Breadslicer now sends prints to Elegoo printers over the network, shows their cameras, and remembers each printer by a name of yours. The first version took 11 minutes to send one file. This is how it got to 16 seconds, and what the printer's camera board taught us."
slug: wifi-printing
date: 2026-11-19
kind: paper
tags: [printing, network, camera]
draft: false
next: true
---

Until this week, Breadslicer did not send anything over the network: you exported a file and carried it to the printer on a USB stick. Elegoo's network printers speak a documented protocol, SDCP, and other slicers already send to them, so the Slice tab now has a **Send to printer** card for any printer whose profile says it speaks SDCP.

We do not own an Elegoo printer. Everything below was built against a fake printer running inside our tests, and tried for real by a tester with a Mars 5 Ultra.

## What the card does

- **Find the printer.** It searches the network by itself when the card shows (a UDP broadcast on port 3000 to every network interface), and you can search again or type an address by hand.
- **Name the file.** Before sending, the card asks the name the file will have on the printer, starting from the project's name, and shows it as the printer's firmware will take it.
- **Send, or send and start.** Two buttons, on purpose: nothing starts printing unless you ask for it.
- **Watch it go.** It shows progress, lets you cancel, and keeps the printer used last at the top of the list.

The file sent is exactly the one Export would write, built the same way.

<figure class="narrow">
  <img src="/blog/send-to-printer-card.webp" width="330" height="780" alt="The Send to printer card: a saved printer, its profile and resin, a warning that the plate was sliced for another printer, and the camera and send buttons" loading="lazy" decoding="async">
  <figcaption>The Send to printer card, with a saved printer and the warning that the plate was sliced for another one.</figcaption>
</figure>

## 11 minutes

The tester's first send worked, and took 11 minutes for one file.

The printer takes a file in pieces of 1 MiB, each one an HTTP upload. Our upload read the printer's answer until the connection closed, and the Mars 5 Ultra never closes it. So every piece waited for our 20 s timeout before the next one went. The fix was to read the answer up to its declared length, or its last chunk, and send each piece in a single write with Nagle's algorithm off.

The next try took 3.5 minutes, about 160 KB/s.

## Pieces in order, one connection

The obvious next step was to send pieces in parallel. We built it: four connections, with MD5 checks, the last piece held until the end. It made no difference. The printer refuses pieces that arrive out of order (OpenCentauri's public notes on the protocol list the error, "Offset not match"), so every send fell back to one piece at a time.

What did help was to keep one connection open for all the pieces, reconnecting only if the printer drops it, and to stop computing a checksum the printer does not ask for. The card now also says what it is doing while the file is being written, before the upload starts, instead of sitting still.

The tester's line after that build: **"File written in 0 s, sent in 16 s, 1.61 MB/s."**

## The camera

The Mars 5 Ultra and the Saturn 4 Ultra have a camera. The card can now show it in a small frame, and the frame can be enlarged to the whole window. A **printer wall** shows every network printer at once, each with its name, its state and its camera.

The video is H.264 over RTSP. We read it with retina, a Rust RTSP library, and decode it with OpenH264. The printer's board needed three changes before a single frame showed, each found from the tester's logs:

1. **UDP only.** The board refuses to send the video interleaved in the TCP connection, the way most clients ask first. We now ask for UDP first and fall back to TCP.
2. **An empty header.** The board answers PLAY with an `RTP-Info` header that has nothing in it, which the library rejects. We carry a copy of retina with a parser that skips empty lines and empty headers.
3. **Start codes inside RTP.** The board puts an Annex B start code at the front of every NAL unit inside the RTP packets, which RTP does not expect. The copy skips it.

The board also keeps a fixed small number of video slots, and a slot left open by a client that vanished stays taken until the printer restarts. Breadslicer now remembers its session ids and, if one was left behind, closes it from a new connection before watching again.

## Your printers, by your names

With two printers of the same model on one network, the names they report do not help. Each printer can now be given a name of your own, the printer profile it is, the resin it is kept for and a note. It is recognised by its mainboard id, so it keeps all of that when its IP address changes.

- The card lists the saved printers first.
- If the plate was sliced for another profile than the printer's, the card warns before sending, and the button reads **Send anyway**.
- **Slice for this printer** puts the printer's profile and resin in use.
- Preferences has a page listing every network printer, to edit or forget them.

## Printers that tilt their vat

The Mars 5 Ultra, the Saturn 4 Ultra and the Saturn 4 Ultra 16K tilt the vat to peel a layer instead of lifting the plate high. Their profiles now say so. After the base layers, Breadslicer writes no lift: the plate rises only the layer height while the vat tilts. The print time counts 0.8 s of tilt per layer until we have a measured time from a tester.
