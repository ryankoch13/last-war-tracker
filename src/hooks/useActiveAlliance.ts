import { useCallback, useEffect, useState } from "react";
import { getActiveAllianceState } from "../services/activeAlliance";
import { ActiveAllianceState } from "../types/alliance";

const initialState: ActiveAllianceState = {
  userId: null,
  member: null,
  activeAllianceId: null,
};

export function useActiveAlliance() {
  const [state, setState] = useState<ActiveAllianceState>(initialState);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadActiveAlliance = useCallback(async () => {
    try {
      setError(null);

      const nextState = await getActiveAllianceState();
      setState(nextState);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load active alliance.",
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  const refresh = useCallback(async () => {
    setRefreshing(true);
    await loadActiveAlliance();
  }, [loadActiveAlliance]);

  useEffect(() => {
    loadActiveAlliance();
  }, [loadActiveAlliance]);

  return {
    ...state,
    loading,
    refreshing,
    error,
    refresh,
    hasActiveAlliance: Boolean(state.activeAllianceId && state.member),
  };
}
