"use client";

import { createContext, useEffect, useRef, useState, useContext } from "react";
import { usePathname } from "next/navigation";
import { initializeUser } from "@/app/api/initializeUser";
import { saveConfig } from "@/app/api/saveConfig";
import { UserConfig } from "@/app/types/objects";
import { getConfigList } from "@/app/api/getConfigList";
import { getConfig } from "@/app/api/getConfig";
import {
  BasePayload,
  ConfigListEntry,
  ConfigPayload,
  CorrectSettings,
} from "@/app/types/payloads";
import { createConfig } from "@/app/api/createConfig";
import { loadConfig } from "@/app/api/loadConfig";
import { deleteConfig } from "@/app/api/deleteConfig";
import { ToastContext } from "./ToastContext";
import { useAuthenticatedFetch } from "@/hooks/useAuthenticatedFetch";
import { useOrganization } from "@clerk/nextjs";

export const SessionContext = createContext<{
  mode: string;
  id: string | null;
  showRateLimitDialog: boolean;
  enableRateLimitDialog: () => void;
  userConfig: UserConfig | null;
  savingConfig: boolean;
  fetchCurrentConfig: () => void;
  configIDs: ConfigListEntry[];
  updateConfig: (config: UserConfig, setDefault: boolean) => void;
  handleCreateConfig: () => void;
  getConfigIDs: () => void;
  handleLoadConfig: (config_id: string) => void;
  handleDeleteConfig: (config_id: string, selectedConfig: boolean) => void;
  loadingConfig: boolean;
  loadingConfigs: boolean;
  correctSettings: CorrectSettings | null;
  triggerFetchCollection: () => void;
  fetchCollectionFlag: boolean;
  initialized: boolean;
  triggerFetchConversation: () => void;
  fetchConversationFlag: boolean;
  updateUnsavedChanges: (unsaved: boolean) => void;
  unsavedChanges: boolean;
}>({
  mode: "home",
  id: "",
  showRateLimitDialog: false,
  enableRateLimitDialog: () => {},
  userConfig: null,
  savingConfig: false,
  fetchCurrentConfig: () => {},
  configIDs: [],
  updateConfig: () => {},
  handleCreateConfig: () => {},
  getConfigIDs: () => {},
  handleLoadConfig: () => {},
  handleDeleteConfig: () => {},
  loadingConfig: false,
  loadingConfigs: false,
  correctSettings: null,
  triggerFetchCollection: () => {},
  fetchCollectionFlag: false,
  initialized: false,
  triggerFetchConversation: () => {},
  fetchConversationFlag: false,
  updateUnsavedChanges: () => {},
  unsavedChanges: false,
});

