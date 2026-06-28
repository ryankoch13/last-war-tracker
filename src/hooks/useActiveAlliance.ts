import { useEffect } from "react";

import { useAllianceStore } from "../store/allianceStore";

export function useActiveAlliance() {
  const alliance = useAllianceStore((state) => state.alliance);
  const allianceUser = useAllianceStore((state) => state.allianceUser);
  const loading = useAllianceStore((state) => state.loading);
  const hasLoaded = useAllianceStore((state) => state.hasLoaded);
  const error = useAllianceStore((state) => state.error);
  const loadAlliance = useAllianceStore((state) => state.loadAlliance);

  useEffect(() => {
    if (!hasLoaded && !loading) {
      loadAlliance();
    }
  }, [hasLoaded, loading, loadAlliance]);

  return {
    alliance,
    allianceUser,

    activeAlliance: alliance,
    activeAllianceId: alliance?.id ?? null,

    loading,
    hasLoaded,
    error,
    hasActiveAlliance: !!alliance,
  };
}

export function useActiveAllianceId() {
  const alliance = useAllianceStore((state) => state.alliance);

  return alliance?.id ?? null;
}
