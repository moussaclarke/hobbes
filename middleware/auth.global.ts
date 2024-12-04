import { useAuth } from "../composables/useAuth";

export default defineNuxtRouteMiddleware((to, from) => {
  if (import.meta.server) return;
  const { initAuth } = useAuth();
  initAuth();
});
