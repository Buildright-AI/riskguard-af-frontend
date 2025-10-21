import { CollectionDataPayload } from "@/app/types/payloads";
import { fetchWithAuth } from "@/lib/api/client";

export async function getObject(
  collection_name: string,
  uuid: string,
  token?: string
) {
  const startTime = performance.now();
  try {
    const response = await fetchWithAuth(
      `/collections/get_object/${collection_name}/${uuid}`,
      {
        method: "GET",
        token,
      }
    );

    if (!response.ok) {
      console.error(
        `Error fetching object! status: ${response.status} ${response.statusText}`
      );
      return {
        properties: {},
        items: [],
        error: "Error fetching object",
      };
    }

    const data: CollectionDataPayload = await response.json();
    return data;
  } catch (error) {
    console.error(error instanceof Error ? error.message : String(error));
    return {
      properties: {},
      items: [],
      error: "Error fetching object",
    };
  } finally {
    if (process.env.NODE_ENV === "development") {
      console.log(
        `collections/get_object took ${(performance.now() - startTime).toFixed(2)}ms`
      );
    }
  }
}
