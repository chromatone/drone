import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import UnoCSS from 'unocss/vite'
import { viteSingleFile } from "vite-plugin-singlefile"

export default defineConfig({
  base: './',
  server: {
    port: 3642,
    strictPort: false,
  },
  preview: {
    host: "0.0.0.0",
    port: '4222'
  },
  plugins: [
    vue(),
    UnoCSS(),
    viteSingleFile(),
    viteBuildScript()
  ],
})


function viteBuildScript() {
  return {
    name: 'vite-build-script',
    transformIndexHtml(html) {
      if (process.env.NODE_ENV === 'production') {
        return html.replace(/<!-- Stats production build insert -->/, `<script async defer src="https://stats.chromatone.center/script.js" data-website-id="5f20daa8-3866-42a6-a0e5-e66ebb70db0e"></script>
          
          <script>
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
          .then((registration) => {
            console.log('Service Worker registered with scope: ', registration.scope);
          })
          .catch((error) => {
            console.error('Service Worker registration failed: ', error);
          });
      });
    }
  </script>`);
      }
      return html;
    },
  };
}