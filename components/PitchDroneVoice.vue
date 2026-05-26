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
    XYPad(
      v-model:x="voice.pan"
      v-model:y="voice.vol"
      :xMin="-1" :xMax="1"
      :yMin="0.01" :yMax="1"
      :yLog="true"
      xLabel="PAN" yLabel="VOL"
      :color="voice.color"
      :active="voice.play"
    )
    XYPad(
      v-model:x="voice.filterQ"
      v-model:y="voice.filterFreq"
      :xMin="0" :xMax="20"
      :yMin="100" :yMax="16000"
      :yLog="true"
      xLabel="Q" yLabel="LP"
      :color="voice.color"
      :active="voice.play"
    )
    XYPad(
      v-model:x="voice.afDepth"
      v-model:y="voice.afFreq"
      :xMin="0" :xMax="1"
      :yMin="0.1" :yMax="10"
      :yLog="true"
      xLabel="DEPTH" yLabel="AF"
      :color="voice.color"
      :active="voice.play"
    )
    XYPad(
      v-model:x="voice.chorusDepth"
      v-model:y="voice.chorusRate"
      :xMin="0" :xMax="1"
      :yMin="0.1" :yMax="10"
      :yLog="true"
      xLabel="DEPTH" yLabel="CHO"
      :color="voice.color"
      :active="voice.play"
    )

  .note-label(:style="{ opacity: voice.play ? 0.9 : 0.35, color: voice.color }") {{ voice.note }}

  .lfo-bar(
    :style="{ height: voice.vol * 100 * voice.lfo + '%', backgroundColor: voice.color, opacity: voice.play ? 0.25 : 0 }"
  )
</template>

<style lang="postcss" scoped>
.voice-cell {
  @apply relative rounded-xl border-4 touch-none cursor-pointer select-none flex items-stretch;
  overflow: visible;
  flex: 1;
}

.grid-2x2 {
  @apply grid w-full h-full rounded-lg;
  grid-template-columns: 1fr 1fr;
  grid-template-rows: 1fr 1fr;
  gap: 3px;
  background-color: #ffffff12;
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