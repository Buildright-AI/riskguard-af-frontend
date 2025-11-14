import { DashboardKPIsPayload } from "@/app/types/payloads";
import { fetchWithAuth } from "@/lib/api/client";

export async function getDashboardKPIs(
  options?: {
    days?: number;
    projects?: string[];
  },
  token?: string
): Promise<DashboardKPIsPayload> {
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

    const url = `/api/dashboard/kpis${params.toString() ? `?${params.toString()}` : ""}`;

    const response = await fetchWithAuth(url, {
      method: "GET",
      token,
    });

    if (!response.ok) {
      return {
        error: `Get Dashboard KPIs error! status: ${response.status} ${response.statusText}`,
        data: null,
      };
    }

    const data: DashboardKPIsPayload = await response.json();
    return data;
  } catch (error) {
    return {
      error: error as string,
      data: null,
    };
  } finally {
    if (process.env.NODE_ENV === "development") {
      console.log(
        `getDashboardKPIs took ${(performance.now() - startTime).toFixed(2)}ms`
      );
    }
  }
}