export const SessionProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const { showErrorToast, showSuccessToast, showWarningToast } =
    useContext(ToastContext);

  const [mode, setMode] = useState<string>("home");

  const pathname = usePathname();

  const [showRateLimitDialog, setShowRateLimitDialog] =
    useState<boolean>(false);

  // Use Clerk authentication instead of device fingerprint
  const { userId, getAuthToken } = useAuthenticatedFetch();
  const id = userId; // Keep id for backward compatibility with existing code
  const { isLoaded: orgLoaded } = useOrganization();
  const [userConfig, setUserConfig] = useState<UserConfig | null>(null);
  const [configIDs, setConfigIDs] = useState<ConfigListEntry[]>([]);
  const [correctSettings, setCorrectSettings] =
    useState<CorrectSettings | null>(null);
  const [loadingConfig, setLoadingConfig] = useState<boolean>(false);
  const [loadingConfigs, setLoadingConfigs] = useState<boolean>(false);
  const [savingConfig, setSavingConfig] = useState<boolean>(false);
  const initialized = useRef(false);
  const [fetchCollectionFlag, setFetchCollectionFlag] =
    useState<boolean>(false);
  const [fetchConversationFlag, setFetchConversationFlag] =
    useState<boolean>(false);

  const [unsavedChanges, setUnsavedChanges] = useState<boolean>(false);

  const triggerFetchCollection = () => {
    setFetchCollectionFlag((prev) => !prev);
  };

  const triggerFetchConversation = () => {
    setFetchConversationFlag((prev) => !prev);
  };

  const getConfigIDs = async () => {
    setLoadingConfigs(true);
    setConfigIDs([]);
    const token = await getAuthToken();
    const configList = await getConfigList(token || undefined);

    if (configList.error) {
      showErrorToast("Failed to Load Configuration List", configList.error);
    }

    // Sort configs by last_used date in descending order (most recent first)
    const sortedConfigs = configList.configs.sort((a, b) => {
      return (
        new Date(b.last_update_time).getTime() -
        new Date(a.last_update_time).getTime()
      );
    });
    setConfigIDs(sortedConfigs);
    setLoadingConfigs(false);
  };

  // TODO : Add fetching all possible model names from the API

  const fetchCurrentConfig = async () => {
    setLoadingConfig(true);
    const token = await getAuthToken();
    const config = await getConfig(token || undefined);
    if (config.error) {
      console.error(config.error);
      showErrorToast("Failed to Load Configuration", config.error);
      return;
    }
    setUserConfig({
      backend: config.config,
      frontend: config.frontend_config,
    });
    setLoadingConfig(false);
  };

  const updateUnsavedChanges = (unsaved: boolean) => {
    setUnsavedChanges(unsaved);
  };

  useEffect(() => {
    if (initialized.current || !id || !orgLoaded) return;
    initUser();
  }, [id, orgLoaded]);

  useEffect(() => {
    if (pathname === "/") {
      setMode("home");
    } else if (
      pathname.startsWith("/data") ||
      pathname.startsWith("/collection")
    ) {
      setMode("data-explorer");
    } else if (pathname.startsWith("/eval")) {
      setMode("evaluation");
    } else if (pathname.startsWith("/about/data")) {
      setMode("about-data");
    } else if (pathname.startsWith("/about")) {
      setMode("about");
    } else if (pathname.startsWith("/settings")) {
      setMode("settings");
    }
  }, [pathname]);

  const initUser = async () => {
    const token = await getAuthToken();
    setLoadingConfig(true);

    try {
      // Add 10 second timeout to prevent indefinite hanging
      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error("API request timed out after 10 seconds")), 10000)
      );

      const user_object = await Promise.race([
        initializeUser(token || undefined),
        timeoutPromise,
      ]);

      if (user_object.error) {
        console.error(user_object.error);
        showErrorToast("Failed to Initialize User", user_object.error);
        setLoadingConfig(false);
        return;
      }

      if (process.env.NODE_ENV === "development") {
        console.log("Initialized user with id: " + id);
      }

      getConfigIDs();
      setUserConfig({
        backend: user_object.config,
        frontend: user_object.frontend_config,
      });
      setCorrectSettings(user_object.correct_settings);
      setLoadingConfig(false);
      showSuccessToast("User Initialized");
      initialized.current = true;
    } catch (error) {
      console.error("[SessionContext] initUser error:", error);
      showErrorToast(
        "Failed to Initialize User",
        error instanceof Error ? error.message : "Unknown error occurred"
      );
      setLoadingConfig(false);
    }
  };

  const enableRateLimitDialog = () => {
    setShowRateLimitDialog(true);
  };

  const updateConfig = async (
    config: UserConfig,
    setDefault: boolean = false
  ) => {
    setLoadingConfig(true);
    setSavingConfig(true);
    const token = await getAuthToken();
    const response: ConfigPayload = await saveConfig(
      config.backend,
      config.frontend,
      setDefault,
      token || undefined
    );
    if (response.error) {
      console.error(response.error);
      showErrorToast("Failed to Save Configuration", response.error);
    } else if (response.warnings.length > 0) {
      response.warnings.forEach((warning) => {
        showWarningToast("Configuration Saved with Warning", warning);
      });
    } else {
      showSuccessToast(
        "Configuration Saved",
        "Your configuration has been saved successfully."
      );
    }
    setUserConfig({
      backend: response.config,
      frontend: response.frontend_config,
    });
    getConfigIDs();
    setLoadingConfig(false);
    triggerFetchCollection();
    triggerFetchConversation();
    setSavingConfig(false);
  };

  const handleLoadConfig = async (config_id: string) => {
    if (!config_id) {
      return;
    }
    setLoadingConfig(true);
    const token = await getAuthToken();
    const response: ConfigPayload = await loadConfig(config_id, token || undefined);
    if (response.error) {
      console.error(response.error);
      showErrorToast("Failed to Load Configuration", response.error);
    } else {
      showSuccessToast(
        "Configuration Loaded",
        "Configuration loaded successfully."
      );
    }
    setUserConfig({
      backend: response.config,
      frontend: response.frontend_config,
    });
    setLoadingConfig(false);
  };

  const handleCreateConfig = async () => {
    setLoadingConfig(true);
    const token = await getAuthToken();
    const response: ConfigPayload = await createConfig(token || undefined);
    if (response.error) {
      console.error(response.error);
      showErrorToast("Failed to Create Configuration", response.error);
      setLoadingConfig(false);
      return;
    } else {
      showSuccessToast(
        "Configuration Created",
        "New configuration created successfully."
      );
    }

    // Check if name already exists and generate unique name if needed
    if (response.config) {
      const baseName = response.config.name || "New Config";
      let uniqueName = baseName;
      let counter = 1;

      while (configIDs.some((config) => config.name === uniqueName)) {
        uniqueName = `${baseName} ${counter}`;
        counter++;
      }

      // Update the config with unique name if needed
      if (uniqueName !== baseName) {
        response.config.name = uniqueName;
      }
    }

    setUserConfig({
      backend: response.config,
      frontend: response.frontend_config,
    });
    getConfigIDs();
    setLoadingConfig(false);
  };

  const handleDeleteConfig = async (
    config_id: string,
    selectedConfig: boolean
  ) => {
    if (!config_id) {
      return;
    }
    setLoadingConfig(true);
    const token = await getAuthToken();
    const response: BasePayload = await deleteConfig(config_id, token || undefined);
    if (response.error) {
      console.error(response.error);
      showErrorToast("Failed to Delete Configuration", response.error);
    } else {
      showSuccessToast(
        "Configuration Deleted",
        "Configuration deleted successfully."
      );
      if (selectedConfig) {
        // Find another config to load
        const otherConfig = configIDs.find(
          (config) => config.config_id !== config_id
        );
        if (otherConfig) {
          handleLoadConfig(otherConfig.config_id);
        } else {
          setUserConfig(null);
        }
      }
    }
    getConfigIDs();
    setLoadingConfig(false);
    triggerFetchConversation();
    triggerFetchCollection();
  };

  return (
    <SessionContext.Provider
      value={{
        mode,
        id,
        showRateLimitDialog,
        enableRateLimitDialog,
        userConfig,
        savingConfig,
        fetchCurrentConfig,
        configIDs,
        updateConfig,
        handleCreateConfig,
        getConfigIDs,
        handleLoadConfig,
        handleDeleteConfig,
        loadingConfig,
        loadingConfigs,
        correctSettings,
        fetchCollectionFlag,
        initialized: initialized.current,
        triggerFetchCollection,
        triggerFetchConversation,
        fetchConversationFlag,
        updateUnsavedChanges,
        unsavedChanges,
      }}
    >
      {children}
    </SessionContext.Provider>
  );
};
