"use client";

import { createContext, useEffect, useState } from "react";
import { Message } from "@/app/types/chat";
import { getWebsocketHost } from "../host";
import { useContext, useRef } from "react";
import { ConversationContext } from "./ConversationContext";
import { ToastContext } from "./ToastContext";
import { useAuthenticatedFetch } from "@/hooks/useAuthenticatedFetch";

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

  const { showErrorToast, showSuccessToast } = useContext(ToastContext);

  // Get authentication token for WebSocket connection
  const { getAuthToken, isSignedIn } = useAuthenticatedFetch();

  const [socketOnline, setSocketOnline] = useState(false);
  const [socket, setSocket] = useState<WebSocket>();
  const [reconnect, setReconnect] = useState(false);
  const initialRef = useRef(false);

  useEffect(() => {
    setReconnect(true);
  }, []);

  useEffect(() => {
    if (!initialRef.current) {
      return;
    }

    const interval = setInterval(() => {
      if (!socketOnline || socket?.readyState === WebSocket.CLOSED || !socket) {
        console.log("Elysia not online, trying to reconnect...");
        initialRef.current = false;
        setReconnect((prev) => !prev);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [socketOnline, socket]);

  useEffect(() => {
    if (initialRef.current || !isSignedIn) {
      return;
    }

    // Initialize WebSocket connection with JWT token
    const initializeSocket = async () => {
      try {
        const token = await getAuthToken();
        if (!token) {
          console.error("No authentication token available for WebSocket");
          return;
        }

        initialRef.current = true;

        // Append JWT token to WebSocket URL as query parameter
        const socketHost = getWebsocketHost() + `query?token=${encodeURIComponent(token)}`;
        const localSocket = new WebSocket(socketHost);

        localSocket.onopen = () => {
          setSocketOnline(true);
          showSuccessToast("Connected to RiskGuard");
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
          showErrorToast("Connection to RiskGuard lost");
        };

        localSocket.onclose = () => {
          setSocketOnline(false);
          setAllConversationStatuses("");
          setSocket(undefined);
          handleAllConversationsError();
          showErrorToast("Connection to RiskGuard lost");
          if (process.env.NODE_ENV === "development") {
            console.log("Socket closed");
          }
        };

        setSocket(localSocket);
      } catch (error) {
        console.error("Failed to initialize WebSocket:", error);
        initialRef.current = false;
      }
    };

    initializeSocket();
  }, [reconnect, isSignedIn]);

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
