import { DashboardDeviationsPayload } from "@/app/types/payloads";
import { fetchWithAuth } from "@/lib/api/client";

export async function getDashboardDeviations(
  options?: {
    days?: number;
    projects?: string[];
  },
  token?: string
): Promise<DashboardDeviationsPayload> {
  const startTime = performance.now();
  try {
    // Build query parameters
    const params = new URLSearchParams();
    if (options?.days) {
      params.append("days", options.days.toString());
    }
    if (options?.projects && options.projects.length > 0) {
      params.append("projects", options.projects.join(","));
    }

    const url = `/api/dashboard/deviations${params.toString() ? `?${params.toString()}` : ""}`;

    const response = await fetchWithAuth(url, {
      method: "GET",
      token,
    });

    if (!response.ok) {
      return {
        error: `Get Dashboard Deviations error! status: ${response.status} ${response.statusText}`,
        data: null,
      };
    }

    const data: DashboardDeviationsPayload = await response.json();
    return data;
  } catch (error) {
    return {
      error: error as string,
      data: null,
    };
  } finally {
    if (process.env.NODE_ENV === "development") {
      console.log(
        `getDashboardDeviations took ${(performance.now() - startTime).toFixed(2)}ms`
      );
    }
  }
}
