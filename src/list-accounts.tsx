import { ActionPanel, Detail, List, Action, Icon } from "@raycast/api";
import { withAccessToken } from "@raycast/utils";
import { beeperOAuth } from "./oauth-provider";
import { useBeeperClient } from "./hooks/useBeeper";

function ListAccountsCommand() {
  const { data: response, isLoading, revalidate } = useBeeperClient(
    async (client) => {
      const result = await client.accounts.list();
      console.log("Fetched accounts:", JSON.stringify(result, null, 2));
      return result;
    }
  );

  const accounts = response?.accounts || [];

  return (
    <List
      isLoading={isLoading}
      navigationTitle="Beeper Accounts"
    >
      {accounts.map((account) => (
        <List.Item
          key={account.accountID}
          icon={Icon.Person}
          title={account.user?.fullName || account.user?.username || "Unnamed Account"}
          subtitle={account.network}
          accessories={[
            { text: account.user?.email || "" },
            { icon: account.user?.isSelf ? Icon.Star : undefined }
          ].filter(Boolean)}
          actions={
            <ActionPanel>
              <Action.Push
                title="Show Details"
                target={
                  <Detail
                    markdown={`# ${account.user?.fullName || account.user?.username || "Account"}

**Account ID:** ${account.accountID}
**Network:** ${account.network}
**User ID:** ${account.user?.id || "N/A"}
**Username:** ${account.user?.username || "N/A"}
**Email:** ${account.user?.email || "N/A"}
**Is Self:** ${account.user?.isSelf ? "Yes" : "No"}`}
                  />
                }
              />
              <Action
                title="Refresh"
                icon={Icon.ArrowClockwise}
                shortcut={{ modifiers: ["cmd"], key: "r" }}
                onAction={() => revalidate()}
              />
              <Action
                title="Focus Beeper Desktop"
                icon={Icon.Window}
                shortcut={{ modifiers: ["cmd"], key: "o" }}
                onAction={async () => {
                  try {
                    const { getClient } = await import("./api");
                    const client = await getClient();
                    await client.app.focus();
                    await import("@raycast/api").then(({ showHUD }) => 
                      showHUD("Beeper Desktop focused")
                    );
                  } catch (error) {
                    console.error("Failed to focus app:", error);
                  }
                }}
              />
            </ActionPanel>
          }
        />
      ))}
      {!isLoading && accounts.length === 0 && (
        <List.EmptyView
          icon={Icon.Person}
          title="No accounts found"
          description="Make sure Beeper Desktop is running and you're authenticated"
        />
      )}
    </List>
  );
}

export default withAccessToken(beeperOAuth)(ListAccountsCommand);