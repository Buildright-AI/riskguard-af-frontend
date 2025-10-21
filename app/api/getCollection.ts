import { CollectionDataPayload } from "@/app/types/payloads";
import { Filter } from "@/app/types/objects";
import { fetchWithAuth } from "@/lib/api/client";

export async function getCollectionData(
  collection_name: string,
  _page_number: number,
  page_size: number,
  sort_on: string | null,
  ascending: boolean,
  filter_config: { type: string; filters: Filter[] },
  query: string,
  token?: string
) {
  // Ensure page number is at least 1
  const page_number = Math.max(_page_number, 1);

  const startTime = performance.now();
  try {
    const response = await fetchWithAuth(
      `/collections/view/${collection_name}`,
      {
        method: "POST",
        body: JSON.stringify({
          page_number,
          page_size,
          sort_on,
          ascending,
          filter_config,
          query,
        }),
        token,
      }
    );

    if (!response.ok) {
      console.error(
        `Error fetching collection data! status: ${response.status} ${response.statusText}`
      );
      return {
        properties: {},
        items: [],
        error: "Error fetching collection data",
      };
    }

    const data: CollectionDataPayload = await response.json();
    return data;
  } catch (error) {
    console.error(error instanceof Error ? error.message : String(error));
    return {
      properties: {},
      items: [],
      error: "Error fetching collection data",
    };
  } finally {
    if (process.env.NODE_ENV === "development") {
      console.log(
        `collections/view took ${(performance.now() - startTime).toFixed(2)}ms`
      );
    }
  }
}
