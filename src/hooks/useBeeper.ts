import BeeperDesktop from "@beeper/desktop-api";
import { getPreferenceValues, OAuth } from "@raycast/api";
import { OAuthService, usePromise } from "@raycast/utils";

interface Preferences {
  baseUrl?: string;
  personalAccessToken?: string;
}

let clientInstance: BeeperDesktop | null = null;
let lastBaseUrl: string | null = null;

const getPreferences = () => getPreferenceValues<Preferences>();

const createOAuthClient = () =>
  new OAuth.PKCEClient({
    redirectMethod: OAuth.RedirectMethod.Web,
    providerName: "Beeper Desktop",
    providerIcon: "extension-icon.png",
    providerId: "beeper-desktop-api",
    description: "Connect to your local Beeper Desktop app",
  });

const getBaseUrl = () => {
  const preferences = getPreferences();
  return preferences.baseUrl || "http://localhost:23373";
};

export function createBeeperOAuth() {
  const preferences = getPreferences();
  const baseUrl = getBaseUrl();

  return new OAuthService({
    client: createOAuthClient(),
    clientId: "raycast-beeper-extension",
    scope: "read write",
    authorizeUrl: `${baseUrl}/oauth/authorize`,
    tokenUrl: `${baseUrl}/oauth/token`,
    refreshTokenUrl: `${baseUrl}/oauth/token`,
    bodyEncoding: "url-encoded",
    personalAccessToken: preferences.personalAccessToken,
  });
}

async function getAccessToken(): Promise<string> {
  const { personalAccessToken } = getPreferences();
  if (personalAccessToken) return personalAccessToken;
  return await createBeeperOAuth().authorize();
}

export async function getAuthenticatedClient(): Promise<BeeperDesktop> {
  const baseUrl = getBaseUrl();
  const accessToken = await getAccessToken();

  if (!clientInstance || lastBaseUrl !== baseUrl) {
    clientInstance = new BeeperDesktop({
      accessToken,
      baseURL: baseUrl,
    });
    lastBaseUrl = baseUrl;
  } else {
    clientInstance.accessToken = accessToken;
  }

  return clientInstance;
}

export function useBeeperClient<T>(fn: (client: BeeperDesktop) => Promise<T>) {
  return usePromise(async () => {
    const client = await getAuthenticatedClient();
    return fn(client);
  });
}
