import { jwtDecode } from "jwt-decode";

interface CFTokenPayload {
  email: string;
  exp: number;
}

export const useAuth = () => {
  const userEmail = useState<string | null>("userEmail", () => null);
  const token = useCookie("CF_Authorization");

  const initAuth = () => {
    console.log("initAuth called, token:", token.value);
    if (token.value) {
      try {
        const decoded = jwtDecode<CFTokenPayload>(token.value);
        console.log("decoded token:", decoded);
        userEmail.value = decoded.email;
        console.log("set userEmail to:", userEmail.value);
      } catch (e) {
        console.error("Failed to decode CF token:", e);
        userEmail.value = null;
      }
    } else {
      console.log("No CF token found");
    }
  };

  return {
    userEmail: readonly(userEmail),
    initAuth,
  };
};
