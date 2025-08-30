import { closeMainWindow, showHUD } from "@raycast/api";
import { getAuthenticatedClient } from "./hooks/useBeeper";

export default async function FocusAppCommand() {
  try {
    const client = await getAuthenticatedClient();
    await client.app.focus();
    await closeMainWindow();
    await showHUD("Beeper Desktop focused");
  } catch (error) {
    console.error("Failed to focus Beeper Desktop:", error);
    await showHUD("Failed to focus Beeper Desktop");
  }
}
