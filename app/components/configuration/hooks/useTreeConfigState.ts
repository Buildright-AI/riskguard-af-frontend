import { useState, useEffect } from "react";
import { BackendConfig } from "@/app/types/objects";
import { isEqual } from "lodash";
import { getTreeConfig } from "@/app/api/getTreeConfig";
import { saveTreeConfig } from "@/app/api/saveTreeConfig";
import { newTreeConfig } from "@/app/api/newTreeConfig";
import { useAuthenticatedFetch } from "@/hooks/useAuthenticatedFetch";

/**
 * Custom hook for managing tree-specific configuration state
 * Handles loading, saving, resetting tree configurations for specific conversations
 */
export function useTreeConfigState(
  conversation_id: string | null | undefined
) {
  const { getAuthToken } = useAuthenticatedFetch();
  const [originalConfig, setOriginalConfig] = useState<BackendConfig | null>(
    null
  );
  const [currentConfig, setCurrentConfig] = useState<BackendConfig | null>(
    null
  );
  const [changedConfig, setChangedConfig] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  // Fetch tree configuration from API
  const fetchTreeConfig = async () => {
    if (!conversation_id) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const token = await getAuthToken();
      const data = await getTreeConfig(conversation_id, token || undefined);
      if (data.config) {
        setOriginalConfig(data.config);
        setCurrentConfig({ ...data.config });
        setChangedConfig(false);
      }
    } catch (error) {
      console.error("Failed to fetch tree config:", error);
    } finally {
      setLoading(false);
    }
  };

  // Save current configuration
  const handleSaveConfig = async () => {
    if (currentConfig) {
      const token = await getAuthToken();
      const data = await saveTreeConfig(
        conversation_id,
        currentConfig,
        token || undefined
      );
      if (data.config) {
        setOriginalConfig({ ...data.config });
        setCurrentConfig({ ...data.config });
        setChangedConfig(false);
      }
    }
  };

  // Reset configuration to default
  const resetConfig = async () => {
    const token = await getAuthToken();
    const data = await newTreeConfig(conversation_id, token || undefined);
    if (data.config) {
      setOriginalConfig({ ...data.config });
      setCurrentConfig({ ...data.config });
      setChangedConfig(false);
    }
  };

  // Cancel changes and revert to original
  const cancelConfig = () => {
    if (originalConfig) {
      setCurrentConfig({ ...originalConfig });
      setChangedConfig(false);
    }
  };

  // Update general config fields
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const updateFields = (key: string, value: any) => {
    if (currentConfig) {
      setCurrentConfig({
        ...currentConfig,
        [key]: value,
      });
    }
  };

  // Update settings fields
  const updateSettingsFields = (
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    keyOrUpdates: string | Record<string, any>,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    value?: any
  ) => {
    if (currentConfig) {
      if (typeof keyOrUpdates === "string") {
        // Single key-value update
        setCurrentConfig({
          ...currentConfig,
          settings: {
            ...currentConfig.settings,
            [keyOrUpdates]: value,
          },
        });
      } else {
        // Multiple key-value updates
        setCurrentConfig({
          ...currentConfig,
          settings: {
            ...currentConfig.settings,
            ...keyOrUpdates,
          },
        });
      }
    }
  };

  // Effect to fetch config when dependencies change
  useEffect(() => {
    fetchTreeConfig();
  }, [conversation_id]);

  // Effect to track changes
  useEffect(() => {
    if (currentConfig && originalConfig) {
      const configsMatch = isEqual(currentConfig, originalConfig);
      setChangedConfig(!configsMatch);
    }
  }, [currentConfig, originalConfig]);

  return {
    // State
    originalConfig,
    currentConfig,
    changedConfig,
    loading,

    // Actions
    handleSaveConfig,
    resetConfig,
    cancelConfig,
    updateFields,
    updateSettingsFields,
    fetchTreeConfig,

    // State setters (for complex updates)
    setCurrentConfig,
  };
}
