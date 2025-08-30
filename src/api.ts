import BeeperDesktop from '@beeper/desktop-api';
import { getPreferenceValues } from "@raycast/api";
import { getAccessToken } from "@raycast/utils";

interface Preferences {
  baseUrl?: string;
}

let clientInstance: BeeperDesktop | null = null;

export async function getClient(): Promise<BeeperDesktop> {
  if (!clientInstance) {
    const preferences = getPreferenceValues<Preferences>();
    const baseUrl = preferences.baseUrl || "http://localhost:23373";
    const { token } = getAccessToken();
    
    if (!token) {
      throw new Error("No access token available");
    }
    
    clientInstance = new BeeperDesktop({
      accessToken: token,
      baseURL: baseUrl,
    });
  }
  
  return clientInstance;
}