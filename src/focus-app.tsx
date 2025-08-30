import { withAccessToken } from "@raycast/utils";
import { focusApp, createBeeperOAuth } from "./api";

async function FocusAppCommand() {
  await focusApp();
}

export default withAccessToken(createBeeperOAuth())(FocusAppCommand);
