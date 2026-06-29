// src/services/memberStats.ts

import { supabase } from "../lib/supabase";
import { getCurrentUserMember } from "./allianceMembers";

export type DailyMemberStats = {
  id: string;
  alliance_id: string;
  member_id: string;
  date: string;
  donations: number;
  versus_points: number;
  created_at?: string;
  updated_at?: string;
};

type UpdateMyDailyStatsInput = {
  allianceId: string;
  date: string;
  donations: number;
  versusPoints: number;
};

export async function getMyDailyStats(
  allianceId: string,
): Promise<DailyMemberStats[]> {
  const member = await getCurrentUserMember(allianceId);

  const { data, error } = await supabase
    .from("daily_member_stats")
    .select("*")
    .eq("alliance_id", allianceId)
    .eq("member_id", member.id)
    .order("date", { ascending: false });

  if (error) {
    throw error;
  }

  return data ?? [];
}

export async function updateMyDailyStats({
  allianceId,
  date,
  donations,
  versusPoints,
}: UpdateMyDailyStatsInput): Promise<DailyMemberStats> {
  const member = await getCurrentUserMember(allianceId);

  const { data, error } = await supabase
    .from("daily_member_stats")
    .upsert(
      {
        alliance_id: allianceId,
        member_id: member.id,
        date,
        donations,
        versus_points: versusPoints,
        updated_at: new Date().toISOString(),
      },
      {
        onConflict: "alliance_id,member_id,date",
      },
    )
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
}
