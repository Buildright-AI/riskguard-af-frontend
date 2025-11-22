"use client";

import React, { useContext, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { getModels } from "../api/getModels";
import { SessionContext } from "../components/contexts/SessionContext";
import { ModelProvider } from "../types/objects";
import { useAuthenticatedFetch } from "@/hooks/useAuthenticatedFetch";

// Custom hooks
import { useConfigState } from "../components/configuration/hooks/useConfigState";
import { useConfigValidation } from "../components/configuration/hooks/useConfigValidation";

// Components
import ConfigSidebar, {
  DesktopConfigSidebar,
} from "../components/configuration/ConfigSidebar";
import ConfigNameEditor from "../components/configuration/ConfigNameEditor";
import ConfigActions from "../components/configuration/ConfigActions";
import AgentSection from "../components/configuration/sections/AgentSection";
import ModelsSection from "../components/configuration/sections/ModelsSection";

// Utilities
import { ToastContext } from "../components/contexts/ToastContext";

/**
 * Main Settings Page Component - Refactored for better maintainability
 *
 * This component orchestrates the entire configuration interface, including:
 * - Configuration selection and management (sidebar/mobile dropdown)
 * - Config name editing with validation
 * - Save/cancel/delete actions with proper state management
 * - Multiple configuration sections (Weaviate, Storage, Agent, Models, API Keys)
 * - Environment file import functionality
 *
 * The component uses custom hooks for state management and validation,
 * and breaks down the UI into focused, reusable components.
 */
export default function Home() {
  const {
    userConfig,
    configIDs,
    updateConfig,
    handleCreateConfig,
    getConfigIDs,
    handleLoadConfig,
    handleDeleteConfig,
    loadingConfig,
    loadingConfigs,
    savingConfig,
    updateUnsavedChanges,
  } = useContext(SessionContext);

  // Get authentication token for API calls
  const { getAuthToken } = useAuthenticatedFetch();

  // Configuration state management
  const {
    currentUserConfig,
    currentFrontendConfig,
    changedConfig,
    matchingConfig,
    editName,
    isNewConfig,
    isDefaultConfig,
    nameExists,
    nameIsEmpty,
    setCurrentUserConfig,
    setChangedConfig,
    setEditName,
    updateFields,
    updateAgentConfigFields,
    cancelConfig,
  } = useConfigState(userConfig, configIDs);

  const { showConfirmModal } = useContext(ToastContext);

  // Models data state
  const [modelsData, setModelsData] = useState<{
    [key: string]: ModelProvider;
  } | null>(null);
  const [loadingModels, setLoadingModels] = useState<boolean>(true);

  // Configuration validation
  const {
    currentValidation,
    isConfigValid,
    getModelsIssues,
  } = useConfigValidation(currentUserConfig);

  // Modal and UI state
  const [saveAsDefault, setSaveAsDefault] = useState<boolean>(true);

  // Fetch models data on component mount
  useEffect(() => {
    const fetchModels = async () => {
      try {
        setLoadingModels(true);
        const token = await getAuthToken();
        const modelsPayload = await getModels(token || undefined);
        if (modelsPayload.error) {
          console.error("Error fetching models:", modelsPayload.error);
        } else {
          setModelsData(modelsPayload.models);
        }
      } catch (error) {
        console.error("Failed to fetch models:", error);
      } finally {
        setLoadingModels(false);
      }
    };

    fetchModels();
  }, [getAuthToken]);

  // Helper function to handle saving configuration
  const handleSaveConfig = (setDefault: boolean = false) => {
    if (currentUserConfig && currentFrontendConfig) {
      updateConfig(
        {
          backend: currentUserConfig,
          frontend: currentFrontendConfig,
        },
        setDefault
      );
      setChangedConfig(false);
      setEditName(false);
    }
  };

  // Helper function to handle config selection
  const selectConfig = (configId: string) => {
    if (changedConfig) {
      showConfirmModal(
        "Unsaved Changes",
        "You have unsaved changes. Are you sure you want to load a new config?",
        () => selectConfigFunction(configId)
      );
    } else {
      selectConfigFunction(configId);
    }
  };

  const selectConfigFunction = (configId: string) => {
    handleLoadConfig(configId);
    setEditName(false);
  };

  // Helper function to create a new config
  const handleCreateConfigWithUniqueName = async () => {
    if (changedConfig) {
      showConfirmModal(
        "Unsaved Changes",
        "You have unsaved changes. Are you sure you want to create a new config?",
        () => handleCreateConfigFunction()
      );
    } else {
      handleCreateConfigFunction();
    }
  };

  const handleCreateConfigFunction = async () => {
    await handleCreateConfig();
    setChangedConfig(false);
    setEditName(false);
  };

  useEffect(() => {
    updateUnsavedChanges(changedConfig);
  }, [changedConfig]);

  return (
    <div className="flex flex-col w-full h-screen">
      <div className="flex flex-col w-full gap-4 min-h-0 items-start justify-start h-full fade-in p-2 lg:p-4">
        {/* Mobile Config Selector - Only visible on small screens */}
        <ConfigSidebar
          currentUserConfig={currentUserConfig}
          configIDs={configIDs}
          loadingConfigs={loadingConfigs}
          onCreateConfig={handleCreateConfigWithUniqueName}
          onRefreshConfigs={() => getConfigIDs()}
          onSelectConfig={selectConfig}
          onDeleteConfig={(configId, isCurrentConfig) =>
            handleDeleteConfig(configId, isCurrentConfig)
          }
        />

        <div className="flex flex-row w-full gap-4 min-h-0 items-start justify-start h-full">
          {/* Desktop Sidebar */}
          <DesktopConfigSidebar
            currentUserConfig={currentUserConfig}
            configIDs={configIDs}
            loadingConfigs={loadingConfigs}
            onCreateConfig={handleCreateConfigWithUniqueName}
            onRefreshConfigs={() => getConfigIDs()}
            onSelectConfig={selectConfig}
            onDeleteConfig={(configId, isCurrentConfig) =>
              handleDeleteConfig(configId, isCurrentConfig)
            }
          />

          {/* Main Content Area */}
          <div className="flex w-full lg:w-3/4 xl:w-4/5 flex-col min-h-0 h-full fade-in">
            {currentUserConfig && currentFrontendConfig && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="flex flex-col lg:flex-row items-start lg:items-end justify-between gap-4 w-full py-4 flex-shrink-0"
              >
                {/* Configuration Name Editor */}
                <ConfigNameEditor
                  currentUserConfig={currentUserConfig}
                  editName={editName}
                  nameExists={nameExists}
                  nameIsEmpty={nameIsEmpty}
                  isNewConfig={isNewConfig}
                  isDefaultConfig={isDefaultConfig}
                  loadingConfigs={loadingConfigs}
                  onNameChange={(name) => updateFields("name", name)}
                  onEditStart={() => setEditName(true)}
                  onEditEnd={() => setEditName(false)}
                />

                {/* Configuration Actions */}
                <ConfigActions
                  changedConfig={changedConfig}
                  matchingConfig={matchingConfig}
                  isNewConfig={isNewConfig}
                  isDefaultConfig={isDefaultConfig}
                  isConfigValid={isConfigValid}
                  nameExists={nameExists}
                  nameIsEmpty={nameIsEmpty}
                  loadingConfig={loadingConfig}
                  loadingConfigs={loadingConfigs}
                  savingConfig={savingConfig}
                  saveAsDefault={saveAsDefault}
                  userConfigId={userConfig?.backend?.id}
                  onSaveAsDefaultChange={setSaveAsDefault}
                  onSaveConfig={handleSaveConfig}
                  onCancelConfig={cancelConfig}
                  onDeleteConfig={() => {
                    if (userConfig?.backend?.id) {
                      handleDeleteConfig(userConfig.backend.id, true);
                    }
                  }}
                />
              </motion.div>
            )}

            {/* Scrollable Configuration Sections */}
            {userConfig ? (
              <div
                className={`flex flex-col gap-6 overflow-y-auto pb-8 flex-1 min-h-0 fade-in transition-opacity mb-8 ${
                  loadingConfig ? "opacity-70" : "opacity-100"
                }`}
              >
                <div className="flex flex-col gap-2">
                  {/* Agent Configuration */}
                  <AgentSection
                    currentUserConfig={currentUserConfig}
                    onUpdateFields={updateFields}
                    onUpdateSettings={updateAgentConfigFields}
                  />

                  {/* Models Configuration */}
                  <ModelsSection
                    currentUserConfig={currentUserConfig}
                    modelsData={modelsData}
                    loadingModels={loadingModels}
                    modelsIssues={getModelsIssues()}
                    baseProviderValid={currentValidation.base_provider}
                    baseModelValid={currentValidation.base_model}
                    complexProviderValid={currentValidation.complex_provider}
                    complexModelValid={currentValidation.complex_model}
                    onUpdateSettings={updateAgentConfigFields}
                    onUpdateConfig={setCurrentUserConfig}
                    setChangedConfig={setChangedConfig}
                  />
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-full w-full">
                <p className="text-primary shine">Loading config...</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
