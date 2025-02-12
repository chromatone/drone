<template lang="pug">
  .absolute.top-8.left-8.right-8.bottom-8.rounded-xl.p-4.bg-light-900.bg-op-80.backdrop-blur-md.flex.flex-col.gap-4.z-10000.overflow-y-scroll.overscroll-none.shadow-xl
    .flex.flex-col.gap-1.sticky.top-0.bg-light-400.rounded-xl.p-2.bg-op-80.backdrop-blur-md.z-100
      a.flex.items-center.no-underline.gap-2
        img.w-12(src="/logo.svg" alt="Chromatone logo")
        .text-2xl.font-bold Chromatone
      .text-6xl Drone
      .text-xl Synth tanpura / shruti box
    .text-md Rich harmonic soundscape synthesizer for music practice, chanting and meditation
    .text-sm You choose the pitch and the app enables you to play rich sound of 3 octaves, 3 fifths and 3 fourths. The sound is generated with sawtooth oscillator synth and this gives the incredible amount of harmonic material to work with. Consider it as an electronic version of 
      a(href="https://en.wikipedia.org/wiki/Tanpura" target="_blank") Indian tanpura
      |  or a free online 
      a(href="https://en.wikipedia.org/wiki/Shruti_box" target="_blank") shruti box.
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
    button.shadow-lg.hover-bg-dark-100.p-4.border-2.bg-dark-200.text-light-200.rounded-xl.sticky.bottom-0(@click="$emit('start')") Start
</template>

<script setup>

</script>

<style scoped lang="postcss"></style>
