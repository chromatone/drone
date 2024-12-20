import { freqPitch, pitchFreq, pitchColor } from "./calculations";
import { Frequency, Synth, PanVol, gainToDb, LFO, Meter, Filter, Gain } from "tone";
import { useRafFn, onKeyStroke } from "@vueuse/core";
import { reactive, computed, shallowReactive, onBeforeUnmount, watch } from 'vue'
import { useClamp } from "@vueuse/math";
import { useStorage } from "@vueuse/core";

const drone = reactive({
  base: 55,
  freq: useClamp(useStorage("drone-freq", 110), 27.5, 220),
  started: false,
  stopped: true,
  filterFreq: useStorage("drone-filter-freq", 1000),
  filterQ: useStorage("drone-filter-q", 1),
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

const audio = shallowReactive({
  initiated: false,
});

function initAudio() {
  audio.gain = new Gain(drone.volume).toDestination()
  audio.filter = new Filter(drone.filterFreq).connect(audio.gain)
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

  }


  return drone;
}

let voiceCount = 0


//ONE VOICE

export function useVoice(interval) {
  const va = shallowReactive({})

  const voice = reactive({
    play: false,
    active: interval === 0 ? true : false,
    vol: useClamp(useStorage(`drone-${interval}-vol`, 0.8), 0, 1),
    pan: useClamp(useStorage(`drone-${interval}-pan`, 0), -1, 1),
    freq: computed(() => drone.freq * Math.pow(2, interval / 12)),
    note: computed(() => Frequency(voice.freq).toNote()),
    color: computed(() => pitchColor(Frequency(voice.freq).toMidi() - 9, 2)),
    lfo: 0,
    panning: 0,
  });



  voiceCount += 2


  watch(
    () => drone.stopped,
    (stop) => {
      if (stop) { voice.play = false }
      else if (voice.active) { voice.play = true }
    }
  );

  watch(
    () => voice.play,
    (play) => {
      if (!play) {
        if (va.synth) {
          va.synth.triggerRelease();
        }
      } else {
        if (!va.synth) {
          if (!audio.initiated) {
            initAudio();
            audio.initiated = true;
            drone.started = true;
          }
          setAudio();
          mount();
        }
        voice.active = true;
        drone.stopped = false;
        va.synth.triggerAttack(voice.freq);
      }
    }
  );

  function setAudio() {
    va.meter = new Meter({
      normalRange: true,
    });

    va.panner = new PanVol({
      volume: gainToDb(drone.volume),
    }).connect(audio.filter);

    va.lfo = new LFO(Math.random() * 0.5 + 0.01, -0.25, 0.25)
      .connect(va.panner.pan)
      .start();

    va.lfoVol = new LFO(Math.random() * 0.1 + 0.001, -20, 0)
      .connect(va.panner.volume)
      .connect(va.meter)
      .start();

    va.synth = new Synth({
      envelope: {
        attack: 2,
        sustain: 1,
        release: 4,
      },
      oscillator: {
        type: "sawtooth32",
      },
      volume: gainToDb(voice.vol) - 10,
    }).connect(va.panner);

  }

  function mount() {
    watch(
      () => voice.freq,
      (freq) => {
        va.synth.frequency.targetRampTo(freq);
      }
    );
    watch(
      () => voice.vol,
      (vol) => {
        va.synth.volume.exponentialRampTo(gainToDb(vol) - 10, 1);
      }
    );
    watch(
      () => voice.pan,
      (pan) => {
        va.panner.pan.targetRampTo(pan, 1);
      }
    );
    useRafFn(() => {
      voice.lfo = va.meter.getValue();
    });
  }

  onBeforeUnmount(() => {
    if (va.synth) va.synth.triggerRelease();
  });

  return voice;
}


function getStandardFrequency(pitch, base = drone.base) {
  return base * Math.pow(2, pitch / 12);
}

function getCents(freq, pitch = 0) {
  return Math.floor(
    (1200 * Math.log(freq / getStandardFrequency(pitch))) / Math.log(2)
  );
}