import { freqPitch, pitchFreq, pitchColor } from "./calculations";
import { Frequency, Gain } from "tone";
import { useRafFn, onKeyStroke } from "@vueuse/core";
import { reactive, computed, shallowReactive, watch } from 'vue'
import { useClamp } from "@vueuse/math";
import { useStorage } from "@vueuse/core";

// ── Single app render loop ──
// One rAF drives all per-frame visual reads.
// Loop lives only while voices are registered;
// tears down automatically when the last voice unregisters.
const voiceMeters = new Map();
let rafCleanup = null;

export function registerVoiceMeter(voiceId, meter) {
  voiceMeters.set(voiceId, meter);
  if (!rafCleanup) startRenderLoop();
}

export function unregisterVoiceMeter(voiceId) {
  voiceMeters.delete(voiceId);
  if (voiceMeters.size === 0 && rafCleanup) {
    rafCleanup.pause();
    rafCleanup = null;
  }
}

function startRenderLoop() {
  rafCleanup = useRafFn(() => {
    for (const [voiceId, meter] of voiceMeters) {
      const voice = voiceId.voice;
      if (voice && meter) {
        voice.lfo = meter.getValue();
      }
    }
  });
}

export const drone = reactive({
  base: 55,
  freq: useClamp(useStorage("drone-freq", 110), 27.5, 440),
  started: false,
  stopped: true,
  volume: useStorage("drone-vol", 0.5),
  note: computed(() => Frequency(drone.freq).toNote()),
  pitch: computed({
    get() {
      return Math.round((freqPitch(drone.freq) + 72) % 12);
    },
    set(pitch) {
      drone.freq = pitchFreq(pitch - 36);
    },
  }),
  cents: computed(() => getCents(drone.freq) % 1200),
  centDiff: computed(() => drone.cents - drone.pitch * 100),
  color: computed(() => pitchColor(drone.pitch, 2)),
});

export const audio = shallowReactive({
  initiated: false,
});

export function initAudio() {
  audio.gain = new Gain(drone.volume).toDestination()
}

export function useDrone() {
  if (!audio.initiated) {
    initAudio();
    audio.initiated = true;
    drone.started = true;

    onKeyStroke(" ", (e) => {
      e.preventDefault();
      drone.stopped = !drone.stopped;
    });
    watch(
      () => drone.volume,
      (vol) => {
        audio.gain.gain.targetRampTo(vol, 1);
      }
    );

  }

  return {
    drone,
    audio,
    initAudio,
  };
}

function getStandardFrequency(pitch, base = drone.base) {
  return base * Math.pow(2, pitch / 12);
}

function getCents(freq, pitch = 0) {
  return Math.floor(
    (1200 * Math.log(freq / getStandardFrequency(pitch))) / Math.log(2)
  );
}