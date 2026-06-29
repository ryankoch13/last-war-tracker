import { create } from "zustand";

import { supabase } from "@/lib/supabase";

export enum AllianceRole {
  R1 = "r1",
  R2 = "r2",
  R3 = "r3",
  R4 = "r4",
  R5 = "r5",
}

export enum AllianceEventType {
  VS = "VS",
  DesertStorm = "Desert Storm",
  CapitalWar = "Capital War",
  RareSoil = "Rare Soil",
  Train = "Train",
  Custom = "Custom",
}

export enum BoardItemStatus {
  Active = "active",
  Completed = "completed",
}

export type Alliance = {
  id: string;
  name: string;
  inviteCode: string;
  createdBy: string | null;
  createdAt: string | null;
  updatedAt: string | null;
};

export type AllianceUser = {
  allianceId: string;
  userId: string;
  role: AllianceRole;
  createdAt: string | null;
};

export type AllianceMember = {
  id: string;
  allianceId: string;
  userId?: string | null;
  name: string;
  role: AllianceRole;
  power: number;
  level: number | null;
  notes?: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt?: string | null;
};

export type DailyMemberStat = {
  id: string;
  allianceId: string;
  memberId: string;
  date: string;
  donations: number;
  versusPoints: number;
  notes?: string | null;
  createdAt: string;
  updatedAt?: string | null;
};

export type TrainAssignment = {
  id: string;
  allianceId: string;
  date: string;
  trainName: string;
  conductorMemberId?: string | null;
  passengerMemberId?: string | null;
  notes?: string | null;
  status: BoardItemStatus;
  completedAt?: string | null;
  createdAt: string;
  updatedAt?: string | null;
};

export type AllianceEvent = {
  id: string;
  allianceId: string;
  name: string;
  type: AllianceEventType;
  date: string;
  notes?: string | null;
  assignedMemberIds: string[];
  status: BoardItemStatus;
  completedAt?: string | null;
  createdAt: string;
  updatedAt?: string | null;
};

type AllianceStoreState = {
  activeAllianceId: string | null;
  activeAlliance: Alliance | null;
  allianceUser: AllianceUser | null;

  members: AllianceMember[];
  dailyStats: DailyMemberStat[];
  trainAssignments: TrainAssignment[];
  events: AllianceEvent[];

  loading: boolean;
  error: string | null;
  hasLoaded: boolean;

  loadActiveAlliance: () => Promise<void>;
  createAllianceAndMember: (
    allianceName: string,
    memberName: string,
  ) => Promise<void>;
  joinAllianceAndClaimMember: (
    inviteCode: string,
    memberName: string,
  ) => Promise<void>;
  clearActiveAlliance: () => void;
  clearError: () => void;
  signOut: () => Promise<void>;

  addMember: (
    member: Omit<AllianceMember, "id" | "allianceId" | "createdAt">,
  ) => Promise<void>;
  updateMember: (
    memberId: string,
    updates: Partial<AllianceMember>,
  ) => Promise<void>;
  deleteMember: (memberId: string) => Promise<void>;

  addDailyStat: (
    stat: Omit<DailyMemberStat, "id" | "allianceId" | "createdAt">,
  ) => Promise<void>;
  updateDailyStat: (
    statId: string,
    updates: Partial<DailyMemberStat>,
  ) => Promise<void>;
  deleteDailyStat: (statId: string) => Promise<void>;

  addTrainAssignment: (
    assignment: Omit<TrainAssignment, "id" | "allianceId" | "createdAt">,
  ) => Promise<void>;
  updateTrainAssignment: (
    assignmentId: string,
    updates: Partial<TrainAssignment>,
  ) => Promise<void>;
  completeTrainAssignment: (assignmentId: string) => Promise<void>;
  reopenTrainAssignment: (assignmentId: string) => Promise<void>;
  deleteTrainAssignment: (assignmentId: string) => Promise<void>;

  addAllianceEvent: (
    event: Omit<AllianceEvent, "id" | "allianceId" | "createdAt">,
  ) => Promise<void>;
  updateAllianceEvent: (
    eventId: string,
    updates: Partial<AllianceEvent>,
  ) => Promise<void>;
  completeAllianceEvent: (eventId: string) => Promise<void>;
  reopenAllianceEvent: (eventId: string) => Promise<void>;
  deleteAllianceEvent: (eventId: string) => Promise<void>;

  loadDemoData: () => void;
  clearDemoData: () => void;
};

