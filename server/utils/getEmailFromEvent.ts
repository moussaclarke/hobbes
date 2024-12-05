import { jwtDecode } from "jwt-decode";
import { H3Event } from "h3";

interface CFTokenPayload {
  email: string;
  exp: number;
}

export const getEmailFromEvent = (event: H3Event) => {
  // this gets the email from the cloudflare jwt token which is set in the request headers in production

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
};
