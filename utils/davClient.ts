import { createDAVClient, DAVClient, getBasicAuthHeaders } from "tsdav";
import { ClientDigestAuth } from "@mreal/digest-auth";

let client: any | undefined;
let incomingDigest: { scheme: string, realm: string, nonce: string } | undefined;

export default function () {

  return {
    getCalendarHeaders: async () => {
      const config = useRuntimeConfig();
      if (!client || !incomingDigest) {
        throw createError({
          statusCode: 401,
          statusMessage: "Client not authenticated",
        });
      }

      if (config.davAuthMethod === 'basic') {
        return getBasicAuthHeaders({
          username: config.davUser,
          password: config.davPassword,
        });
      }

      const digest = ClientDigestAuth.generateProtectionAuth(
        incomingDigest,
        config.davUser,
        config.davPassword,
        {
          uri: config.davURI,
          method: "REPORT",
          counter: 1,
        },
      ).raw;

      return {
        Authorization: digest,
      };
    },
    getDavClient: async (): Promise<DAVClient> => {
      if (client) {
        return client;
      }

      const config = useRuntimeConfig();

      if (config.davAuthMethod === 'basic') {
        client = await createDAVClient({
          serverUrl: config.davBase + config.davURI,
          defaultAccountType: "caldav",
          credentials: {
            username: config.davUser,
            password: config.davPassword,
          },
          authMethod: "Basic",
        });

        return client;
      } else if (config.davAuthMethod === 'digest') {
        const res = await fetch(config.davBase + config.davURI);
        const authenticateHeader = res.headers.get("www-authenticate");

        if (!authenticateHeader) {
          throw createError({
            statusCode: 401,
            statusMessage: "Unauthorized",
          });
        }

        incomingDigest = ClientDigestAuth.analyze(authenticateHeader);

        const digest = ClientDigestAuth.generateProtectionAuth(
          incomingDigest,
          config.davUser,
          config.davPassword,
          {
            uri: config.davURI,
            method: "PROPFIND",
            counter: 1,
          },
        ).raw.replace("Digest ", "");

        try {
          client = await createDAVClient({
            serverUrl: config.davBase + config.davURI,
            defaultAccountType: "caldav",
            credentials: {
              digestString: digest,
            },
            authMethod: "Digest",
          });

          return client;
        } catch (error) {
          // coerce error to error type
          if (error instanceof Error) {
            throw createError(
              {
                statusCode: 500,
                statusMessage: "Error authenticating with digest auth",
                cause: error,
              }
            )
          }
        }
      }

      throw createError({
        statusCode: 500,
        statusMessage: "Unsupported auth method. Check your config.",
      })
    }
  }
}
