import { jwtDecode } from "jwt-decode";

interface CFTokenPayload {
  email: string;
  exp: number;
}

export default defineEventHandler((event) => {
  const token = getCookie(event, "CF_Authorization");
  if (token) {
    try {
      const decoded = jwtDecode<CFTokenPayload>(token);
      return { email: decoded.email };
    } catch (e) {
      console.error("Failed to decode CF token:", e);
      return { email: null };
    }
  }
  return { email: null };
});