function nowIso() {
  return new Date().toISOString();
}

function generateInviteCode() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";

  for (let i = 0; i < 8; i += 1) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }

  return code;
}

function normalizeRole(role: string | null | undefined): AllianceRole {
  const value = role?.toLowerCase();

  if (value === AllianceRole.R5) return AllianceRole.R5;
  if (value === AllianceRole.R4) return AllianceRole.R4;
  if (value === AllianceRole.R3) return AllianceRole.R3;
  if (value === AllianceRole.R2) return AllianceRole.R2;

  return AllianceRole.R1;
}

function normalizeEventType(
  type: string | null | undefined,
): AllianceEventType {
  if (type === AllianceEventType.DesertStorm) {
    return AllianceEventType.DesertStorm;
  }

  if (type === AllianceEventType.CapitalWar) {
    return AllianceEventType.CapitalWar;
  }

  if (type === AllianceEventType.RareSoil) {
    return AllianceEventType.RareSoil;
  }

  if (type === AllianceEventType.Train) {
    return AllianceEventType.Train;
  }

  if (type === AllianceEventType.Custom) {
    return AllianceEventType.Custom;
  }

  return AllianceEventType.VS;
}

function normalizeStatus(status: string | null | undefined): BoardItemStatus {
  if (status === BoardItemStatus.Completed) {
    return BoardItemStatus.Completed;
  }

  return BoardItemStatus.Active;
}

export function formatAllianceRole(
  role: AllianceRole | string | null | undefined,
) {
  return normalizeRole(role).toUpperCase();
}

function mapAlliance(row: any): Alliance {
  return {
    id: row.id,
    name: row.name ?? "Unnamed Alliance",
    inviteCode: row.invite_code ?? "",
    createdBy: row.created_by ?? null,
    createdAt: row.created_at ?? null,
    updatedAt: row.updated_at ?? null,
  };
}

function mapAllianceUser(row: any): AllianceUser {
  return {
    allianceId: row.alliance_id,
    userId: row.user_id,
    role: normalizeRole(row.role),
    createdAt: row.created_at ?? null,
  };
}

function mapMember(row: any): AllianceMember {
  return {
    id: row.id,
    allianceId: row.alliance_id,
    userId: row.user_id ?? null,
    name: row.display_name ?? row.name ?? row.username ?? "Unnamed Member",
    role: normalizeRole(row.role),
    power: Number(row.power ?? 0),
    level: row.level ?? null,
    notes: row.notes ?? null,
    isActive: row.is_active ?? true,
    createdAt: row.created_at ?? nowIso(),
    updatedAt: row.updated_at ?? null,
  };
}

function mapDailyStat(row: any): DailyMemberStat {
  return {
    id: row.id,
    allianceId: row.alliance_id,
    memberId: row.member_id,
    date: row.date,
    donations: Number(row.donations ?? 0),
    versusPoints: Number(row.versus_points ?? 0),
    notes: row.notes ?? null,
    createdAt: row.created_at ?? nowIso(),
    updatedAt: row.updated_at ?? null,
  };
}

function mapTrainAssignment(row: any): TrainAssignment {
  return {
    id: row.id,
    allianceId: row.alliance_id,
    date: row.date,
    trainName: row.train_name ?? "Train",
    conductorMemberId: row.conductor_member_id ?? null,
    passengerMemberId: row.passenger_member_id ?? null,
    notes: row.notes ?? null,
    status: normalizeStatus(row.status),
    completedAt: row.completed_at ?? null,
    createdAt: row.created_at ?? nowIso(),
    updatedAt: row.updated_at ?? null,
  };
}

function mapAllianceEvent(row: any): AllianceEvent {
  return {
    id: row.id,
    allianceId: row.alliance_id,
    name: row.name ?? "Event",
    type: normalizeEventType(row.type),
    date: row.date,
    notes: row.notes ?? null,
    assignedMemberIds: row.assigned_member_ids ?? [],
    status: normalizeStatus(row.status),
    completedAt: row.completed_at ?? null,
    createdAt: row.created_at ?? nowIso(),
    updatedAt: row.updated_at ?? null,
  };
}

