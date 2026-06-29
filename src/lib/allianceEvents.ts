// lib/allianceEvents.ts
import { supabase } from "@/lib/supabase";

export type AllianceEvent = {
  id: string;
  allianceId: string;
  title: string;
  type: string;
  startsAt: string;
  endsAt: string | null;
  description: string | null;
  assignedMemberIds: string[];
  createdAt: string;
};

type AllianceEventRow = {
  id: string;
  alliance_id: string;
  title: string;
  type: string;
  starts_at: string;
  ends_at: string | null;
  description: string | null;
  assigned_member_ids: string[] | null;
  created_at: string;
};

function mapAllianceEvent(row: AllianceEventRow): AllianceEvent {
  return {
    id: row.id,
    allianceId: row.alliance_id,
    title: row.title,
    type: row.type,
    startsAt: row.starts_at,
    endsAt: row.ends_at,
    description: row.description,
    assignedMemberIds: row.assigned_member_ids ?? [],
    createdAt: row.created_at,
  };
}

export async function getAllianceEvents(allianceId: string) {
  const { data, error } = await supabase
    .from("alliance_events")
    .select("*")
    .eq("alliance_id", allianceId)
    .order("starts_at", { ascending: true });

  if (error) {
    throw error;
  }

  return (data ?? []).map((row) => mapAllianceEvent(row as AllianceEventRow));
}

export async function createAllianceEvent(input: {
  allianceId: string;
  title: string;
  type: string;
  startsAt: string;
  endsAt?: string | null;
  description?: string | null;
  assignedMemberIds?: string[];
}) {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError) {
    throw userError;
  }

  const { data, error } = await supabase
    .from("alliance_events")
    .insert({
      alliance_id: input.allianceId,
      title: input.title,
      type: input.type,
      starts_at: input.startsAt,
      ends_at: input.endsAt ?? null,
      description: input.description ?? null,
      assigned_member_ids: input.assignedMemberIds ?? [],
      created_by: user?.id ?? null,
    })
    .select("*")
    .single();

  if (error) {
    throw error;
  }

  return mapAllianceEvent(data as AllianceEventRow);
}
