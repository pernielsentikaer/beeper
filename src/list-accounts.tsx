import { ActionPanel, Detail, List, Action, Icon, showToast, Toast } from "@raycast/api";
import { getClient } from "./api";
import { useEffect, useState } from "react";
import { withAccessToken } from "@raycast/utils";
import { beeperOAuth } from "./oauth-provider";

interface Account {
  id: string;
  name: string;
  type: string;
  status?: string;
  connected?: boolean;
}

function ListAccountsCommand() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchAccounts() {
      try {
        setIsLoading(true);
        const client = await getClient();
        
        // Fetch accounts using accounts.list
        const result = await client.accounts.list();
        
        // Handle the result - it should be an array of accounts
        setAccounts(Array.isArray(result) ? result : []);
      } catch (error) {
        showToast({
          style: Toast.Style.Failure,
          title: "Failed to fetch accounts",
          message: error instanceof Error ? error.message : "Unknown error",
        });
        console.error("Error fetching accounts:", error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchAccounts();
  }, []);

  return (
    <List
      isLoading={isLoading}
      navigationTitle="Beeper Accounts"
    >
      {accounts.map((account) => (
        <List.Item
          key={account.id}
          icon={account.connected ? Icon.CheckCircle : Icon.Circle}
          title={account.name || "Unnamed Account"}
          subtitle={account.type}
          accessories={[
            { text: account.status || "Unknown" },
            { icon: account.connected ? Icon.Checkmark : Icon.XMarkCircle }
          ]}
          actions={
            <ActionPanel>
              <Action.Push 
                title="Show Details" 
                target={
                  <Detail 
                    markdown={`# ${account.name}

**ID:** ${account.id}
**Type:** ${account.type}
**Status:** ${account.status || "Unknown"}
**Connected:** ${account.connected ? "Yes" : "No"}`} 
                  />
                } 
              />
              <Action
                title="Refresh"
                icon={Icon.ArrowClockwise}
                onAction={async () => {
                  await fetchAccounts();
                  showToast({
                    style: Toast.Style.Success,
                    title: "Accounts refreshed",
                  });
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