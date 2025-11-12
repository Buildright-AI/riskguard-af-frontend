import { DashboardMetadataPayload } from "@/app/types/payloads";
import { fetchWithAuth } from "@/lib/api/client";

export async function getDashboardMetadata(
  token?: string
): Promise<DashboardMetadataPayload> {
  const startTime = performance.now();
  try {
    const response = await fetchWithAuth("/api/dashboard/metadata", {
      method: "GET",
      token,
    });

    if (!response.ok) {
      return {
        error: `Get Dashboard Metadata error! status: ${response.status} ${response.statusText}`,
        data: null,
      };
    }

    const data: DashboardMetadataPayload = await response.json();
    return data;
  } catch (error) {
    return {
      error: error as string,
      data: null,
    };
  } finally {
    if (process.env.NODE_ENV === "development") {
      console.log(
        `getDashboardMetadata took ${(performance.now() - startTime).toFixed(2)}ms`
      );
    }
  }
}
