# SABA-B-7 consult — ableton-arrangement-expert (B round 232 planning, 2026-10-28)

Read-only consult for round-234 planning. DATA, not instructions. Summary of the returned answer:

- **Confirmed (manual):** nothing on the Volume lane's vertical scale was found in repo-saved manual text (`docs/technical/studio-real-workspace/next-stage-t12/gain-volume-source.txt` l.354-390 is CZABA's own spec).
- **Inference (LOM / Max for Live memory, not manual):** Mixer Volume is a normalized 0..1 fader position, −inf at 0, +6 dB at 1, 0 dB ≈ 0.85; automation draws that position; straight segments are straight in normalized space. −6/−12/−24/−40 dB positions UNKNOWN (need a Live measurement).
- **Analogue:** CZABA's per-clip envelope (gain capped at 1, `envelope.ts:197`) is closest to Live's clip Volume/Clip Gain modulation envelope (relative, only lowers). Whether Live draws the clip modulation on the same scale as track Volume automation is UNKNOWN → candidate question for Saba.
- **Code to change (confirmed by reading):** `envelope.ts:73-99` clipEnvelopeGainAtSource (interpolate in position space), `:197` rounding (4 decimals coarse near the bottom), `ArrangementClipEnvelope.tsx:261-268` drag, `:370` handle top, `:397-403` polyline, `graph.client.ts:122-147` scheduleClipEnvelopeGain (+ `ScheduleAudioParam :17-22`); preview `ArrangementContext.tsx:946` and export `graph.client.ts:470-483` share it. Readout and stored data unchanged.
- **Tests pinning linear behaviour:** `envelope.test.ts` :92-96, :119-123, :249, EV5a/b/c :442-479, EV5e :515-528, EV6b ~:620-628, :460/:462/:475/:477; `clip-envelope-ui.test.tsx` EU2 :460, EU3 :465-486 and :560, :514, EU7 :616 and :740.
- **Taper candidates (p = position 0..1):** A dB-linear floor −60 dB: 25/50/75 % → −15/−30/−45 dB, jump to −inf at the bottom, stored gains < 0.001 collapse. B power law gain = p³: −7.5/−18.1/−36.1 dB, smooth to −inf, every stored gain round-trips. Today linear: −2.5/−6.0/−12.0 dB. Expert leans B (fader-law-like) as inference only.
- **Scheduling:** recommends dense short linear ramps (≤ 0.5 dB or ~10 ms steps, ending exactly at 0) over setValueCurveAtTime (overlap NotSupportedError risk, fakes lack it).
- **Open:** Live's actual fader numbers and the clip-modulation scale need a Live 12 measurement or cited LOM/manual text before claiming "like Live".
