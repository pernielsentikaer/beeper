import { ActionPanel, Detail, List, Action, Icon, showToast, Toast } from "@raycast/api";
import { getClient } from "./api";
import { useEffect, useState } from "react";
import { withAccessToken } from "@raycast/utils";
import { beeperOAuth } from "./oauth-provider";

interface Chat {
  id: string;
  name: string;
  type: string;
  lastMessage?: {
    text: string;
    timestamp: string;
  };
}

function SearchChatsCommand() {
  const [chats, setChats] = useState<Chat[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchText, setSearchText] = useState("");

  useEffect(() => {
    async function fetchChats() {
      try {
        setIsLoading(true);
        const client = await getClient();
        
        // Search for chats based on the search text
        // Fix: limit should be a number, not a string
        const searchParams = searchText 
          ? { query: searchText, limit: 20 } 
          : { limit: 20 };
        
        const result = await client.chats.search(searchParams);
        // The result is the array of chats directly
        setChats(Array.isArray(result) ? result : []);
      } catch (error) {
        showToast({
          style: Toast.Style.Failure,
          title: "Failed to fetch chats",
          message: error instanceof Error ? error.message : "Unknown error",
        });
        console.error("Error fetching chats:", error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchChats();
  }, [searchText]);

  return (
    <List
      isLoading={isLoading}
      searchBarPlaceholder="Search chats..."
      onSearchTextChange={setSearchText}
      throttle
    >
      {chats.map((chat) => (
        <List.Item
          key={chat.id}
          icon={Icon.Message}
          title={chat.name || "Unnamed Chat"}
          subtitle={chat.lastMessage?.text}
          accessories={[
            { text: chat.type },
            chat.lastMessage?.timestamp 
              ? { date: new Date(chat.lastMessage.timestamp) }
              : {},
          ].filter(Boolean)}
          actions={
            <ActionPanel>
              <Action.Push 
                title="Show Details" 
                target={
                  <Detail 
                    markdown={`# ${chat.name}

**ID:** ${chat.id}
**Type:** ${chat.type}

${chat.lastMessage ? `**Last Message:** ${chat.lastMessage.text}` : "No messages yet"}`} 
                  />
                } 
              />
            </ActionPanel>
          }
        />
      ))}
      {!isLoading && chats.length === 0 && (
        <List.EmptyView
          icon={Icon.Message}
          title="No chats found"
          description="Try adjusting your search or make sure Beeper Desktop is running"
        />
      )}
    </List>
  );
}

export default withAccessToken(beeperOAuth)(SearchChatsCommand);