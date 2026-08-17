import { Frequency, Synth, PanVol, gainToDb, LFO, Meter, Filter, AutoFilter, Chorus, Distortion } from "tone";
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
        va.synth?.triggerRelease();
        // Fix #2: Silence the graph — disconnect from output, stop LFOs,
        // unregister from render loop so the audio thread can sleep.
        va.panner?.disconnect();
        va.lfoPan?.stop();
        va.lfoVol?.stop();
        unregisterVoiceMeter(voiceId);
      } else {
        if (!va.synth) {
          if (!audio.initiated) {
            initAudio();
            audio.initiated = true;
            drone.started = true;
          }
          setAudio();
          mount();
        } else {
          // Fix #2: Reconnect existing graph back to output
          va.panner.connect(audio.gain);
          va.lfoPan?.start();
          va.lfoVol?.start();
          registerVoiceMeter(voiceId, va.meter);
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

    // Fix #4: Chorus created lazily — only instantiated when depth > 0.
    // Default chain: autoFilter → panner (no chorus in path).
    va.chorus = null;

    va.autoFilter = new AutoFilter({
      frequency: voice.afFreq,
      depth: voice.afDepth,
      baseFrequency: voice.filterFreq,
      filter: {
        type: "lowpass",
        rolloff: -12,
        Q: voice.filterQ,
      },
      wet: voice.afDepth > 0 ? 0.5 : 0,
    }).connect(va.panner).start();

    va.filter = new Filter(voice.filterFreq, 'lowpass').connect(va.autoFilter);
    va.filter.Q.value = voice.filterQ;

    // Fix #3: 2 oscillators with wider spread, 2x oversample.
    // Cuts oscillator count 33% and oversample CPU 50%.
    va.saturation = new Distortion({
      distortion: 0.1,
      oversample: "2x"
    }).connect(va.autoFilter);

    va.synth = new Synth({
      envelope: { attack: 2, sustain: 1, release: 4 },
      oscillator: { type: "sawtooth", count: 2, spread: 20 },
      volume: gainToDb(voice.vol) - 10,
    }).connect(va.saturation);

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
      va.autoFilter.baseFrequency = freq;
    });
    watch(() => voice.filterQ, (q) => {
      va.filter.Q.targetRampTo(q, 0.1);
      va.autoFilter.filter.Q.targetRampTo(q, 0.1);
    });
    watch(() => voice.afFreq, (freq) => {
      va.autoFilter.frequency.value = freq;
    });
    watch(() => voice.afDepth, (depth) => {
      va.autoFilter.depth.value = depth;
    });

    // Fix #4: Lazy chorus — insert into chain on first nonzero depth,
    // dispose and bypass when depth returns to 0.
    watch(() => voice.chorusDepth, (depth) => {
      if (depth > 0 && !va.chorus) {
        // Insert: autoFilter → chorus → panner
        va.autoFilter.disconnect();
        va.chorus = new Chorus({
          frequency: voice.chorusRate,
          depth,
          spread: 180,
          wet: 0.5,
        }).connect(va.panner).start();
        va.autoFilter.connect(va.chorus);
      } else if (depth > 0 && va.chorus) {
        va.chorus.frequency.value = voice.chorusRate;
        va.chorus.depth = depth;
      } else if (depth === 0 && va.chorus) {
        // Remove: autoFilter → panner
        va.autoFilter.disconnect();
        va.chorus.dispose();
        va.chorus = null;
        va.autoFilter.connect(va.panner);
      }
    });

    watch(() => voice.chorusRate, (rate) => {
      if (va.chorus) va.chorus.frequency.value = rate;
    });

    registerVoiceMeter(voiceId, va.meter);
  }

  onBeforeUnmount(() => {
    va.synth?.triggerRelease();
    va.panner?.disconnect();
    va.lfoPan?.stop();
    va.lfoVol?.stop();
    va.chorus?.dispose();
    unregisterVoiceMeter(voiceId);
  });

  return voice;
}
