// lib/events.ts
import { AllianceEvent } from "./allianceEvents";
import { supabase } from "./supabase";

export async function getAllianceEvents(allianceId: string) {
  const { data, error } = await supabase
    .from("alliance_events")
    .select("*")
    .eq("alliance_id", allianceId)
    .order("starts_at", { ascending: true });

  if (error) throw error;

  return data as AllianceEvent[];
}

export async function createAllianceEvent(input: {
  allianceId: string;
  title: string;
  eventType: string;
  startsAt: string;
  endsAt?: string;
  notes?: string;
}) {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError) throw userError;

  const { data, error } = await supabase
    .from("alliance_events")
    .insert({
      alliance_id: input.allianceId,
      title: input.title,
      event_type: input.eventType,
      starts_at: input.startsAt,
      ends_at: input.endsAt || null,
      notes: input.notes || null,
      created_by: user?.id ?? null,
    })
    .select()
    .single();

  if (error) throw error;

  return data as AllianceEvent;
}