async function loadAllianceData(allianceId: string) {
  const [
    membersResult,
    dailyStatsResult,
    trainAssignmentsResult,
    eventsResult,
  ] = await Promise.all([
    supabase
      .from("members")
      .select(
        "id,alliance_id,user_id,display_name,role,power,level,notes,is_active,created_at,updated_at",
      )
      .eq("alliance_id", allianceId)
      .order("display_name", { ascending: true }),

    supabase
      .from("daily_member_stats")
      .select(
        "id,alliance_id,member_id,date,donations,versus_points,notes,created_at,updated_at",
      )
      .eq("alliance_id", allianceId)
      .order("date", { ascending: false }),

    supabase
      .from("train_assignments")
      .select(
        "id,alliance_id,date,train_name,conductor_member_id,passenger_member_id,notes,status,completed_at,created_at,updated_at",
      )
      .eq("alliance_id", allianceId)
      .order("date", { ascending: false }),

    supabase
      .from("alliance_events")
      .select(
        "id,alliance_id,name,type,date,notes,assigned_member_ids,status,completed_at,created_at,updated_at",
      )
      .eq("alliance_id", allianceId)
      .order("date", { ascending: false }),
  ]);

  if (membersResult.error) throw membersResult.error;
  if (dailyStatsResult.error) throw dailyStatsResult.error;
  if (trainAssignmentsResult.error) throw trainAssignmentsResult.error;
  if (eventsResult.error) throw eventsResult.error;

  return {
    members: (membersResult.data ?? []).map(mapMember),
    dailyStats: (dailyStatsResult.data ?? []).map(mapDailyStat),
    trainAssignments: (trainAssignmentsResult.data ?? []).map(
      mapTrainAssignment,
    ),
    events: (eventsResult.data ?? []).map(mapAllianceEvent),
  };
}

