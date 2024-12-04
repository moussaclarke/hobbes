import { jwtDecode } from "jwt-decode";

interface CFTokenPayload {
  email: string;
  exp: number;
}

export const useAuth = () => {
  const userEmail = useState<string | null>("userEmail", () => null);

  const initAuth = () => {
    const token = useCookie("CF_Authorization");
    if (token.value) {
      try {
        const decoded = jwtDecode<CFTokenPayload>(token.value);
        userEmail.value = decoded.email;
      } catch (e) {
        console.error("Failed to decode CF token:", e);
        userEmail.value = null;
      }
    }
  };

  return {
    userEmail: readonly(userEmail),
    initAuth,
  };
};
