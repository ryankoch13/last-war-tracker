// lib/trainAssignments.ts
import { supabase } from "@/lib/supabase";

export type TrainAssignment = {
  id: string;
  allianceId: string;
  title: string;
  type: string;
  scheduledAt: string;
  conductorName: string | null;
  description: string | null;
  assignedMemberIds: string[];
  createdAt: string;
};

type TrainAssignmentRow = {
  id: string;
  alliance_id: string;
  title: string;
  type: string;
  scheduled_at: string;
  conductor_name: string | null;
  description: string | null;
  assigned_member_ids: string[] | null;
  created_at: string;
};

function mapTrainAssignment(row: TrainAssignmentRow): TrainAssignment {
  return {
    id: row.id,
    allianceId: row.alliance_id,
    title: row.title,
    type: row.type,
    scheduledAt: row.scheduled_at,
    conductorName: row.conductor_name,
    description: row.description,
    assignedMemberIds: row.assigned_member_ids ?? [],
    createdAt: row.created_at,
  };
}

export async function getTrainAssignments(allianceId: string) {
  const { data, error } = await supabase
    .from("train_assignments")
    .select("*")
    .eq("alliance_id", allianceId)
    .order("scheduled_at", { ascending: true });

  if (error) {
    throw error;
  }

  return (data ?? []).map((row) =>
    mapTrainAssignment(row as TrainAssignmentRow),
  );
}

export async function createTrainAssignment(input: {
  allianceId: string;
  title: string;
  type: string;
  scheduledAt: string;
  conductorName?: string | null;
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
    .from("train_assignments")
    .insert({
      alliance_id: input.allianceId,
      title: input.title,
      type: input.type,
      scheduled_at: input.scheduledAt,
      conductor_name: input.conductorName ?? null,
      description: input.description ?? null,
      assigned_member_ids: input.assignedMemberIds ?? [],
      created_by: user?.id ?? null,
    })
    .select("*")
    .single();

  if (error) {
    throw error;
  }

  return mapTrainAssignment(data as TrainAssignmentRow);
}
