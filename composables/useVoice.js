import { Frequency, Synth, PanVol, gainToDb, LFO, Meter } from "tone";
import { useRafFn } from "@vueuse/core";
import { reactive, computed, shallowReactive, onBeforeUnmount, watch } from 'vue'
import { useClamp } from "@vueuse/math";
import { useStorage } from "@vueuse/core";
import { pitchColor } from "./calculations";
import { drone, audio, initAudio } from "./useDrone";  // <-- direct import

let voiceCount = 0;

export function useVoice(interval) {
  const va = shallowReactive({});

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

  voiceCount += 2;

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
    }).connect(audio.autoFilter);

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
