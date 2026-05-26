# Drone App — Code Bible

## Project Stack
- **Vue 3** (Composition API, `<script setup>`, no TypeScript)
- **Tone.js 15** — all audio synthesis and effects
- **VueUse** (`@vueuse/core`, `@vueuse/math`, `@vueuse/gesture`) — utilities, storage, gestures
- **UnoCSS** with `presetUno`, `presetIcons`, `presetTypography` — utility-first styling
- **Pug** templates — all `.vue` files use `lang="pug"`
- **PostCSS** scoped styles — `lang="postcss" scoped`
- **Vite 8** + `vite-plugin-singlefile` — single-file production build

---

## Reactive State Patterns

### Persistent user state
Always `useClamp(useStorage(...), min, max)` when a range exists:
```js
vol: useClamp(useStorage(`drone-${interval}-vol`, 0.8), 0, 1),
```
Plain `useStorage` when no clamping needed:
```js
filterFreq: useStorage("drone-filter-freq", 1000),
```

### Computed audio-derived values
Declared inline inside `reactive({})`:
```js
freq: computed(() => drone.freq * Math.pow(2, interval / 12)),
note: computed(() => Frequency(voice.freq).toNote()),
color: computed(() => pitchColor(Frequency(voice.freq).toMidi() - 9, 2)),
```

### Transient visual state
Plain primitives mutated by the RAF loop — not stored:
```js
lfo: 0,
```

---

## Audio Node Pattern (`va`)

- Audio nodes live in `va = shallowReactive({})` — shallow so Vue doesn't recurse into Tone.js internals
- **Lazily instantiated** — `setAudio()` is called only on first `voice.play = true`
- Audio parameters updated via `targetRampTo` / `exponentialRampTo` inside `watch()` — never set directly in RAF
- Tone.js `Signal` used when an LFO must oscillate around a user-set base value:
  ```js
  va.panSignal = new Signal(voice.pan);
  va.lfo.connect(va.panSignal); // LFO adds to base, not replaces it
  ```
- `onBeforeUnmount` always calls `triggerRelease()` and `unregisterVoiceMeter(voiceId)`

### Audio Chain (per voice)
```
Synth → voiceFilter → Distortion/FX → Chorus → AutoFilter → PanVol → audio.gain → destination
```

---

## Gesture Handling

All gestures use `@vueuse/gesture`:
```js
useGesture({ onDrag, onWheel }, {
  domTarget: ref,
  eventOptions: { passive: false }
})
```
- `ev.tap` inside `onDrag` — detects tap vs drag
- `ev.delta[x, y]` — raw delta per frame
- `ev.velocities` — used for wheel events (negate Y for natural scroll)
- Sensitivity constants: divide delta by a scalar (e.g. `/400` for fine, `/100` for coarse)

---

## Centralized RAF Loop

Single RAF in `useDrone.js` drives all voice meter reads:
```js
registerVoiceMeter(voiceId, va.meter)   // on audio init
unregisterVoiceMeter(voiceId)           // on unmount
```
RAF auto-starts when first voice registers, auto-stops when last unregisters.
The loop writes `voice.lfo = meter.getValue()` — this is the only RAF-driven mutation.

---

## Component Conventions

### Props
- `interval: Number` — voice identity key (semitone offset from root)
- XY pad: `xLabel`, `yLabel`, `xMin`, `xMax`, `yMin`, `yMax`, `xFixed`, `yFixed`

### Models
- Two separate `defineModel` props for XY pads:
  ```js
  const x = defineModel('x', { default: 0 })
  const y = defineModel('y', { default: 0.5 })
  ```
- Single `defineModel()` for unidimensional controls (ControlRotary)

### DOM refs for gestures
Always a named `ref()` passed to `domTarget`:
```js
const control = ref()
useGesture({ ... }, { domTarget: control })
```

---

## Layout & Visual

- Root app: `flex-col`, fills `100svh`, `overflow: hidden`, `overscroll-behavior: none`
- Voice grid: 3 rows × 3 voices, each `PitchDroneVoice` is `flex-1`
- Voice cell: `2×2 grid` of XY pads, note label as inert semi-transparent center overlay
- Border and background driven by `voice.color` (= `pitchColor(midi - 9, 2)`)
- Active opacity `1`, inactive `0.2`–`0.6`
- `touch-action: none` on all gesture targets

---

## State Storage Keys

| Key | Default | Description |
|-----|---------|-------------|
| `drone-freq` | 110 | Root frequency Hz |
| `drone-vol` | 0.5 | Master gain |
| `drone-${interval}-vol` | 0.8 | Voice volume |
| `drone-${interval}-pan` | 0 | Voice pan center |
| `drone-${interval}-filterFreq` | 16000 | Voice LP filter cutoff (default open) |
| `drone-${interval}-filterQ` | 0 | Voice LP filter Q (default flat) |
| `drone-${interval}-afFreq` | 0.1 | Voice autofilter LFO rate (default min) |
| `drone-${interval}-afDepth` | 0 | Voice autofilter LFO depth (default off) |
| `drone-${interval}-chorusRate` | 0.1 | Voice chorus LFO rate (default min) |
| `drone-${interval}-chorusDepth` | 0 | Voice chorus depth (default off) |

---

## File Structure

```
App.vue                      — root layout, pitch control, top bar
components/
  OverlaySplash.vue          — info/install overlay
  PitchDroneVoice.vue        — 2×2 XY pad grid, tap to toggle, voice label
  XYPad.vue                  — reusable XY gesture pad with visual feedback
  ControlRotary.vue          — legacy rotary knob (kept for global vol)
composables/
  useDrone.js                — global drone state, audio.gain, RAF registry
  useVoice.js                — per-voice state + full audio chain
  calculations.js            — pure math: pitchFreq, pitchColor, freqPitch, etc.
```
