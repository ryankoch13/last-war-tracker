import { supabase } from "./supabase";

export type TrainAssignment = {
  id: string;
  allianceId: string;
  trainName: string;
  scheduledDate: string;
  departureTime: string;
  guardIds: string[];
  passengerIds: string[];
  notes: string | null;
  createdAt: string | null;
};

type TrainAssignmentRow = {
  id: string;
  alliance_id: string;
  train_name: string | null;
  scheduled_date: string;
  guard_ids: string[] | null;
  passenger_ids: string[] | null;
  notes: string | null;
  created_at: string | null;
};

function normalizeStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.filter((item): item is string => typeof item === "string");
}

function mapTrainAssignment(row: TrainAssignmentRow): TrainAssignment {
  return {
    id: row.id,
    allianceId: row.alliance_id,
    trainName: row.train_name ?? "Alliance Train",
    scheduledDate: row.scheduled_date,
    departureTime: row.scheduled_date,
    guardIds: normalizeStringArray(row.guard_ids),
    passengerIds: normalizeStringArray(row.passenger_ids),
    notes: row.notes ?? null,
    createdAt: row.created_at ?? null,
  };
}

export async function getTrainAssignments(
  allianceId: string,
): Promise<TrainAssignment[]> {
  if (!allianceId) {
    return [];
  }

  const { data, error } = await supabase
    .from("train_assignments")
    .select(
      `
      id,
      alliance_id,
      train_name,
      scheduled_date,
      guard_ids,
      passenger_ids,
      notes,
      created_at
    `,
    )
    .eq("alliance_id", allianceId)
    .order("scheduled_date", { ascending: true });

  if (error) {
    throw error;
  }

  return ((data ?? []) as TrainAssignmentRow[]).map(mapTrainAssignment);
}

export async function getUpcomingTrainAssignments(
  allianceId: string,
): Promise<TrainAssignment[]> {
  if (!allianceId) {
    return [];
  }

  const now = new Date().toISOString();

  const { data, error } = await supabase
    .from("train_assignments")
    .select(
      `
      id,
      alliance_id,
      train_name,
      scheduled_date,
      guard_ids,
      passenger_ids,
      notes,
      created_at
    `,
    )
    .eq("alliance_id", allianceId)
    .gte("scheduled_date", now)
    .order("scheduled_date", { ascending: true });

  if (error) {
    throw error;
  }

  return ((data ?? []) as TrainAssignmentRow[]).map(mapTrainAssignment);
}

export async function getPastTrainAssignments(
  allianceId: string,
): Promise<TrainAssignment[]> {
  if (!allianceId) {
    return [];
  }

  const now = new Date().toISOString();

  const { data, error } = await supabase
    .from("train_assignments")
    .select(
      `
      id,
      alliance_id,
      train_name,
      scheduled_date,
      guard_ids,
      passenger_ids,
      notes,
      created_at
    `,
    )
    .eq("alliance_id", allianceId)
    .lt("scheduled_date", now)
    .order("scheduled_date", { ascending: false });

  if (error) {
    throw error;
  }

  return ((data ?? []) as TrainAssignmentRow[]).map(mapTrainAssignment);
}

export async function createTrainAssignment(input: {
  allianceId: string;
  trainName: string;
  scheduledDate: string;
  guardIds?: string[];
  passengerIds?: string[];
  notes?: string | null;
}): Promise<TrainAssignment> {
  const {
    allianceId,
    trainName,
    scheduledDate,
    guardIds = [],
    passengerIds = [],
    notes = null,
  } = input;

  if (!allianceId) {
    throw new Error("Alliance ID is required.");
  }

  if (!trainName.trim()) {
    throw new Error("Train name is required.");
  }

  if (!scheduledDate) {
    throw new Error("Scheduled date is required.");
  }

  const { data, error } = await supabase
    .from("train_assignments")
    .insert({
      alliance_id: allianceId,
      train_name: trainName.trim(),
      scheduled_date: scheduledDate,
      guard_ids: guardIds,
      passenger_ids: passengerIds,
      notes,
    })
    .select(
      `
      id,
      alliance_id,
      train_name,
      scheduled_date,
      guard_ids,
      passenger_ids,
      notes,
      created_at
    `,
    )
    .single();

  if (error) {
    throw error;
  }

  return mapTrainAssignment(data as TrainAssignmentRow);
}

export async function updateTrainAssignment(input: {
  id: string;
  trainName?: string;
  scheduledDate?: string;
  guardIds?: string[];
  passengerIds?: string[];
  notes?: string | null;
}): Promise<TrainAssignment> {
  const { id, trainName, scheduledDate, guardIds, passengerIds, notes } = input;

  if (!id) {
    throw new Error("Train assignment ID is required.");
  }

  const updates: Record<string, unknown> = {};

  if (trainName !== undefined) {
    updates.train_name = trainName.trim();
  }

  if (scheduledDate !== undefined) {
    updates.scheduled_date = scheduledDate;
  }

  if (guardIds !== undefined) {
    updates.guard_ids = guardIds;
  }

  if (passengerIds !== undefined) {
    updates.passenger_ids = passengerIds;
  }

  if (notes !== undefined) {
    updates.notes = notes;
  }

  const { data, error } = await supabase
    .from("train_assignments")
    .update(updates)
    .eq("id", id)
    .select(
      `
      id,
      alliance_id,
      train_name,
      scheduled_date,
      guard_ids,
      passenger_ids,
      notes,
      created_at
    `,
    )
    .single();

  if (error) {
    throw error;
  }

  return mapTrainAssignment(data as TrainAssignmentRow);
}

export async function deleteTrainAssignment(id: string): Promise<void> {
  if (!id) {
    throw new Error("Train assignment ID is required.");
  }

  const { error } = await supabase
    .from("train_assignments")
    .delete()
    .eq("id", id);

  if (error) {
    throw error;
  }
}
