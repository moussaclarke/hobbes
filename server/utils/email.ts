import { createEmailProvider } from "./emailProviders";

let emailProvider: ReturnType<typeof createEmailProvider>;

export const sendEmail = async (options: EmailOptions) => {
  if (!emailProvider) {
    const config = useRuntimeConfig();
    emailProvider = createEmailProvider(config.emailProvider, {
      apiKey: config.emailApiKey,
    });
  }

  return emailProvider(options);
};
