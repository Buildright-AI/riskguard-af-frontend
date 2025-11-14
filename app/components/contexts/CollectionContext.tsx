"use client";

import { createContext, useContext, useEffect, useRef, useState, useCallback } from "react";
import { Collection } from "@/app/types/objects";
import { getCollections } from "@/app/api/getCollections";
import { SessionContext } from "./SessionContext";
import { deleteCollectionMetadata } from "@/app/api/deleteCollectionMetadata";
import { ToastContext } from "./ToastContext";
import { useAuthenticatedFetch } from "@/hooks/useAuthenticatedFetch";
import { useUniqueToast } from "@/lib/hooks/useUniqueToast";

export const CollectionContext = createContext<{
  collections: Collection[];
  fetchCollections: () => void;
  loadingCollections: boolean;
  deleteCollection: (collection_name: string) => void;
  getRandomPrompts: (amount: number) => string[];
}>({
  collections: [],
  fetchCollections: () => {},
  loadingCollections: false,
  deleteCollection: () => {},
  getRandomPrompts: () => [],
});

export const CollectionProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const { id, fetchCollectionFlag, initialized } = useContext(SessionContext);
  const { showErrorToast, showSuccessToast } = useContext(ToastContext);
  const { showUniqueSuccessToast } = useUniqueToast();
  const { getAuthToken } = useAuthenticatedFetch();
  const [collections, setCollections] = useState<Collection[]>([]);
  const [loadingCollections, setLoadingCollections] = useState(false);

  // Track initialization state properly
  const [hasInitiallyFetched, setHasInitiallyFetched] = useState(false);
  const fetchInProgress = useRef(false);
  const idRef = useRef(id);

  const fetchCollections = useCallback(async (showToast: boolean = false) => {
    if (!idRef.current) return;

    setCollections([]);
    setLoadingCollections(true);
    const token = await getAuthToken();
    const collections: Collection[] = await getCollections(token || undefined);
    setCollections(collections);
    setLoadingCollections(false);

    // Only show toast on initial load, not on subsequent refetches
    if (showToast) {
      showUniqueSuccessToast(
        "collections_loaded",
        `${collections.length} Collections Loaded`
      );
    }

    // Mark as initially fetched
    if (!hasInitiallyFetched) {
      setHasInitiallyFetched(true);
    }
    fetchInProgress.current = false;
  }, [getAuthToken, hasInitiallyFetched, showUniqueSuccessToast]);

  // Initial fetch when user is initialized
  useEffect(() => {
    // Guard: Only fetch once when user is initialized
    if (hasInitiallyFetched || fetchInProgress.current || !id || !initialized) {
      return;
    }

    fetchInProgress.current = true;
    idRef.current = id;
    fetchCollections(true); // Pass true to indicate initial load
  }, [id, initialized, hasInitiallyFetched, fetchCollections]);

  // Refetch when triggered by config changes
  useEffect(() => {
    // Skip if not initialized yet or already fetching
    if (!hasInitiallyFetched || fetchInProgress.current) {
      return;
    }

    fetchCollections(false); // Pass false to indicate refetch (no toast)
  }, [fetchCollectionFlag, hasInitiallyFetched, fetchCollections]);

  const deleteCollection = async (collection_name: string) => {
    if (!idRef.current) return;
    const token = await getAuthToken();
    const result = await deleteCollectionMetadata(
      collection_name,
      token || undefined
    );

    if (result.error) {
      showErrorToast("Failed to Remove Analysis", result.error);
    } else {
      showSuccessToast(
        "Analysis Removed",
        `Analysis for "${collection_name}" has been removed successfully.`
      );
      // Refetch without showing toast (user already sees delete success)
      fetchCollections(false);
    }
  };

  const getRandomPrompts = (amount: number = 4) => {
    // Merge all prompts from all collections into a single array
    const allPrompts = collections.reduce((acc: string[], collection) => {
      return acc.concat(collection.prompts || []);
    }, []);

    // Shuffle the array and return requested amount
    const shuffled = allPrompts.sort(() => 0.5 - Math.random());
    return shuffled.slice(0, amount);
  };

  return (
    <CollectionContext.Provider
      value={{
        collections,
        fetchCollections,
        loadingCollections,
        deleteCollection,
        getRandomPrompts,
      }}
    >
      {children}
    </CollectionContext.Provider>
  );
};
