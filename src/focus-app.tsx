import { closeMainWindow, showHUD, getPreferenceValues, OAuth } from "@raycast/api";
import BeeperDesktop from "@beeper/desktop-api";

interface Preferences {
  baseUrl?: string;
  personalAccessToken?: string;
}

const preferences = getPreferenceValues<Preferences>();
const baseUrl = preferences.baseUrl || "http://localhost:23373";

const oauthClient = new OAuth.PKCEClient({
  redirectMethod: OAuth.RedirectMethod.Web,
  providerName: "Beeper Desktop",
  providerIcon: "extension-icon.png",
  providerId: "beeper-desktop-api",
  description: "Connect to your local Beeper Desktop app",
});

async function authorize(): Promise<string> {
  if (preferences.personalAccessToken) {
    return preferences.personalAccessToken;
  }

  const tokenSet = await oauthClient.getTokens();

  if (tokenSet?.accessToken) {
    // Check if token is expired
    if (tokenSet.isExpired && tokenSet.isExpired()) {
      await oauthClient.removeTokens();
    } else {
      return tokenSet.accessToken;
    }
  }

  // Need to authenticate
  const authRequest = await oauthClient.authorizationRequest({
    endpoint: `${baseUrl}/oauth/authorize`,
    clientId: "raycast-beeper-extension",
    scope: "read write",
  });

  const { authorizationCode } = await oauthClient.authorize(authRequest);

  // Exchange code for token
  const params = new URLSearchParams();
  params.append("client_id", "raycast-beeper-extension");
  params.append("code", authorizationCode);
  params.append("code_verifier", authRequest.codeVerifier);
  params.append("grant_type", "authorization_code");
  params.append("redirect_uri", authRequest.redirectURI);

  const response = await fetch(`${baseUrl}/oauth/token`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: params,
  });

  if (!response.ok) {
    throw new Error(`Failed to exchange authorization code: ${response.statusText}`);
  }

  const tokens = await response.json() as OAuth.TokenResponse;
  await oauthClient.setTokens(tokens);

  return tokens.access_token;
}

export default async function FocusAppCommand() {
  try {
    const accessToken = await authorize();

    const client = new BeeperDesktop({
      accessToken,
      baseURL: baseUrl,
    });

    await client.app.focus();
    await closeMainWindow();
    await showHUD("Beeper Desktop focused");
  } catch (error) {
    console.error("Failed to focus Beeper Desktop:", error);
    await showHUD("Failed to focus Beeper Desktop");
  }
}