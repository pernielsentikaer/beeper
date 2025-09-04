import { ActionPanel, Detail, List, Action, Icon, Keyboard, Color } from "@raycast/api";
import { useCachedState, withAccessToken } from "@raycast/utils";
import { BeeperDesktop } from "@beeper/desktop-api";
import { useBeeperDesktop, createBeeperOAuth, focusApp } from "./api";

function ListAccountsCommand() {
  const [isShowingDetail, setIsShowingDetail] = useCachedState("isShowingDetail", false);
  const {
    data: accounts,
    isLoading,
    revalidate,
    error,
  } = useBeeperDesktop(async (client) => {
    const result = await client.accounts.list();
    // If the SDK typing is off, prefer a narrow cast over `any`
    return result as BeeperDesktop.Account[];
  });

  return (
    <List isLoading={isLoading} searchBarPlaceholder="Search accounts…" isShowingDetail={isShowingDetail}>
      {accounts?.map((account) => (
        <List.Item
          key={account.accountID}
          icon={Icon.Person}
          title={account.user?.fullName || account.user?.username || "Unnamed Account"}
          subtitle={!isShowingDetail ? account.network : undefined}
          detail={
            isShowingDetail ? (
              <List.Item.Detail
                metadata={
                  <List.Item.Detail.Metadata>
                    <List.Item.Detail.Metadata.Label title="Account ID" text={account.accountID} />
                    <List.Item.Detail.Metadata.Label title="Network" text={account.network} />
                    <List.Item.Detail.Metadata.Separator />
                    <List.Item.Detail.Metadata.Label title="User ID" text={account.user?.id || "N/A"} />
                    <List.Item.Detail.Metadata.Label title="Username" text={account.user?.username || "N/A"} />
                    <List.Item.Detail.Metadata.Label title="Email" text={account.user?.email || "N/A"} />
                    <List.Item.Detail.Metadata.Label title="Phone Number" text={account.user?.phoneNumber || "N/A"} />
                    {account.user?.isSelf && (
                      <List.Item.Detail.Metadata.TagList title="Status">
                        <List.Item.Detail.Metadata.TagList.Item text="Self" color={Color.Green} />
                      </List.Item.Detail.Metadata.TagList>
                    )}
                  </List.Item.Detail.Metadata>
                }
              />
            ) : undefined
          }
          accessories={
            !isShowingDetail
              ? [
                  ...(account.user?.email ? ([{ text: account.user.email }] as const) : []),
                  ...(account.user?.isSelf ? ([{ icon: Icon.Star, tooltip: "This is you" }] as const) : []),
                ]
              : []
          }
          actions={
            <ActionPanel>
              <Action
                title="Focus Beeper Desktop"
                icon={Icon.Window}
                shortcut={Keyboard.Shortcut.Common.Open}
                onAction={() => focusApp()}
              />
              <Action
                title="Toggle Details"
                shortcut={{ modifiers: ["cmd", "shift"], key: "d" }}
                icon={Icon.AppWindowSidebarLeft}
                onAction={() => setIsShowingDetail(!isShowingDetail)}
              />
              <Action.Push
                title="Show Details (Old)"
                icon={Icon.Info}
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
                shortcut={Keyboard.Shortcut.Common.Refresh}
                onAction={() => revalidate()}
              />
            </ActionPanel>
          }
        />
      ))}
      {!isLoading && (accounts?.length ?? 0) === 0 && (
        <List.EmptyView
          icon={error ? Icon.Warning : Icon.Person}
          title={error ? "Failed to Load Accounts" : "No Accounts Found"}
          description={
            error
              ? "Could not load accounts. Make sure Beeper Desktop is running and the API is enabled, then try Refresh."
              : "Make sure Beeper Desktop is running and you're authenticated"
          }
        />
      )}
    </List>
  );
}

export default withAccessToken(createBeeperOAuth())(ListAccountsCommand);
