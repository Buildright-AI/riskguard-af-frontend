import { useMemo } from "react";
import { BackendConfig } from "@/app/types/objects";

/**
 * Custom hook for validating configuration settings
 * Handles validation for models
 */
export function useConfigValidation(
  currentUserConfig: BackendConfig | null
) {
  // Dynamic validation based on current config values
  const currentValidation = useMemo(() => {
    if (!currentUserConfig) {
      return {
        base_provider: false,
        base_model: false,
        complex_provider: false,
        complex_model: false,
      };
    }

    return {
      base_provider: Boolean(currentUserConfig.agent_config.BASE_PROVIDER?.trim()),
      base_model: Boolean(currentUserConfig.agent_config.BASE_MODEL?.trim()),
      complex_provider: Boolean(
        currentUserConfig.agent_config.COMPLEX_PROVIDER?.trim()
      ),
      complex_model: Boolean(currentUserConfig.agent_config.COMPLEX_MODEL?.trim()),
    };
  }, [currentUserConfig]);

  // Helper function to get storage validation issues
  const getStorageIssues = useMemo(() => {
    // Storage uses global system settings from .env, no validation needed
    return [];
  }, []);

  // Overall config validation status
  const isConfigValid = useMemo(() => {
    return (
      currentValidation.base_provider &&
      currentValidation.base_model &&
      currentValidation.complex_provider &&
      currentValidation.complex_model &&
      getStorageIssues.length === 0
    );
  }, [currentValidation, getStorageIssues]);

  // Helper functions to get warning issues for each section
  const getModelsIssues = () => {
    const issues: string[] = [];
    if (!currentValidation.base_provider) issues.push("Base Provider");
    if (!currentValidation.base_model) issues.push("Base Model");
    if (!currentValidation.complex_provider) issues.push("Complex Provider");
    if (!currentValidation.complex_model) issues.push("Complex Model");
    return issues;
  };

  return {
    currentValidation,
    getStorageIssues,
    isConfigValid,
    getModelsIssues,
  };
}
