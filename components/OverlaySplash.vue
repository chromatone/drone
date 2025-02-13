<template lang="pug">
  .absolute.top-2.left-2.right-2.bottom-2.rounded-2rem.p-4.bg-dark-900.bg-op-40.backdrop-blur-md.flex.flex-col.gap-4.z-10000.overflow-y-scroll.overscroll-none.shadow-xl.text-light-400
    .flex.flex-wrap.gap-4.sticky.top-0.bg-dark-100.rounded-2xl.p-4.bg-op-80.backdrop-blur-md.z-100.items-end
      .flex.flex-col.gap-4(style="flex: 1 1 300px")
        a.flex.items-center.no-underline.gap-2(href="https://chromatone.center/" target="_blank")
          img.w-8(src="/logo.svg" alt="Chromatone logo")
          .text-xl.font-bold Chromatone
        .flex.items-baseline.gap-2
          .text-6xl Drone
          a.op-50.hover-op-100.transition.no-underline(href="https://github.com/chromatone/drone" target="_blank") 2025 MIT v.{{ version }} 
        .text-xl.max-w-32ch Rich harmonic soundscape synthesizer for music practice, chanting and meditation
      .text-md.max-w-55ch(style="flex: 10 1 400px") Choose any pitch and listen to the rich sounds of 3 octaves, 3 fifths, and 3 fourths intervals related to it. The sounds are generated with a sawtooth oscillator synthesizer, which provides an incredible amount of harmonic material to work with. <br />Use this free progressive web app as an electronic 
        a(href="https://en.wikipedia.org/wiki/Tanpura" target="_blank") tanpura
        |    or a 
        a(href="https://en.wikipedia.org/wiki/Shruti_box" target="_blank") shruti box
        |.
      button.absolute.right-4.top-4(@click="$emit('close')") 
        .i-la-times
      .flex-1
    .flex-1.gap-2.flex.flex-col.gap-2.max-w-75ch.z-100.bg-dark-400.p-4.rounded-xl.shadow-xl 
      .text-xl.font-bold.py-2 How to use this web-app
      ol.flex.flex-col.gap-2.list-decimal.list-inside
        li Choose the root note – the <b>Sa</b> note of the performance – either by clicking one in the note list or by dragging the current note section with your mouse or touch. You can use it to adjust and fine-tune the exact frequency you need. This section shows the note as well as the cents difference with the pure 12-TET tone and with the A2 note. It also displays the exact frequency in Hz.
        li Next, tap the note rectangles to turn the sound on. The bottom row holds the root note in 3 lower octaves to create a deep base for the sound. The top row consists of three pads of the higher fifth intervals of that base frequency.
        li Drag each of the pads up and down to set the maximum level of that note. Each note has a random speed LFO that modulates its volume from 0 to this upper limit. Reload the page to get a new LFO speed composition.
        li Drag each pad horizontally to set the middle point for the slowly moving panning of the voice.
        li Listen to the tone as it evolves and breathes with harmonics. Try singing to it, tuning your instruments, or just feeling the vibrations.
        li To adjust the amount of high-frequency content, use the <b>LP</b> slider - it sets the frequency of the global low-pass filter. <b>Q</b> is the resonance of the filter.
        li Press the <i class="i-la-play inline-block" />/<i class="i-la-stop inline-block" /> button or use the <b>spacebar</b> keyboard key to toggle mute for all voices together.
    .flex-1.gap-2.flex.flex-col.gap-2.max-w-75ch.z-100.bg-dark-400.p-4.rounded-xl.shadow-xl 
      .text-xl.font-bold.py-2 How to install this web-app for offline use
      ol.flex.flex-col.gap-2.list-decimal.list-inside
        li <b>iOS</b>: Open this page in Safari, tap the 
          i.i-ic-round-ios-share.inline-block
          |   "Share" button, then select 
          i.i-material-symbols-add-box-outline-rounded.inline-block
          |   "Add to Home Screen" action down in the list.
        li <b>Android</b>: Open this page in Chrome, tap the menu button 
          i.i-la-ellipsis-v.inline-block
          |  (three dots), then select "Add to Home Screen".
        li <b>macOS</b>: Open this page in Safari, click the 
          i.i-ic-round-ios-share.inline-block
          |  "Share" button, then select 
          i.i-f7-rectangle-dock.inline-block
          |  "Add to Dock" action in the list.
        li <b>Windows</b>: Open this page in Edge, click the "Settings and more" button 
          i.i-la-ellipsis-h.inline-block
          |  (three dots), then select "Apps" > "Install this site as an app".
    button.shadow-lg.hover-bg-dark-100.p-4.border-2.bg-dark-200.text-light-200.rounded-xl.sticky.bottom-0.z-200(@click="$emit('start')") Start
</template>

<script setup>
import { version } from '../package.json'

const emit = defineEmits(['start', 'close'])

</script>

<style scoped lang="postcss"></style>
