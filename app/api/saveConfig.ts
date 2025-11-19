import { ConfigPayload } from "@/app/types/payloads";
import { fetchWithAuth } from "@/lib/api/client";
import { BackendConfig, FrontendConfig } from "../types/objects";

export async function saveConfig(
  backend_config: BackendConfig | null,
  frontend_config: FrontendConfig | null,
  default_config: boolean = true,
  token?: string
): Promise<ConfigPayload> {
  const startTime = performance.now();
  try {
    if (!backend_config) {
      return {
        error: "No backend config",
        config: null,
        frontend_config: null,
        warnings: [],
      };
    }

    // Validate that config has a valid ID before attempting to save
    if (!backend_config.id) {
      return {
        error: "Cannot save config: Missing config ID. Please create a new config first.",
        config: null,
        frontend_config: null,
        warnings: [],
      };
    }

    const response = await fetchWithAuth(
      `/api/config/${backend_config.id}`,
      {
        method: "POST",
        body: JSON.stringify({
          name: backend_config.name,
          config: backend_config,
          frontend_config: frontend_config,
          default: default_config,
        }),
        token,
      }
    );

    if (!response.ok) {
      console.error(
        `Saving Config error! status: ${response.status} ${response.statusText}`
      );
      return {
        error: `Saving Config error! status: ${response.status} ${response.statusText}`,
        config: null,
        frontend_config: null,
        warnings: [],
      };
    }
    const data: ConfigPayload = await response.json();

    return data;
  } catch (error) {
    console.error("Saving Config error:", error);
    return {
      error: error as string,
      config: null,
      frontend_config: null,
      warnings: [],
    };
  } finally {
    if (process.env.NODE_ENV === "development") {
      console.log(
        `Saving Config took ${(performance.now() - startTime).toFixed(2)}ms`
      );
    }
  }
}
