// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2024-11-01",
  devtools: { enabled: true },
  modules: ["@unocss/nuxt"],
  css: ["~/assets/scss/_reset.scss", "~/assets/scss/app.scss"],
  runtimeConfig: {
    davUser: process.env.DAV_USER,
    davPassword: process.env.DAV_PASSWORD,
    davCalName: process.env.DAV_CAL_NAME,
    davAuthMethod: process.env.DAV_AUTH_METHOD,
    davBase: process.env.DAV_BASE,
    davURI: process.env.DAV_URI,
    emailProvider: process.env.EMAIL_PROVIDER,
    emailApiKey: process.env.EMAIL_API_KEY,
    notificationEmail: process.env.NOTIFICATION_EMAIL,
  },
  nitro: {
    prerender: {
      autoSubfolderIndex: false,
    },
    preset: "cloudflare_pages",
  },
});
