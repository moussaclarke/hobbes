export const createResendProvider = (apiKey: string): EmailProvider => {
  return async ({ to, subject, text, html }) => {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "no-reply@moussaclarke.dev",
        to,
        subject,
        text,
        html,
      }),
    });

    if (!response.ok) {
      throw new Error("Failed to send email");
    }
  };
};
