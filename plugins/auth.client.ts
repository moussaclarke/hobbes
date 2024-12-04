import { useAuth } from "../composables/useAuth";

export default defineNuxtPlugin(() => {
  const { initAuth } = useAuth();
  initAuth();
});
