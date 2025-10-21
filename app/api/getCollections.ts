import { CollectionPayload } from "@/app/types/payloads";
import { fetchWithAuth } from "@/lib/api/client";
import { Collection } from "../types/objects";

export async function getCollections(
  token?: string
): Promise<Collection[]> {
  const startTime = performance.now();
  try {
    const response = await fetchWithAuth(`/collections/list`, {
      method: "GET",
      token,
    });

    if (!response.ok) {
      console.error(
        `Get Collections error! status: ${response.status} ${response.statusText}`,
      );
      return [];
    }

    const data: CollectionPayload = await response.json();
    return data.collections;
  } catch (error) {
    console.error("Get Collections error:", error);
    return [];
  } finally {
    if (process.env.NODE_ENV === "development") {
      console.log(
        `collections/list took ${(performance.now() - startTime).toFixed(2)}ms`,
      );
    }
  }
}
