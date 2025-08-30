import { ActionPanel, Detail, List, Action, Icon, showHUD } from "@raycast/api";
import { withAccessToken } from "@raycast/utils";
import { useBeeperClient, createBeeperOAuth } from "./hooks/useBeeper";

function ListAccountsCommand() {
  const {
    data: _accounts,
    isLoading,
    revalidate,
  } = useBeeperClient(async (client) => {
    const result = await client.accounts.list();
    console.log("Fetched accounts:", JSON.stringify(result, null, 2));
    return result.accounts;
  });

  const accounts = _accounts || [];

  return (
    <List isLoading={isLoading} navigationTitle="Beeper Accounts">
      {accounts.map((account) => (
        <List.Item
          key={account.accountID}
          icon={Icon.Person}
          title={account.user?.fullName || account.user?.username || "Unnamed Account"}
          subtitle={account.network}
          accessories={[
            { text: account.user?.email || "" },
            { icon: account.user?.isSelf ? Icon.Star : undefined },
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
                    const { getAuthenticatedClient } = await import("./hooks/useBeeper");
                    const client = await getAuthenticatedClient();
                    await client.app.focus();
                    showHUD("Beeper Desktop focused");
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

export default withAccessToken(createBeeperOAuth())(ListAccountsCommand);
