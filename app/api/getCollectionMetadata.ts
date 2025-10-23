import { MetadataPayload } from "@/app/types/payloads";
import { fetchWithAuth } from "@/lib/api/client";

export async function getCollectionMetadata(
  collection_name: string,
  token?: string
): Promise<MetadataPayload> {
  const startTime = performance.now();
  try {
    const response = await fetchWithAuth(
      `/collections/metadata/${collection_name}`,
      {
        method: "GET",
        token,
      }
    );
    if (!response.ok) {
      console.error(
        `Retrieving collection metadata error! status: ${response.status} ${response.statusText}`
      );
      return {
        error: response.statusText,
        metadata: {
          fields: {},
          mappings: {},
          length: 0,
          summary: "",
          name: "",
          named_vectors: [],
          vectorizer: {
            vectorizer: "",
            model: "",
          },
        },
      };
    }
    const data: MetadataPayload = await response.json();

    return data;
  } catch (err) {
    console.error(err instanceof Error ? err.message : String(err));
    return {
      error: "Error retrieving collection metadata",
      metadata: {
        fields: {},
        mappings: {},
        length: 0,
        summary: "",
        name: "",
        named_vectors: [],
        vectorizer: {
          vectorizer: "",
          model: "",
        },
      },
    };
  } finally {
    if (process.env.NODE_ENV === "development") {
      console.log(
        `collections/metadata took ${(performance.now() - startTime).toFixed(
          2
        )}ms`
      );
    }
  }
}
