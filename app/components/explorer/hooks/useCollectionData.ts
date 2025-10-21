import { useState, useEffect } from "react";
import { getCollectionData } from "@/app/api/getCollection";
import { Collection } from "@/app/types/objects";
import { CollectionDataPayload } from "@/app/types/payloads";
import { useAuthenticatedFetch } from "@/hooks/useAuthenticatedFetch";

interface UseCollectionDataProps {
  collection: Collection | null;
}

export function useCollectionData({ collection }: UseCollectionDataProps) {
  const { getAuthToken } = useAuthenticatedFetch();
  const [collectionData, setCollectionData] =
    useState<CollectionDataPayload | null>(null);
  const [ascending, setAscending] = useState(true);
  const [sortOn, setSortOn] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(50);
  const [query, setQuery] = useState("");
  const [usingQuery, setUsingQuery] = useState(false);
  const [loadingData, setLoadingData] = useState(false);

  const loadCollectionData = async () => {
    if (!collection) return;
    setLoadingData(true);
    const filter_config = {
      type: "and",
      filters: [],
    };

    if (query.length > 0) {
      if (!usingQuery) {
        setPage(1);
        setUsingQuery(true);
      }
    } else {
      setUsingQuery(false);
    }

    const token = await getAuthToken();
    const data = await getCollectionData(
      collection.name,
      page,
      pageSize,
      sortOn,
      ascending,
      filter_config,
      query,
      token || undefined
    );
    setCollectionData(data);
    setLoadingData(false);
  };

  useEffect(() => {
    loadCollectionData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, pageSize, ascending, sortOn, collection]);

  return {
    collectionData,
    setCollectionData,
    ascending,
    setAscending,
    sortOn,
    setSortOn,
    page,
    setPage,
    pageSize,
    setPageSize,
    query,
    setQuery,
    usingQuery,
    setUsingQuery,
    loadCollectionData,
    loadingData,
  };
}
