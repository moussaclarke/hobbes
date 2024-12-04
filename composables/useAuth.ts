export const useAuth = () => {
  const userEmail = useState<string | null>("userEmail", () => null);

  const initAuth = async () => {
    try {
      const { email } = await $fetch("/api/user");
      userEmail.value = email;
    } catch (e) {
      console.error("Failed to get user info:", e);
      userEmail.value = null;
    }
  };

  return {
    userEmail: readonly(userEmail),
    initAuth,
  };
};
