# Audio Overview

The build now ships with procedurally generated WAV files under `public/audio/`:

- `ambient-hum.wav` — mid-body drone layer.
- `ambient-shimmer.wav` — whispery airy layer that sits above the hum.
- `ambient-grit.wav` — slow sand/rumble bed for depth.
- `wave-whoosh.wav` — gentle cue when a new enemy wave spawns.
- `enemy-hit.wav` — soft thud used for player attacks connecting.
- `player-hit.wav` — muted impact for the player taking damage.
- `upgrade-soft.wav` — smooth swell for upgrade menu open/confirm.
- `ui-soft-blip.wav` — subtle blip for menu interactions.
- `xp-pickup.wav` — light ping when collecting shards.

All files are produced locally by `scripts/generateAudio.js`, so nothing is downloaded from the internet. Run the script if you ever want to regenerate the assets or tweak their synthesis parameters:

```bash
node scripts/generateAudio.js
```

## Replacing the sounds

Replace any of the files in `public/audio/` with your own ambient material. Keep file names the same (or update the paths in `src/systems/audioManager.ts`). Stick to textures without percussion to avoid anything beat-driven. Suggested targets:

- Background loops: −26 to −20 LUFS integrated loudness, gentle low-pass ≥5 kHz.
- Wave cue: short (≤1.5 s) wide whoosh that stays under −16 LUFS.
- Enemy/player hits: ≤0.35 s, mostly mid/low energy with rounded attacks.
- Upgrade/UI confirmation: ≤0.6 s, airy and quiet (no melodic runs).
- UI blip / XP pick-up: ≤250 ms, soft attack.

If you prefer fully code-driven audio, adjust the synthesis functions inside `scripts/generateAudio.js` instead of dropping in external samples.

## Runtime behaviour

- Audio is routed through the Kaplay context so it respects pause/resume and global volume (`k.volume(0.6)`).
- Ambient sound is built from three constantly looping layers that fade between ~0.12–0.24 intensity depending on menus. They stay filtered so nothing feels percussive.
- Combat outcomes trigger very soft thuds: dagger/sword hits, player damage, XP shard pick-ups, and upgrade confirmations all use distinct cues.
- Wave spawns randomize speed and detune slightly so repeated cues do not feel repetitive.

You can fine-tune those behaviours inside `src/systems/audioManager.ts` if the mix needs more adjustment.
