import { BasePayload } from "@/app/types/payloads";
import { fetchWithAuth } from "@/lib/api/client";

export async function setDefaultConfig(
  token?: string
): Promise<BasePayload> {
  const startTime = performance.now();
  try {
    const response = await fetchWithAuth(`/api/default_config`, {
      method: "POST",
      body: JSON.stringify({}),
      token,
    });

    if (!response.ok) {
      console.error(
        `Set Default Config error! status: ${response.status} ${response.statusText}`,
      );
      return { error: "Failed to set default config" };
    }

    const data: BasePayload = await response.json();
    return data;
  } catch (error) {
    console.error("Set Default Config error:", error);
    return { error: "Failed to set default config" };
  } finally {
    if (process.env.NODE_ENV === "development") {
      console.log(
        `api/default_config took ${(performance.now() - startTime).toFixed(
          2,
        )}ms`,
      );
    }
  }
}
