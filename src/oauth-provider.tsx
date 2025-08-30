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
  providerName: "Beeper Connect",
  providerIcon: "extension-icon.png",
  providerId: "beeper-connect",
  description: "Connect to your local Beeper Desktop app",
});

export const beeperOAuth = new OAuthService({
  client,
  clientId: "raycast-beeper-extension",
  scope: "read write",
  authorizeUrl: `${baseUrl}/oauth/authorize`,
  tokenUrl: `${baseUrl}/oauth/token`,
  personalAccessToken: preferences.personalAccessToken,
  
  // Use the default token exchange provided by OAuthService
  // The service will handle PKCE automatically
});