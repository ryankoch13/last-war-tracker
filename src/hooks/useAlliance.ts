// src/hooks/useAlliance.ts

import { useCallback, useEffect, useState } from "react";
import { Alliance, getAllianceById } from "../services/alliances";

function getErrorMessage(err: unknown) {
  if (err instanceof Error) {
    return err.message;
  }

  if (typeof err === "object" && err !== null && "message" in err) {
    return String((err as { message: unknown }).message);
  }

  return "Failed to load alliance.";
}

export function useAlliance(allianceId: string) {
  const [alliance, setAlliance] = useState<Alliance | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadAlliance = useCallback(async () => {
    try {
      setError(null);

      const row = await getAllianceById(allianceId);
      setAlliance(row);
    } catch (err) {
      console.log("USE ALLIANCE ERROR:", err);
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [allianceId]);

  const refresh = useCallback(async () => {
    setRefreshing(true);
    await loadAlliance();
  }, [loadAlliance]);

  useEffect(() => {
    loadAlliance();
  }, [loadAlliance]);

  return {
    alliance,
    loading,
    refreshing,
    error,
    refresh,
  };
}
