<script setup>
import { ref, computed } from 'vue'
import { useGesture } from '@vueuse/gesture'
import { useClamp } from '@vueuse/math'

const props = defineProps({
  xLabel: { type: String, default: 'X' },
  yLabel: { type: String, default: 'Y' },
  xMin: { type: Number, default: 0 },
  xMax: { type: Number, default: 1 },
  yMin: { type: Number, default: 0 },
  yMax: { type: Number, default: 1 },
  xFixed: { type: Number, default: 2 },
  yFixed: { type: Number, default: 2 },
  xLog: { type: Boolean, default: false },
  yLog: { type: Boolean, default: false },
  color: { type: String, default: '#ffffff' },
  active: { type: Boolean, default: true },
})

const x = defineModel('x', { default: 0 })
const y = defineModel('y', { default: 0.5 })

// Map 0-1 norm to value (log or linear)
function normToVal(norm, min, max, log) {
  if (log) return min * Math.pow(max / min, norm)
  return min + norm * (max - min)
}

// Map value to 0-1 norm (log or linear)
function valToNorm(val, min, max, log) {
  if (log) return Math.log(val / min) / Math.log(max / min)
  return (val - min) / (max - min)
}

// Apply a delta (in normalized 0-1 space) to a value
function applyDelta(val, delta, min, max, log) {
  const norm = valToNorm(val, min, max, log)
  return normToVal(Math.max(0, Math.min(1, norm + delta)), min, max, log)
}

const xNorm = computed(() => valToNorm(x.value, props.xMin, props.xMax, props.xLog))
const yNorm = computed(() => valToNorm(y.value, props.yMin, props.yMax, props.yLog))

const pad = ref()

useGesture({
  onDrag(ev) {
    ev?.event?.preventDefault()
    if (ev.tap) return
    x.value = applyDelta(x.value, ev.delta[0] / 200, props.xMin, props.xMax, props.xLog)
    y.value = applyDelta(y.value, -ev.delta[1] / 200, props.yMin, props.yMax, props.yLog)
  },
  onWheel(ev) {
    ev?.event?.preventDefault()
    x.value = applyDelta(x.value, -ev.velocities[0] / 400, props.xMin, props.xMax, props.xLog)
    y.value = applyDelta(y.value, ev.velocities[1] / 400, props.yMin, props.yMax, props.yLog)
  },
}, {
  domTarget: pad,
  eventOptions: { passive: false },
})
</script>

<template lang="pug">
.xy-pad(ref="pad" :style="{ opacity: active ? 1 : 0.35 }")
  .crosshair-h(:style="{ bottom: yNorm * 100 + '%', backgroundColor: color }")
  .crosshair-v(:style="{ left: xNorm * 100 + '%', backgroundColor: color }")
  .dot(:style="{ left: xNorm * 100 + '%', bottom: yNorm * 100 + '%', backgroundColor: color }")
  .label-x {{ xLabel }}
  .label-y {{ yLabel }}
</template>

<style lang="postcss" scoped>
.xy-pad {
  @apply relative cursor-crosshair select-none touch-none w-full h-full;
  overflow: visible;
}

.crosshair-h {
  @apply absolute left-0 right-0 h-px opacity-30 pointer-events-none;
  transform: translateY(50%);
}

.crosshair-v {
  @apply absolute top-0 bottom-0 w-px opacity-30 pointer-events-none;
  transform: translateX(-50%);
}

.dot {
  @apply absolute w-3 h-3 rounded-full pointer-events-none;
  transform: translate(-50%, 50%);
  box-shadow: 0 0 6px 2px #3333;
}

.label-x {
  @apply absolute bottom-1 right-1.5 text-8px font-bold opacity-50 pointer-events-none leading-none;
}

.label-y {
  @apply absolute top-1 left-1.5 text-8px font-bold opacity-50 pointer-events-none leading-none;
}
</style>
