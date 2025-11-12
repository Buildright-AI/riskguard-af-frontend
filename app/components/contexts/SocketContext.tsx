"use client";

import { createContext, useEffect, useState } from "react";
import { Message } from "@/app/types/chat";
import { getWebsocketHost } from "../host";
import { useContext, useRef } from "react";
import { ConversationContext } from "./ConversationContext";
import { ToastContext } from "./ToastContext";
import { useAuthenticatedFetch } from "@/hooks/useAuthenticatedFetch";
import { useUniqueToast } from "@/lib/hooks/useUniqueToast";

export const SocketContext = createContext<{
  socketOnline: boolean;
  sendQuery: (
    query: string,
    conversation_id: string,
    query_id: string,
    route?: string,
    mimick?: boolean
  ) => Promise<boolean>;
  stopQuery: (conversation_id: string, query_id: string) => void;
}>({
  socketOnline: false,
  sendQuery: async () => false,
  stopQuery: () => {},
});

export const SocketProvider = ({ children }: { children: React.ReactNode }) => {
  const {
    setConversationStatus,
    setAllConversationStatuses,
    handleAllConversationsError,
    getAllEnabledCollections,
    handleWebsocketMessage,
  } = useContext(ConversationContext);

  const { showErrorToast } = useContext(ToastContext);
  const { showUniqueSuccessToast } = useUniqueToast();

  // Get authentication token for WebSocket connection
  const { getAuthToken, isSignedIn } = useAuthenticatedFetch();

  const [socketOnline, setSocketOnline] = useState(false);
  const [socket, setSocket] = useState<WebSocket>();

  // Track initialization state properly
  const [hasInitialized, setHasInitialized] = useState(false);
  const initializationInProgress = useRef(false);
  const reconnectAttempts = useRef(0);

  // Initialize WebSocket connection when user signs in (only once initially)
  useEffect(() => {
    // Guard: Only initialize once when user signs in
    if (hasInitialized || initializationInProgress.current || !isSignedIn) {
      return;
    }

    initializationInProgress.current = true;

    const initializeSocket = async () => {
      try {
        const token = await getAuthToken();
        if (!token) {
          console.error("No authentication token available for WebSocket");
          initializationInProgress.current = false;
          return;
        }

        // Append JWT token to WebSocket URL as query parameter
        const socketHost = getWebsocketHost() + `query?token=${encodeURIComponent(token)}`;
        const localSocket = new WebSocket(socketHost);

        localSocket.onopen = () => {
          setSocketOnline(true);
          setHasInitialized(true);
          initializationInProgress.current = false;
          reconnectAttempts.current = 0;

          // Use unique toast to prevent duplicates on initial connection
          showUniqueSuccessToast("socket_connected", "Connected to RiskGuard");

          if (process.env.NODE_ENV === "development") {
            console.log("Socket opened");
          }
        };

        localSocket.onmessage = (event) => {
          try {
            const message: Message = JSON.parse(event.data);
            handleWebsocketMessage(message);
          } catch (error) {
            if (process.env.NODE_ENV === "development") {
              console.error(error);
            }
          }
        };

        localSocket.onerror = (error) => {
          if (process.env.NODE_ENV === "development") {
            console.log(error);
          }
          setSocketOnline(false);
          setSocket(undefined);
          setAllConversationStatuses("");
          handleAllConversationsError();
          initializationInProgress.current = false;
          // Only show error toast on subsequent errors, not initial connection
          if (hasInitialized) {
            showErrorToast("Connection to RiskGuard lost");
          }
        };

        localSocket.onclose = () => {
          setSocketOnline(false);
          setAllConversationStatuses("");
          setSocket(undefined);
          handleAllConversationsError();
          initializationInProgress.current = false;

          // Only show error toast if connection was previously established
          if (hasInitialized) {
            showErrorToast("Connection to RiskGuard lost");
          }

          if (process.env.NODE_ENV === "development") {
            console.log("Socket closed");
          }
        };

        setSocket(localSocket);
      } catch (error) {
        console.error("Failed to initialize WebSocket:", error);
        initializationInProgress.current = false;
      }
    };

    initializeSocket();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSignedIn, hasInitialized]);

  // Auto-reconnect logic - only after initial connection is established
  useEffect(() => {
    if (!hasInitialized) {
      return;
    }

    const interval = setInterval(() => {
      if (!socketOnline || socket?.readyState === WebSocket.CLOSED || !socket) {
        if (reconnectAttempts.current < 10) {
          console.log("Elysia not online, trying to reconnect...");
          reconnectAttempts.current += 1;

          // Reset hasInitialized to trigger reconnect
          setHasInitialized(false);
        }
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [socketOnline, socket, hasInitialized]);

  const sendQuery = async (
    query: string,
    conversation_id: string,
    query_id: string,
    route: string = "",
    mimick: boolean = false
  ) => {
    setConversationStatus("Thinking...", conversation_id);
    const enabled_collections = getAllEnabledCollections();

    if (process.env.NODE_ENV === "development") {
      console.log(
        `Sending query with enabled collections: ${enabled_collections} to conversation ${conversation_id}`
      );
    }

    // user_id is now extracted from JWT token on backend
    socket?.send(
      JSON.stringify({
        query,
        query_id,
        conversation_id,
        collection_names: enabled_collections,
        route,
        mimick,
      })
    );

    return Promise.resolve(true);
  };

  const stopQuery = (conversation_id: string, query_id: string) => {
    if (process.env.NODE_ENV === "development") {
      console.log(`Sending stop request for conversation ${conversation_id}, query ${query_id}`);
    }

    socket?.send(
      JSON.stringify({
        type: "cancel",
        conversation_id,
        query_id,
      })
    );
  };

  return (
    <SocketContext.Provider value={{ socketOnline, sendQuery, stopQuery }}>
      {children}
    </SocketContext.Provider>
  );
};