export const useAllianceStore = create<AllianceStoreState>((set, get) => ({
  activeAllianceId: null,
  activeAlliance: null,
  allianceUser: null,

  members: [],
  dailyStats: [],
  trainAssignments: [],
  events: [],

  loading: false,
  error: null,
  hasLoaded: false,

  loadActiveAlliance: async () => {
    set({ loading: true, error: null });

    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError) {
        throw userError;
      }

      if (!user) {
        set({
          activeAllianceId: null,
          activeAlliance: null,
          allianceUser: null,
          members: [],
          dailyStats: [],
          trainAssignments: [],
          events: [],
          loading: false,
          hasLoaded: true,
          error: null,
        });
        return;
      }

      const { data: allianceUserRow, error: allianceUserError } = await supabase
        .from("alliance_users")
        .select("alliance_id,user_id,role,created_at")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (allianceUserError) {
        throw allianceUserError;
      }

      if (!allianceUserRow) {
        set({
          activeAllianceId: null,
          activeAlliance: null,
          allianceUser: null,
          members: [],
          dailyStats: [],
          trainAssignments: [],
          events: [],
          loading: false,
          hasLoaded: true,
          error: null,
        });
        return;
      }

      const { data: allianceRow, error: allianceError } = await supabase
        .from("alliances")
        .select("id,name,invite_code,created_by,created_at,updated_at")
        .eq("id", allianceUserRow.alliance_id)
        .maybeSingle();

      if (allianceError) {
        throw allianceError;
      }

      if (!allianceRow) {
        set({
          activeAllianceId: null,
          activeAlliance: null,
          allianceUser: null,
          members: [],
          dailyStats: [],
          trainAssignments: [],
          events: [],
          loading: false,
          hasLoaded: true,
          error: null,
        });
        return;
      }

      const activeAlliance = mapAlliance(allianceRow);
      const allianceUser = mapAllianceUser(allianceUserRow);
      const allianceData = await loadAllianceData(activeAlliance.id);

      set({
        activeAllianceId: activeAlliance.id,
        activeAlliance,
        allianceUser,
        ...allianceData,
        loading: false,
        hasLoaded: true,
        error: null,
      });
    } catch (error) {
      console.error("LOAD ACTIVE ALLIANCE ERROR:", error);

      set({
        activeAllianceId: null,
        activeAlliance: null,
        allianceUser: null,
        members: [],
        dailyStats: [],
        trainAssignments: [],
        events: [],
        loading: false,
        hasLoaded: true,
        error:
          error instanceof Error
            ? error.message
            : "Could not load active alliance.",
      });
    }
  },

  createAllianceAndMember: async (allianceName, memberName) => {
    const trimmedAllianceName = allianceName.trim();
    const trimmedMemberName = memberName.trim();

    if (!trimmedAllianceName) {
      throw new Error("Alliance name is required.");
    }

    if (!trimmedMemberName) {
      throw new Error("Member name is required.");
    }

    set({ loading: true, error: null });

    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError) throw userError;

      if (!user) {
        throw new Error("You must be signed in to create an alliance.");
      }

      const { error: metadataError } = await supabase.auth.updateUser({
        data: {
          member_name: trimmedMemberName,
        },
      });

      if (metadataError) throw metadataError;

      const { data: allianceRow, error: allianceError } = await supabase
        .from("alliances")
        .insert({
          name: trimmedAllianceName,
          invite_code: generateInviteCode(),
          created_by: user.id,
        })
        .select("id,name,invite_code,created_by,created_at,updated_at")
        .single();

      if (allianceError) throw allianceError;

      const { data: allianceUserRow, error: allianceUserError } = await supabase
        .from("alliance_users")
        .insert({
          alliance_id: allianceRow.id,
          user_id: user.id,
          role: AllianceRole.R5,
        })
        .select("alliance_id,user_id,role,created_at")
        .single();

      if (allianceUserError) throw allianceUserError;

      const { data: memberRow, error: memberError } = await supabase
        .from("members")
        .insert({
          alliance_id: allianceRow.id,
          user_id: user.id,
          display_name: trimmedMemberName,
          role: AllianceRole.R5,
          power: 0,
          level: null,
          notes: null,
          is_active: true,
        })
        .select(
          "id,alliance_id,user_id,display_name,role,power,level,notes,is_active,created_at,updated_at",
        )
        .single();

      if (memberError) throw memberError;

      const activeAlliance = mapAlliance(allianceRow);
      const allianceUser = mapAllianceUser(allianceUserRow);
      const currentMember = mapMember(memberRow);

      set({
        activeAllianceId: activeAlliance.id,
        activeAlliance,
        allianceUser,
        members: [currentMember],
        dailyStats: [],
        trainAssignments: [],
        events: [],
        loading: false,
        hasLoaded: true,
        error: null,
      });
    } catch (error) {
      console.error("CREATE ALLIANCE ERROR:", error);

      const message =
        error instanceof Error ? error.message : "Failed to create alliance.";

      set({
        error: message,
        loading: false,
      });

      throw error;
    }
  },

  joinAllianceAndClaimMember: async (inviteCode, memberName) => {
    const trimmedInviteCode = inviteCode.trim().toUpperCase();
    const trimmedMemberName = memberName.trim();

    if (!trimmedInviteCode) {
      throw new Error("Invite code is required.");
    }

    if (!trimmedMemberName) {
      throw new Error("Member name is required.");
    }

    set({ loading: true, error: null });

    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError) throw userError;

      if (!user) {
        throw new Error("You must be signed in to join an alliance.");
      }

      const { data: allianceRow, error: allianceError } = await supabase
        .from("alliances")
        .select("id,name,invite_code,created_by,created_at,updated_at")
        .eq("invite_code", trimmedInviteCode)
        .maybeSingle();

      if (allianceError) throw allianceError;

      if (!allianceRow) {
        throw new Error("No alliance found for that invite code.");
      }

      const { error: metadataError } = await supabase.auth.updateUser({
        data: {
          member_name: trimmedMemberName,
        },
      });

      if (metadataError) throw metadataError;

      const { data: allianceUserRow, error: allianceUserError } = await supabase
        .from("alliance_users")
        .upsert(
          {
            alliance_id: allianceRow.id,
            user_id: user.id,
            role: AllianceRole.R1,
          },
          {
            onConflict: "alliance_id,user_id",
          },
        )
        .select("alliance_id,user_id,role,created_at")
        .single();

      if (allianceUserError) throw allianceUserError;

      await supabase
        .from("members")
        .delete()
        .eq("alliance_id", allianceRow.id)
        .eq("user_id", user.id);

      const { data: memberRow, error: memberError } = await supabase
        .from("members")
        .insert({
          alliance_id: allianceRow.id,
          user_id: user.id,
          display_name: trimmedMemberName,
          role: AllianceRole.R1,
          power: 0,
          level: null,
          notes: null,
          is_active: true,
        })
        .select(
          "id,alliance_id,user_id,display_name,role,power,level,notes,is_active,created_at,updated_at",
        )
        .single();

      if (memberError) throw memberError;

      const activeAlliance = mapAlliance(allianceRow);
      const allianceUser = mapAllianceUser(allianceUserRow);
      const allianceData = await loadAllianceData(activeAlliance.id);

      set({
        activeAllianceId: activeAlliance.id,
        activeAlliance,
        allianceUser,
        ...allianceData,
        members: [
          ...allianceData.members.filter(
            (member) => member.id !== memberRow.id,
          ),
          mapMember(memberRow),
        ].sort((a, b) => a.name.localeCompare(b.name)),
        loading: false,
        hasLoaded: true,
        error: null,
      });
    } catch (error) {
      console.error("JOIN ALLIANCE ERROR:", error);

      const message =
        error instanceof Error ? error.message : "Failed to join alliance.";

      set({
        error: message,
        loading: false,
      });

      throw error;
    }
  },

  clearActiveAlliance: () => {
    set({
      activeAllianceId: null,
      activeAlliance: null,
      allianceUser: null,
      members: [],
      dailyStats: [],
      trainAssignments: [],
      events: [],
      loading: false,
      error: null,
      hasLoaded: true,
    });
  },

  clearError: () => {
    set({ error: null });
  },

  signOut: async () => {
    const { error } = await supabase.auth.signOut();

    if (error) throw error;

    set({
      activeAllianceId: null,
      activeAlliance: null,
      allianceUser: null,
      members: [],
      dailyStats: [],
      trainAssignments: [],
      events: [],
      loading: false,
      error: null,
      hasLoaded: true,
    });
  },

  addMember: async (member) => {
    const allianceId = get().activeAllianceId;

    if (!allianceId) {
      throw new Error("No active alliance selected.");
    }

    const trimmedName = member.name.trim();

    if (!trimmedName) {
      throw new Error("Member name is required.");
    }

    const payload = {
      alliance_id: allianceId,
      user_id: member.userId ?? null,
      display_name: trimmedName,
      role: normalizeRole(member.role),
      power: Number(member.power ?? 0),
      level: member.level ?? null,
      notes: member.notes?.trim() ? member.notes.trim() : null,
      is_active: member.isActive ?? true,
    };

    console.log("ADDING MEMBER PAYLOAD:", payload);

    const { data: memberRow, error } = await supabase
      .from("members")
      .insert(payload)
      .select(
        "id,alliance_id,user_id,display_name,role,power,level,notes,is_active,created_at,updated_at",
      )
      .single();

    if (error) {
      console.error("ADD MEMBER ERROR:", error);
      throw error;
    }

    console.log("ADDED MEMBER ROW:", memberRow);

    const newMember = mapMember(memberRow);

    set((state) => ({
      members: [...(state.members ?? []), newMember].sort((a, b) =>
        a.name.localeCompare(b.name),
      ),
    }));

    // Safety reload so every screen gets the freshest Supabase version.
    await get().loadActiveAlliance();
  },

  updateMember: async (memberId, updates) => {
    const { data: memberRow, error } = await supabase
      .from("members")
      .update({
        display_name: updates.name,
        role: updates.role ? normalizeRole(updates.role) : undefined,
        power:
          updates.power === undefined ? undefined : Number(updates.power ?? 0),
        level: updates.level,
        notes: updates.notes,
        is_active: updates.isActive,
      })
      .eq("id", memberId)
      .select(
        "id,alliance_id,user_id,display_name,role,power,level,notes,is_active,created_at,updated_at",
      )
      .single();

    if (error) {
      console.error("UPDATE MEMBER ERROR:", error);
      throw error;
    }

    const updatedMember = mapMember(memberRow);

    set((state) => ({
      members: (state.members ?? [])
        .map((member) => (member.id === memberId ? updatedMember : member))
        .sort((a, b) => a.name.localeCompare(b.name)),
    }));
  },

  deleteMember: async (memberId) => {
    const { error } = await supabase
      .from("members")
      .delete()
      .eq("id", memberId);

    if (error) {
      console.error("DELETE MEMBER ERROR:", error);
      throw error;
    }

    set((state) => ({
      members: (state.members ?? []).filter((member) => member.id !== memberId),
      dailyStats: (state.dailyStats ?? []).filter(
        (stat) => stat.memberId !== memberId,
      ),
      trainAssignments: (state.trainAssignments ?? []).filter(
        (assignment) =>
          assignment.conductorMemberId !== memberId &&
          assignment.passengerMemberId !== memberId,
      ),
      events: (state.events ?? []).map((event) => ({
        ...event,
        assignedMemberIds: (event.assignedMemberIds ?? []).filter(
          (assignedMemberId) => assignedMemberId !== memberId,
        ),
      })),
    }));
  },

  addDailyStat: async (stat) => {
    const allianceId = get().activeAllianceId;

    if (!allianceId) {
      throw new Error("No active alliance selected.");
    }

    const { data: statRow, error } = await supabase
      .from("daily_member_stats")
      .insert({
        alliance_id: allianceId,
        member_id: stat.memberId,
        date: stat.date,
        donations: Number(stat.donations ?? 0),
        versus_points: Number(stat.versusPoints ?? 0),
        notes: stat.notes ?? null,
      })
      .select(
        "id,alliance_id,member_id,date,donations,versus_points,notes,created_at,updated_at",
      )
      .single();

    if (error) {
      console.error("ADD DAILY STAT ERROR:", error);
      throw error;
    }

    const newStat = mapDailyStat(statRow);

    set((state) => ({
      dailyStats: [newStat, ...(state.dailyStats ?? [])],
    }));
  },

  updateDailyStat: async (statId, updates) => {
    const { data: statRow, error } = await supabase
      .from("daily_member_stats")
      .update({
        date: updates.date,
        donations:
          updates.donations === undefined
            ? undefined
            : Number(updates.donations ?? 0),
        versus_points:
          updates.versusPoints === undefined
            ? undefined
            : Number(updates.versusPoints ?? 0),
        notes: updates.notes,
      })
      .eq("id", statId)
      .select(
        "id,alliance_id,member_id,date,donations,versus_points,notes,created_at,updated_at",
      )
      .single();

    if (error) {
      console.error("UPDATE DAILY STAT ERROR:", error);
      throw error;
    }

    const updatedStat = mapDailyStat(statRow);

    set((state) => ({
      dailyStats: (state.dailyStats ?? []).map((stat) =>
        stat.id === statId ? updatedStat : stat,
      ),
    }));
  },

  deleteDailyStat: async (statId) => {
    const { error } = await supabase
      .from("daily_member_stats")
      .delete()
      .eq("id", statId);

    if (error) {
      console.error("DELETE DAILY STAT ERROR:", error);
      throw error;
    }

    set((state) => ({
      dailyStats: (state.dailyStats ?? []).filter((stat) => stat.id !== statId),
    }));
  },

  addTrainAssignment: async (assignment) => {
    const allianceId = get().activeAllianceId;

    if (!allianceId) {
      throw new Error("No active alliance selected.");
    }

    const { data: assignmentRow, error } = await supabase
      .from("train_assignments")
      .insert({
        alliance_id: allianceId,
        date: assignment.date,
        title: assignment.trainName,
        train_name: assignment.trainName,
        conductor_member_id: assignment.conductorMemberId ?? null,
        passenger_member_id: assignment.passengerMemberId ?? null,
        notes: assignment.notes ?? null,
        status: assignment.status ?? BoardItemStatus.Active,
        completed_at: assignment.completedAt ?? null,
      })
      .select(
        "id,alliance_id,date,train_name,conductor_member_id,passenger_member_id,notes,status,completed_at,created_at,updated_at",
      )
      .single();

    if (error) {
      console.error("ADD TRAIN ASSIGNMENT ERROR:", error);
      throw error;
    }

    const newAssignment = mapTrainAssignment(assignmentRow);

    set((state) => ({
      trainAssignments: [newAssignment, ...(state.trainAssignments ?? [])],
    }));
  },

  updateTrainAssignment: async (assignmentId, updates) => {
    const { data: assignmentRow, error } = await supabase
      .from("train_assignments")
      .update({
        date: updates.date,
        train_name: updates.trainName,
        conductor_member_id: updates.conductorMemberId,
        passenger_member_id: updates.passengerMemberId,
        notes: updates.notes,
        status: updates.status,
        completed_at: updates.completedAt,
      })
      .eq("id", assignmentId)
      .select(
        "id,alliance_id,date,train_name,conductor_member_id,passenger_member_id,notes,status,completed_at,created_at,updated_at",
      )
      .single();

    if (error) {
      console.error("UPDATE TRAIN ASSIGNMENT ERROR:", error);
      throw error;
    }

    const updatedAssignment = mapTrainAssignment(assignmentRow);

    set((state) => ({
      trainAssignments: (state.trainAssignments ?? []).map((assignment) =>
        assignment.id === assignmentId ? updatedAssignment : assignment,
      ),
    }));
  },

  completeTrainAssignment: async (assignmentId) => {
    await get().updateTrainAssignment(assignmentId, {
      status: BoardItemStatus.Completed,
      completedAt: nowIso(),
    });
  },

  reopenTrainAssignment: async (assignmentId) => {
    await get().updateTrainAssignment(assignmentId, {
      status: BoardItemStatus.Active,
      completedAt: null,
    });
  },

  deleteTrainAssignment: async (assignmentId) => {
    const { error } = await supabase
      .from("train_assignments")
      .delete()
      .eq("id", assignmentId);

    if (error) {
      console.error("DELETE TRAIN ASSIGNMENT ERROR:", error);
      throw error;
    }

    set((state) => ({
      trainAssignments: (state.trainAssignments ?? []).filter(
        (assignment) => assignment.id !== assignmentId,
      ),
    }));
  },

  addAllianceEvent: async (event) => {
    const allianceId = get().activeAllianceId;

    if (!allianceId) {
      throw new Error("No active alliance selected.");
    }

    const { data: eventRow, error } = await supabase
      .from("alliance_events")
      .insert({
        alliance_id: allianceId,
        title: event.name,
        type: event.type,
        starts_at: event.date,
        notes: event.notes ?? null,
        assigned_member_ids: event.assignedMemberIds ?? [],
        status: event.status ?? BoardItemStatus.Active,
        completed_at: event.completedAt ?? null,
      })
      .select()
      .single();

    if (error) {
      console.error("ADD ALLIANCE EVENT ERROR:", error);
      throw error;
    }

    const newEvent = mapAllianceEvent(eventRow);

    set((state) => ({
      events: [newEvent, ...(state.events ?? [])],
    }));
  },

  updateAllianceEvent: async (eventId, updates) => {
    const { data: eventRow, error } = await supabase
      .from("alliance_events")
      .update({
        name: updates.name,
        type: updates.type,
        date: updates.date,
        notes: updates.notes,
        assigned_member_ids: updates.assignedMemberIds,
        status: updates.status,
        completed_at: updates.completedAt,
      })
      .eq("id", eventId)
      .select(
        "id,alliance_id,name,type,date,notes,assigned_member_ids,status,completed_at,created_at,updated_at",
      )
      .single();

    if (error) {
      console.error("UPDATE ALLIANCE EVENT ERROR:", error);
      throw error;
    }

    const updatedEvent = mapAllianceEvent(eventRow);

    set((state) => ({
      events: (state.events ?? []).map((event) =>
        event.id === eventId ? updatedEvent : event,
      ),
    }));
  },

  completeAllianceEvent: async (eventId) => {
    await get().updateAllianceEvent(eventId, {
      status: BoardItemStatus.Completed,
      completedAt: nowIso(),
    });
  },

  reopenAllianceEvent: async (eventId) => {
    await get().updateAllianceEvent(eventId, {
      status: BoardItemStatus.Active,
      completedAt: null,
    });
  },

  deleteAllianceEvent: async (eventId) => {
    const { error } = await supabase
      .from("alliance_events")
      .delete()
      .eq("id", eventId);

    if (error) {
      console.error("DELETE ALLIANCE EVENT ERROR:", error);
      throw error;
    }

    set((state) => ({
      events: (state.events ?? []).filter((event) => event.id !== eventId),
    }));
  },

  loadDemoData: () => {
    const activeAllianceId = get().activeAllianceId ?? "demo-alliance";
    const createdAt = nowIso();

    set({
      members: [
        {
          id: "demo-member-1",
          allianceId: activeAllianceId,
          name: "Player One",
          role: AllianceRole.R5,
          power: 54000000,
          level: 29,
          notes: "Alliance lead",
          isActive: true,
          createdAt,
          updatedAt: createdAt,
        },
        {
          id: "demo-member-2",
          allianceId: activeAllianceId,
          name: "Player Two",
          role: AllianceRole.R4,
          power: 42000000,
          level: 28,
          notes: "Train lead",
          isActive: true,
          createdAt,
          updatedAt: createdAt,
        },
      ],
      dailyStats: [],
      trainAssignments: [],
      events: [],
    });
  },

  clearDemoData: () => {
    set({
      members: [],
      dailyStats: [],
      trainAssignments: [],
      events: [],
    });
  },
}));
