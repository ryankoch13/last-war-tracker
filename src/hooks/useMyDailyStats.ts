// src/hooks/useMyDailyStats.ts

import { useCallback, useEffect, useState } from "react";

import {
    DailyMemberStats,
    getMyDailyStats,
    updateMyDailyStats,
} from "../services/memberStats";

type SaveStatsInput = {
  date: string;
  donations: number;
  versusPoints: number;
};

export function useMyDailyStats(allianceId: string) {
  const [stats, setStats] = useState<DailyMemberStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadStats = useCallback(async () => {
    try {
      setError(null);

      const rows = await getMyDailyStats(allianceId);
      setStats(rows);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load your stats.",
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [allianceId]);

  const refresh = useCallback(async () => {
    setRefreshing(true);
    await loadStats();
  }, [loadStats]);

  const saveStats = useCallback(
    async ({ date, donations, versusPoints }: SaveStatsInput) => {
      try {
        setSaving(true);
        setError(null);

        const saved = await updateMyDailyStats({
          allianceId,
          date,
          donations,
          versusPoints,
        });

        setStats((currentStats) => {
          const existingIndex = currentStats.findIndex(
            (row) =>
              row.alliance_id === saved.alliance_id &&
              row.member_id === saved.member_id &&
              row.date === saved.date,
          );

          if (existingIndex === -1) {
            return [saved, ...currentStats].sort((a, b) =>
              b.date.localeCompare(a.date),
            );
          }

          const nextStats = [...currentStats];
          nextStats[existingIndex] = saved;

          return nextStats.sort((a, b) => b.date.localeCompare(a.date));
        });

        return saved;
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Failed to save your stats.";

        setError(message);
        throw err;
      } finally {
        setSaving(false);
      }
    },
    [allianceId],
  );

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  return {
    stats,
    loading,
    saving,
    refreshing,
    error,
    refresh,
    saveStats,
  };
}
