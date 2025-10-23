import { BasePayload } from "@/app/types/payloads";
import { fetchWithAuth } from "@/lib/api/client";

export async function deleteCollectionMetadata(
  collection_name: string,
  token?: string
): Promise<BasePayload> {
  const startTime = performance.now();
  try {
    const response = await fetchWithAuth(
      `/collections/metadata/${collection_name}`,
      {
        method: "DELETE",
        token,
      },
    );
    if (!response.ok) {
      console.error(
        `Deleting collection metadata error! status: ${response.status} ${response.statusText}`,
      );
      return {
        error: response.statusText,
      };
    }
    return {
      error: "",
    };
  } catch (err) {
    console.error(err instanceof Error ? err.message : String(err));
    return {
      error: "Error deleting collection metadata",
    };
  } finally {
    if (process.env.NODE_ENV === "development") {
      console.log(
        `collections/metadata/${collection_name} took ${(
          performance.now() - startTime
        ).toFixed(2)}ms`,
      );
    }
  }
}
