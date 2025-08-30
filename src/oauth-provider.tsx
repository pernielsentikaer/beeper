import { OAuth, getPreferenceValues } from "@raycast/api";
import { OAuthService } from "@raycast/utils";

interface Preferences {
  baseUrl?: string;
  personalAccessToken?: string;
}

const preferences = getPreferenceValues<Preferences>();
const baseUrl = preferences.baseUrl || "http://localhost:23373";

const client = new OAuth.PKCEClient({
  redirectMethod: OAuth.RedirectMethod.Web,
  providerName: "Beeper Desktop",
  providerIcon: "extension-icon.png",
  providerId: "beeper-desktop-api",
  description: "Connect to your local Beeper Desktop app",
});

export const beeperOAuth = new OAuthService({
  client,
  clientId: "raycast-beeper-extension",
  scope: "read write",
  authorizeUrl: `${baseUrl}/oauth/authorize`,
  tokenUrl: `${baseUrl}/oauth/token`,
  personalAccessToken: preferences.personalAccessToken,
});