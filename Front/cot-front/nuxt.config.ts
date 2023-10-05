// https://nuxt.com/docs/api/configuration/nuxt-config


export default defineNuxtConfig({
  css: [
    '@fortawesome/fontawesome-svg-core/styles.css'
  ],
  devtools: { enabled: true },
  vite: {
    server: {
      watch: {
        usePolling: true
      },
      hmr: {
        // clientPort: 24600,
        // port: 24600
      }
    }
  },
  modules: [
    '@pinia/nuxt',
  ]

})
