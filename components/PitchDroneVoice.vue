<script setup>
import { useVoice } from '../composables/useVoice'
import { ref } from 'vue'
import { useGesture } from '@vueuse/gesture'
import XYPad from './XYPad.vue'

const props = defineProps({
  interval: { type: Number, default: 0 },
})

const voice = useVoice(props.interval)

const cell = ref()

useGesture({
  onDrag(ev) {
    ev?.event?.preventDefault()
    if (ev.tap) {
      voice.play = !voice.play
      voice.active = voice.play
    }
  },
}, {
  domTarget: cell,
  eventOptions: { passive: false },
})
</script>

<template lang="pug">
.voice-cell(
  ref="cell"
  :style="{ borderColor: voice.play ? voice.color : '#3333' }"
)
  .grid-2x2
    XYPad.border-1.rounded-lg(
      :style="{ borderColor: voice.play ? voice.color : '#3333' }"
      v-model:x="voice.pan"
      v-model:y="voice.vol"
      :xMin="-1" :xMax="1"
      :yMin="0.01" :yMax="1"
      :yLog="true"
      xLabel="PAN" yLabel="VOL"
      :color="voice.color"
      :active="voice.play"
    )
    XYPad.border-1.rounded-lg(
      :style="{ borderColor: voice.play ? voice.color : '#3333' }"
      v-model:x="voice.filterFreq"
      v-model:y="voice.filterQ"
      :xMin="100" :xMax="16000"
      :xLog="true"
      :yMin="0" :yMax="20"
      xLabel="LP" yLabel="Q"
      :color="voice.color"
      :active="voice.play"
    )
    XYPad.border-1.rounded-lg(
      :style="{ borderColor: voice.play ? voice.color : '#3333' }"
      v-model:x="voice.afFreq"
      v-model:y="voice.afDepth"
      :xMin="0.1" :xMax="10"
      :xLog="true"
      :yMin="0" :yMax="1"
      xLabel="AF" yLabel="DEPTH"
      :color="voice.color"
      :active="voice.play"
    )
    XYPad.border-1.rounded-lg(
      :style="{ borderColor: voice.play ? voice.color : '#3333' }"
      v-model:x="voice.chorusRate"
      v-model:y="voice.chorusDepth"
      :xMin="0.1" :xMax="10"
      :xLog="true"
      :yMin="0" :yMax="1"
      xLabel="CHO" yLabel="DEPTH"
      :color="voice.color"
      :active="voice.play"
    )

  .note-label(:style="{ opacity: voice.play ? 0.9 : 0.35, color: voice.color }") {{ voice.note }}

  .lfo-bar(
    :style="{ height: voice.vol * 100 * voice.lfo + '%', backgroundColor: voice.color, opacity: voice.play ? 0.25 : 0 }"
  )
</template>

<style scoped>
.voice-cell {
  @apply p-2px relative rounded-xl border-4 touch-none cursor-pointer select-none flex items-stretch;
  overflow: visible;
  flex: 1;
}

.grid-2x2 {
  @apply grid w-full h-full;
  grid-template-columns: 1fr 1fr;
  grid-template-rows: 1fr 1fr;
  gap: 0.25em;
  /* background-color: #ffffff12; */
}

.grid-2x2>* {
  @apply bg-dark-900/40 overflow-visible;
}

.note-label {
  @apply absolute inset-0 flex items-center justify-center text-2xl font-bold pointer-events-none z-10;
}

.lfo-bar {
  @apply absolute left-0 right-0 bottom-0 pointer-events-none transition-none;
}
</style>