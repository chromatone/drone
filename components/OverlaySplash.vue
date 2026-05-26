<script setup>
import { version } from '../package.json'

const emit = defineEmits(['start', 'close'])

</script>


<template lang="pug">
  .absolute.top-2.left-2.right-2.bottom-2.rounded-2rem.p-4.bg-dark-900.bg-op-40.backdrop-blur-md.flex.flex-col.gap-4.z-10000.overflow-y-scroll.overscroll-none.shadow-xl.text-light-400
    .flex.flex-wrap.gap-4.sticky.top-0.bg-dark-100.rounded-2xl.p-4.bg-op-80.backdrop-blur-md.z-100.items-end
      .flex.flex-col.gap-4(style="flex: 1 1 300px")
        .flex.items-center.no-underline.gap-2
          img.w-8(src="/logo.svg" alt="Chromatone logo")
          .text-xl.font-bold Chromatone
          
        .flex.items-baseline.gap-2
          .text-6xl Drone
        .text-xl.max-w-32ch Rich harmonic soundscape synthesizer for music practice, chanting and meditation
      .text-md.max-w-55ch(style="flex: 10 1 400px") Choose any pitch and listen to the rich sounds of 3 octaves, 3 fifths, and 3 fourths intervals related to it. The sounds are generated with a sawtooth oscillator synthesizer, which provides an incredible amount of harmonic material to work with. <br />Use this free progressive web app as an electronic 
        a(href="https://en.wikipedia.org/wiki/Tanpura" target="_blank") tanpura
        |    or a 
        a(href="https://en.wikipedia.org/wiki/Shruti_box" target="_blank") shruti box
        |.
      button.absolute.right-4.top-4(@click="$emit('close')") 
        .i-la-times
      button.shadow-lg.hover-bg-dark-100.p-4.border-2.bg-dark-200.text-light-200.rounded-xl.sticky.bottom-0.z-200.w-full(@click="$emit('start')") Start

    .flex.flex-wrap.gap-2


      .gap-2.flex.flex-col.gap-2.max-w-75ch.z-100.bg-dark-400.p-4.rounded-xl.shadow-xl(style="flex: 1 1 300px") 

      
        .text-xl.font-bold.py-2 How to use the app:
        ol.flex.flex-col.gap-2.list-decimal.list-inside
          li Swipe top section to choose root pitch
          li Tap any voice cell to toggle it on
          li Each voice has 4 quadrants — drag to shape sound:
            ul.list-disc.list-inside.ml-4.mt-1
              li <b>VOL/PAN</b> — volume & stereo
              li <b>LP/Q</b> — filter brightness & resonance
              li <b>AF</b> — auto-filter rate & depth
              li <b>CHO</b> — chorus depth
          li Master volume knob in top bar
          li Spacebar toggles all voices

      .gap-2.flex.flex-col.gap-2.max-w-75ch.z-100.bg-dark-400.p-4.rounded-xl.shadow-xl.sticky.top-0(style="flex: 1 1 300px")
        .text-xl.font-bold.py-2 Install this web-app for offline use:
        .flex.flex-col.gap-4
          .p-0
            i.i-la-apple.inline-block.text-lg
            | <b>iOS</b>: Open this page in Safari, tap the 
            i.i-ic-round-ios-share.inline-block
            |   "Share" button, then select 
            i.i-material-symbols-add-box-outline-rounded.inline-block
            |   "Add to Home Screen" action down in the list.
          .p-0 
            i.i-la-android.inline-block.text-lg
            | <b>Android</b>: Open this page in Chrome, tap the menu button 
            i.i-la-ellipsis-v.inline-block
            |  (three dots), then select "Add to Home Screen".
          .p-0 
            i.i-la-apple.inline-block.text-lg
            |  <b>macOS</b>: Open this page in Safari, click the 
            i.i-ic-round-ios-share.inline-block
            |  "Share" button, then select 
            i.i-f7-rectangle-dock.inline-block
            |  "Add to Dock" action in the list.
          .p-0  
            i.i-la-windows.inline-block.text-lg
            | <b>Windows</b>: Open this page in Edge, click the "Settings and more" button 
            i.i-la-ellipsis-h.inline-block
            |  (three dots), then select "Apps" > "Install this site as an app".

      


    .gap-2.flex.items-center.gap-2.z-100.bg-dark-400.p-4.rounded-xl.shadow-xl.sticky.bottom-2
      .i-la-copyright
      a.op-50.hover-op-100.transition.no-underline.flex.items-center.gap-1(href="https://github.com/davay42" target="_blank") davay42
      p |
      a.op-50.hover-op-100.transition.no-underline.flex.items-center.gap-1(href="https://chromatone.center/" target="_blank") Chromatone
      .flex-1
      .p-0  2026 MIT
      a.op-50.hover-op-100.transition.no-underline.flex.items-center.gap-1(href="https://github.com/chromatone/drone" target="_blank")
        .i-la-github
        span  v.{{ version }} 
      
</template>

<style scoped lang="postcss">
i {
  @apply inline-block mb-1 bg-yellow-200;
}
</style>
