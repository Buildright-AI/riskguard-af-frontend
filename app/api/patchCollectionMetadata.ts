import { fetchWithAuth } from "@/lib/api/client";
import { PatchCollectionMetadataPayload } from "@/app/types/objects";

export async function patchCollectionMetadata(
  collectionName: string,
  payload: PatchCollectionMetadataPayload,
  token?: string
) {
  const startTime = performance.now();
  try {
    const res = await fetchWithAuth(
      `/collections/metadata/${collectionName}`,
      {
        method: "PATCH",
        body: JSON.stringify(payload),
        token,
      },
    );
    if (!res.ok) {
      console.error(
        `Patching collection metadata error! status: ${res.status} ${res.statusText}`,
      );
      return {
        error: res.statusText,
        result: null,
      };
    }
    const data = await res.json();
    return data;
  } catch (err) {
    console.error(err instanceof Error ? err.message : String(err));
    return {
      error: "Error patching collection metadata",
      result: null,
    };
  } finally {
    if (process.env.NODE_ENV === "development") {
      console.log(
        `collections/patchMetadata took ${(performance.now() - startTime).toFixed(2)}ms`,
      );
    }
  }
}
