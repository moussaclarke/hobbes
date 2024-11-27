// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',
  devtools: { enabled: true },
  modules: ["@unocss/nuxt"],
  css: ["~/assets/scss/_reset.scss", "~/assets/scss/app.scss"],
  runtimeConfig: {
      davUser: process.env.DAV_USER,
      davPassword: process.env.DAV_PASSWORD,
  },
})
