import { createResendProvider } from "./resend";
// todo: import other providers...

type ProviderConfig = {
  apiKey: string;
  // todo: Add other necessary config options
};

const providers: Record<string, (config: ProviderConfig) => EmailProvider> = {
  resend: ({ apiKey }) => createResendProvider(apiKey),
  // todo: Add other providers:
};

export const createEmailProvider = (
  name: string,
  config: ProviderConfig,
): EmailProvider => {
  const providerFactory = providers[name];

  if (!providerFactory) {
    throw new Error(`Unsupported email provider: ${name}`);
  }

  return providerFactory(config);
};
