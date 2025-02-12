<script setup>
import { reactive, ref } from 'vue'
import { useGesture } from '@vueuse/gesture'
import { pitchColor } from "./calculations"
import { useDrone } from "./useDrone"
import PitchDroneVoice from './PitchDroneVoice.vue'
import ControlRotary from './ControlRotary.vue'

const notes = ['A', 'A#', 'B', 'C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#']

const drone = useDrone()

const intervals = reactive({
  fifths: {
    title: "5P",
    voices: [7, 19, 31],
  },
  octave: {
    title: "8P",
    voices: [-12, 0, 12],
  },
  fourths: {
    title: "4P",
    voices: [5, 17, 29],
  },
})

const info = ref(true)

const pitchControl = ref()

useGesture({
  onDrag(ev) {
    ev?.event?.preventDefault()
    drone.freq += ev.delta[0] / 10;
  },
  onWheel(ev) {
    ev?.event?.preventDefault()
    drone.freq -= ev.velocities[0] / 10;
  }
}, {
  domTarget: pitchControl,
  eventOptions: { passive: false }
})
</script>

<template lang="pug">
.flex.flex-col.items-stretch.transition-all.duration-500.ease-out.select-none.rounded-8.shadow-xl.border-8.p-1.w-full.h-full(
  :style="{ borderColor: pitchColor(drone.pitch, 2), backgroundColor: pitchColor(drone.pitch, 3, 0.2, 0.8) }")
  .absolute.top-8.left-8.right-8.bottom-8.rounded-xl.p-4.bg-light-900.bg-op-80.backdrop-blur-md.flex.flex-col.gap-4.z-10000.overflow-y-scroll.overscroll-none.shadow-xl(v-if="info")
    .flex.flex-col.gap-1.sticky.top-0.bg-light-400.rounded-xl.p-2.bg-op-80.backdrop-blur-md.z-100
      a.flex.items-center.no-underline.gap-2
        img.w-12(src="/logo.svg" alt="Chromatone logo")
        .text-2xl.font-bold Chromatone
      .text-6xl Drone
      .text-xl Synth tanpura / shruti box
    .text-md Rich harmonic soundscape synthesizer for music practice, chanting and meditation
    .text-sm You choose the pitch and the app enables you to play rich sound of 3 octaves, 3 fifths and 3 fourths . The sound is generated with sawtooth oscillator synth and this gives the incredible amount of harmonic material to work with. Consider it as an electronic version of <a href="https://en.wikipedia.org/wiki/Tanpura" target="_blank">Indian tanpura</a> or a free online <a href="https://en.wikipedia.org/wiki/Shruti_box" target="_blank">shruti box</a>.
    .text-xs.flex-1.gap-2.flex.flex-col.gap-2
      .text-xl How to use the drone web-app
      ol.flex.flex-col.gap-2.list-decimal.list-inside
        li Choose the root note – the Sa note of the performance – either by tapping on the note name at the bottom, or by dragging the colored note section with your mouse or touch. With it you can adjust and finetune the exact frequency you need to play. This section shows the note as well as cents difference with the pure 12-TET tone and with the A2 note. And also there's the exact frequency in Hz.
        li Next tap the note rectangles to turn the sound on. The bottom row holds the root note in 3 lower octaves to create a deep base for the sound. The top row consists of three pads of the higher fifth intervals of that base frequency.
        li Drag each of the pads up and down to set the maximum level of that note. Each note has a random speed LFO, that is modulating its volume from 0 to this upper limit. Reload the page to get a new LFO speed composition.
        li Drag each pad horizontally to set the middle point for the slow;y moving panning of the voice.
        li Listen to the tone to evolve and breathe with harmonics. Try singing to it, tuning your instruments or just feeling the vibrations.
        li If it's too much of the high frequency content you can adjust it with the **LP** slider - it sets the frequency of the drone Low-pass filter.
        li Press **stop** button to mute the voices and press **play** to unmute them back. The **spacebar** key of your keyboard does exactly the same here.
    button.shadow-lg.hover-bg-dark-100.p-4.border-2.bg-dark-200.text-light-200.rounded-xl.sticky.bottom-0(@click="info = false; drone.stopped = false") Start

  .flex-1.justify-center.flex.flex-col
    .flex-1.flex.flex-col.gap-1
      .flex.flex-col.m-1.flex-1(
        v-for="interval in intervals" 
        :key="interval"
        )
        .flex.flex-wrap.flex-1
          pitch-drone-voice.m-2.flex-1(
            v-for="voice in interval.voices" 
            :key="voice"
            :interval="voice"
            )

    .my-4.flex.flex-wrap.justify-stretch.items-center.touch-none
      .flex.gap-2.border-2.flex-wrap.p-4.mx-2.flex-1.min-w-10em.items-center.rounded-2xl.text-white.p-2.cursor-pointer.transition-all.duration-500.ease-out.cursor-grab(
        style="flex: 1 1 400px"
        ref="pitchControl"
        :style="{ backgroundColor: drone.color }")
        .flex.w-full.items-center.gap-2
          .p-1.text-6xl.font-bold {{ drone.note }} 
          .flex.flex-col.text-md
            .p-0 {{ drone.centDiff }}%
            .p-0 {{ drone.freq.toFixed(2) }} Hz
          .m-auto
          button.p-3.border-2.rounded-2xl.text-3xl(@click="drone.stopped = !drone.stopped")
            .i-la-stop(v-if="!drone.stopped")
            .i-la-play(v-else)

        .notes.w-full.text-sm.font-bold.text-center.flex.flex-wrap.gap-1
          .p-2.flex-1.cursor-pointer.rounded-xl.text-white.border-0.border-light-400.border-op-60(
            v-for="(note, pitch) in notes" 
            :key="note"
            :style="{ backgroundColor: pitchColor(pitch, 3, drone.pitch == pitch ? 1 : 0.2, drone.pitch == pitch ? 1 : 0.4) }"
            @click="drone.pitch = pitch"
          ) {{ note }}


      .controls.min-w-10em.flex-1.my-2.p-2.flex.flex-wrap.items-center.justify-center.is-group.gap-2.text-white(
        style="flex: 1 1 40px"
        )
        .flex.gap-2.border-2.rounded-2xl.items-center.p-1
          control-rotary.w-4em(
            v-model="drone.volume" 
            :min="0" 
            :max="1" 
            :step="0.05" 
            param="VOL")
          button.p-2.text-2xl(@click="info = true")
            .i-la-info-circle
        .flex.gap-2.border-2.rounded-2xl.items-center.p-1
          control-rotary.w-4em(
            v-model="drone.filterFreq" 
            :min="55" 
            :max="12000" 
            :step="0.05" 
            :fixed="0" 
            param="LP")
          control-rotary.w-4em(
            v-model="drone.filterQ" 
            :min="0" 
            :max="40" 
            :step="0.05" 
            :fixed="1" 
            param="Q")
        .flex.gap-2.border-2.rounded-2xl.items-center.p-1
          control-rotary.w-4em(
            v-model="drone.autoFilterFrequency" 
            :min="0.1" 
            :max="10" 
            :step="0.1" 
            param="AF Freq")
          control-rotary.w-4em(
            v-model="drone.autoFilterDepth" 
            :min="0" 
            :max="1" 
            :step="0.05" 
            param="AF Depth")

</template>

<style lang="postcss">
#app {
  @apply w-full h-full p-1;
}

a {
  @apply underline;
}

body {
  @apply flex items-stretch justify-stretch h-100svh;
  background-color: black;
  width: 100%;
  min-width: 320px;
  min-height: 100vh;
  line-height: 1.3;
  font-family: "Commissioner", -apple-system, BlinkMacSystemFont, "Segoe UI",
    Roboto, Oxygen, Ubuntu, Cantarell, "Fira Sans", "Droid Sans",
    "Helvetica Neue", sans-serif;
  font-size: 1em;
  font-weight: 400;
  color: var(--c-text);
  direction: ltr;
  font-synthesis: none;
  text-rendering: optimizeLegibility;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  overscroll-behavior: none;
  overflow: hidden;
}
</style>
