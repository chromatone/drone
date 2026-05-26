import { Frequency, Synth, PanVol, gainToDb, LFO, Meter, Filter, AutoFilter, Chorus } from "tone";
import { reactive, computed, shallowReactive, onBeforeUnmount, watch } from 'vue'
import { useClamp } from "@vueuse/math";
import { useStorage } from "@vueuse/core";
import { pitchColor } from "./calculations";
import { drone, audio, initAudio, registerVoiceMeter, unregisterVoiceMeter } from "./useDrone";

let voiceCount = 0;

export function useVoice(interval) {
  const va = shallowReactive({});
  const voiceId = { voice: null };

  const voice = reactive({
    play: false,
    active: interval === 0 ? true : false,
    vol: useClamp(useStorage(`drone-${interval}-vol`, 0.8), 0.01, 1),
    pan: useClamp(useStorage(`drone-${interval}-pan`, 0), -1, 1),
    filterFreq: useClamp(useStorage(`drone-${interval}-filterFreq`, 16000), 100, 16000),
    filterQ: useClamp(useStorage(`drone-${interval}-filterQ`, 0), 0, 20),
    afFreq: useClamp(useStorage(`drone-${interval}-afFreq`, 0.1), 0.1, 10),
    afDepth: useClamp(useStorage(`drone-${interval}-afDepth`, 0), 0, 1),
    chorusRate: useClamp(useStorage(`drone-${interval}-chorusRate`, 0.1), 0.1, 10),
    chorusDepth: useClamp(useStorage(`drone-${interval}-chorusDepth`, 0), 0, 1),
    freq: computed(() => drone.freq * Math.pow(2, interval / 12)),
    note: computed(() => Frequency(voice.freq).toNote()),
    color: computed(() => pitchColor(Frequency(voice.freq).toMidi() - 9, 2)),
    lfo: 0,
  });

  voiceId.voice = voice;
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
    va.meter = new Meter({ normalRange: true });

    va.panner = new PanVol({ volume: gainToDb(drone.volume) }).connect(audio.gain);

    // Pan: base value on AudioParam, LFO adds on top additively
    va.panner.pan.value = voice.pan;
    va.lfoPan = new LFO(Math.random() * 0.5 + 0.01, -0.25, 0.25)
      .connect(va.panner.pan)
      .start();

    va.lfoVol = new LFO(Math.random() * 0.1 + 0.001, -20, 0)
      .connect(va.panner.volume)
      .connect(va.meter)
      .start();

    va.chorus = new Chorus({
      frequency: voice.chorusRate,
      depth: voice.chorusDepth,
      spread: 180,
      wet: voice.chorusDepth > 0 ? 0.5 : 0,
    }).connect(va.panner).start();

    va.autoFilter = new AutoFilter({
      frequency: voice.afFreq,
      depth: voice.afDepth,
    }).connect(va.chorus).start();

    va.filter = new Filter(voice.filterFreq, 'lowpass').connect(va.autoFilter);
    va.filter.Q.value = voice.filterQ;

    va.synth = new Synth({
      envelope: { attack: 2, sustain: 1, release: 4 },
      oscillator: { type: "sawtooth32" },
      volume: gainToDb(voice.vol) - 10,
    }).connect(va.filter);
  }

  function mount() {
    watch(() => voice.freq, (freq) => {
      va.synth.frequency.targetRampTo(freq);
    });
    watch(() => voice.vol, (vol) => {
      va.synth.volume.exponentialRampTo(gainToDb(vol) - 10, 1);
    });
    watch(() => voice.pan, (pan) => {
      va.panner.pan.targetRampTo(pan, 0.1);
    });
    watch(() => voice.filterFreq, (freq) => {
      va.filter.frequency.targetRampTo(freq, 0.1);
    });
    watch(() => voice.filterQ, (q) => {
      va.filter.Q.targetRampTo(q, 0.1);
    });
    watch(() => voice.afFreq, (freq) => {
      va.autoFilter.frequency.value = freq;
    });
    watch(() => voice.afDepth, (depth) => {
      va.autoFilter.depth.value = depth;
    });
    watch(() => voice.chorusRate, (rate) => {
      va.chorus.frequency.value = rate;
    });
    watch(() => voice.chorusDepth, (depth) => {
      va.chorus.depth = depth;
      va.chorus.wet.value = depth > 0 ? 0.5 : 0;
    });
    registerVoiceMeter(voiceId, va.meter);
  }

  onBeforeUnmount(() => {
    if (va.synth) va.synth.triggerRelease();
    unregisterVoiceMeter(voiceId);
  });

  return voice;
}
