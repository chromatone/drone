import { freqPitch, pitchFreq, pitchColor } from "./calculations";
import { Frequency, Synth, PanVol, gainToDb, LFO, Meter, Filter, Gain, AutoFilter } from "tone";
import { useRafFn, onKeyStroke } from "@vueuse/core";
import { reactive, computed, shallowReactive, onBeforeUnmount, watch } from 'vue'
import { useClamp } from "@vueuse/math";
import { useStorage } from "@vueuse/core";

export const drone = reactive({
  base: 55,
  freq: useClamp(useStorage("drone-freq", 110), 27.5, 440),
  started: false,
  stopped: true,
  filterFreq: useStorage("drone-filter-freq", 1000),
  filterQ: useStorage("drone-filter-q", 1),
  volume: useStorage("drone-vol", 0.5),
  autoFilterFrequency: useStorage("drone-autoFilter-freq", 1),
  autoFilterDepth: useStorage("drone-autoFilter-depth", 0.1),
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
  audio.filter = new Filter(drone.filterFreq).connect(audio.gain)
  audio.autoFilter = new AutoFilter({
    frequency: drone.autoFilterFrequency,
    depth: drone.autoFilterDepth,
  }).connect(audio.filter).start();
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
    watch(
      () => drone.filterFreq,
      (freq) => {
        audio.filter.frequency.targetRampTo(freq, 0.1);
      }
    );

    watch(
      () => drone.filterQ,
      (q) => {
        audio.filter.Q.targetRampTo(q, 0.1);
      }
    );

    watch(
      () => drone.autoFilterFrequency,
      (freq) => {
        audio.autoFilter.frequency.value = freq;
      }
    );

    watch(
      () => drone.autoFilterDepth,
      (depth) => {
        audio.autoFilter.depth.value = depth;
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