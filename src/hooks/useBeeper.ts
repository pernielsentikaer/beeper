import { usePromise } from "@raycast/utils";
import { getClient } from "../api";
import BeeperDesktop from "@beeper/desktop-api";

/**
 * Custom hook to use the Beeper client with automatic token management
 * @param fn - Function that receives the Beeper client and returns a promise
 * @returns AsyncState with data, error, isLoading, revalidate, and mutate
 */
export function useBeeperClient<T>(
  fn: (client: BeeperDesktop) => Promise<T>
) {
  return usePromise(async () => {
    const client = await getClient();
    return fn(client);
  });
}