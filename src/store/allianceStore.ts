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

export type AllianceMemberWithStats = AllianceMember & {
  weeklyDonations: number;
  weeklyVsScore: number;

  /**
   * Alias for screens/components that already use "vsScore"
   * wording instead of "VS score".
   */
  weeklyvsScore: number;

  statsThisWeek: DailyMemberStat[];
};

export type DailyMemberStat = {
  id: string;
  allianceId: string;
  memberId: string;
  date: string;
  vsScore: number;
  donations: number;
  createdAt: string;
  notes: string | null;
  updatedAt?: string | null;
};

export type SaveDailyMemberStatsInput = {
  memberId: string;
  date: string;
  notes: string | null;
  vsScore: number;
  donations: number;
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

type DailyMemberStatInput = Omit<
  DailyMemberStat,
  "id" | "allianceId" | "createdAt" | "updatedAt"
>;

type AllianceStoreState = {
  activeAllianceId: string | null;
  activeAlliance: Alliance | null;
  allianceUser: AllianceUser | null;

  members: AllianceMember[];
  membersWithStats: AllianceMemberWithStats[];
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
    memberId: string,
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
  updateMemberRole: (memberId: string, role: AllianceRole) => Promise<void>;
  addDailyStat: (stat: DailyMemberStatInput) => Promise<void>;
  upsertDailyStat: (stat: DailyMemberStatInput) => Promise<void>;
  updateDailyStat: (
    statId: string,
    updates: Partial<DailyMemberStat>,
  ) => Promise<void>;
  deleteDailyStat: (statId: string) => Promise<void>;
  saveDailyMemberStats: (input: SaveDailyMemberStatsInput) => Promise<void>;
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
  updateOwnMemberProgress: (
    memberId: string,
    updates: Pick<AllianceMember, "power" | "level">,
  ) => Promise<void>;
  completeAllianceEvent: (eventId: string) => Promise<void>;
  reopenAllianceEvent: (eventId: string) => Promise<void>;
  deleteAllianceEvent: (eventId: string) => Promise<void>;

  getStatsForMember: (memberId: string) => DailyMemberStat[];
  getCurrentWeekStatsForMember: (memberId: string) => DailyMemberStat[];
  getMemberWithStats: (memberId: string) => AllianceMemberWithStats | undefined;
  getMembersWithStats: () => AllianceMemberWithStats[];

  loadDemoData: () => void;
  clearDemoData: () => void;
};

function nowIso() {
  return new Date().toISOString();
}

function toDateKey(date: Date) {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function normalizeDateKey(value: string | null | undefined) {
  if (!value) return "";
  return value.slice(0, 10);
}

function parseDateKey(dateKey: string) {
  const [year, month, day] = dateKey.split("-").map(Number);

  return new Date(year, month - 1, day, 12, 0, 0, 0);
}

function getCurrentWeekRange() {
  const today = parseDateKey(toDateKey(new Date()));

  /**
   * Monday-start week:
   * Sunday = 0, Monday = 1, Tuesday = 2...
   */
  const day = today.getDay();
  const daysSinceMonday = (day + 6) % 7;

  const weekStart = new Date(today);
  weekStart.setDate(today.getDate() - daysSinceMonday);

  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 6);

  return {
    weekStart: toDateKey(weekStart),
    weekEnd: toDateKey(weekEnd),
  };
}

function isCurrentWeekDate(date: string) {
  const dateKey = normalizeDateKey(date);
  const { weekStart, weekEnd } = getCurrentWeekRange();

  return dateKey >= weekStart && dateKey <= weekEnd;
}

function generateInviteCode() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";

  for (let i = 0; i < 8; i += 1) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }

  return code;
}

function cleanPayload<T extends Record<string, unknown>>(payload: T) {
  return Object.fromEntries(
    Object.entries(payload).filter(([, value]) => value !== undefined),
  );
}

function canManageAllianceRole(role: AllianceRole | string | null | undefined) {
  const normalizedRole = normalizeRole(role);

  return (
    normalizedRole === AllianceRole.R4 || normalizedRole === AllianceRole.R5
  );
}

function normalizeRole(
  role: AllianceRole | string | null | undefined,
): AllianceRole {
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

function sortMembers(members: AllianceMember[]) {
  return [...members].sort((a, b) => a.name.localeCompare(b.name));
}

function sortDailyStats(stats: DailyMemberStat[]) {
  return [...stats].sort((a, b) => b.date.localeCompare(a.date));
}

function sortTrainAssignments(assignments: TrainAssignment[]) {
  return [...assignments].sort((a, b) =>
    normalizeDateKey(b.date).localeCompare(normalizeDateKey(a.date)),
  );
}

function sortAllianceEvents(events: AllianceEvent[]) {
  return [...events].sort((a, b) =>
    normalizeDateKey(b.date).localeCompare(normalizeDateKey(a.date)),
  );
}

function buildMembersWithStats(
  members: AllianceMember[],
  dailyStats: DailyMemberStat[],
): AllianceMemberWithStats[] {
  return sortMembers(members).map((member) => {
    const statsThisWeek = dailyStats.filter(
      (stat) => stat.memberId === member.id && isCurrentWeekDate(stat.date),
    );

    const weeklyDonations = statsThisWeek.reduce(
      (total, stat) => total + Number(stat.donations ?? 0),
      0,
    );

    const weeklyVsScore = statsThisWeek.reduce(
      (total, stat) => total + Number(stat.vsScore ?? 0),
      0,
    );

    return {
      ...member,
      weeklyDonations,
      weeklyVsScore,
      weeklyvsScore: weeklyVsScore,
      statsThisWeek: sortDailyStats(statsThisWeek),
    };
  });
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

function assertCanManageAlliance(
  role: AllianceRole | string | null | undefined,
) {
  if (!canManageAllianceRole(role)) {
    throw new Error("Only R4 and R5 members can manage alliance members.");
  }
}

function mapAllianceUser(row: any): AllianceUser {
  return {
    allianceId: row.alliance_id,
    userId: row.user_id,
    role: normalizeRole(row.role),
    createdAt: row.created_at ?? null,
  };
}

function mapDailyMemberStat(row: any): DailyMemberStat {
  return {
    id: row.id,
    allianceId: row.alliance_id,
    memberId: row.member_id,
    date: row.date,
    vsScore: row.vs_score ?? 0,
    donations: row.donations ?? 0,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function mapMember(row: any): AllianceMember {
  return {
    id: row.id,
    allianceId: row.alliance_id,
    userId: row.user_id ?? null,
    name:
      row.display_name ??
      row.name ??
      row.member_name ??
      row.username ??
      "Unnamed Member",
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
    date: normalizeDateKey(row.date),
    donations: Number(row.donations ?? 0),
    vsScore: Number(row.versus_points ?? row.vsScore ?? 0),
    notes: row.notes ?? null,
    createdAt: row.created_at ?? nowIso(),
    updatedAt: row.updated_at ?? null,
  };
}

function mapTrainAssignment(row: any): TrainAssignment {
  return {
    id: row.id,
    allianceId: row.alliance_id,
    date: normalizeDateKey(row.date ?? row.starts_at ?? row.created_at),
    trainName: row.train_name ?? row.title ?? "Train",
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
    name: row.name ?? row.title ?? "Event",
    type: normalizeEventType(row.type ?? row.event_type),
    date: row.date ?? row.starts_at ?? row.start_at ?? nowIso(),
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
    supabase.from("members").select("*").eq("alliance_id", allianceId),

    supabase
      .from("daily_member_stats")
      .select("*")
      .eq("alliance_id", allianceId),

    supabase
      .from("train_assignments")
      .select("*")
      .eq("alliance_id", allianceId),

    supabase.from("alliance_events").select("*").eq("alliance_id", allianceId),
  ]);

  if (membersResult.error) throw membersResult.error;
  if (dailyStatsResult.error) throw dailyStatsResult.error;
  if (trainAssignmentsResult.error) throw trainAssignmentsResult.error;
  if (eventsResult.error) throw eventsResult.error;

  const members = sortMembers((membersResult.data ?? []).map(mapMember));
  const dailyStats = sortDailyStats(
    (dailyStatsResult.data ?? []).map(mapDailyStat),
  );

  return {
    members,
    membersWithStats: buildMembersWithStats(members, dailyStats),
    dailyStats,
    trainAssignments: sortTrainAssignments(
      (trainAssignmentsResult.data ?? []).map(mapTrainAssignment),
    ),
    events: sortAllianceEvents((eventsResult.data ?? []).map(mapAllianceEvent)),
  };
}

export const useAllianceStore = create<AllianceStoreState>((set, get) => ({
  activeAllianceId: null,
  activeAlliance: null,
  allianceUser: null,

  members: [],
  membersWithStats: [],
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

      if (userError) throw userError;

      if (!user) {
        set({
          activeAllianceId: null,
          activeAlliance: null,
          allianceUser: null,
          members: [],
          membersWithStats: [],
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
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (allianceUserError) throw allianceUserError;

      if (!allianceUserRow) {
        set({
          activeAllianceId: null,
          activeAlliance: null,
          allianceUser: null,
          members: [],
          membersWithStats: [],
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
        .select("*")
        .eq("id", allianceUserRow.alliance_id)
        .maybeSingle();

      if (allianceError) throw allianceError;

      if (!allianceRow) {
        set({
          activeAllianceId: null,
          activeAlliance: null,
          allianceUser: null,
          members: [],
          membersWithStats: [],
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
        membersWithStats: [],
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
        .select("*")
        .single();

      if (allianceError) throw allianceError;

      const { data: allianceUserRow, error: allianceUserError } = await supabase
        .from("alliance_users")
        .insert({
          alliance_id: allianceRow.id,
          user_id: user.id,
          role: AllianceRole.R5,
        })
        .select("*")
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
        .select("*")
        .single();

      if (memberError) throw memberError;

      const activeAlliance = mapAlliance(allianceRow);
      const allianceUser = mapAllianceUser(allianceUserRow);
      const currentMember = mapMember(memberRow);
      const members = [currentMember];
      const dailyStats: DailyMemberStat[] = [];

      set({
        activeAllianceId: activeAlliance.id,
        activeAlliance,
        allianceUser,
        members,
        membersWithStats: buildMembersWithStats(members, dailyStats),
        dailyStats,
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

  joinAllianceAndClaimMember: async (inviteCode, memberId) => {
    set({ loading: true, error: null });

    try {
      const { data: allianceId, error } = await supabase.rpc(
        "join_alliance_and_claim_member",
        {
          invite_code_input: inviteCode,
          member_id_input: memberId,
        },
      );

      if (error) {
        throw error;
      }

      set({ activeAllianceId: allianceId });

      await get().loadActiveAlliance();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Could not join alliance.";

      set({ error: message, loading: false, hasLoaded: true });

      throw error;
    }
  },

  clearActiveAlliance: () => {
    set({
      activeAllianceId: null,
      activeAlliance: null,
      allianceUser: null,
      members: [],
      membersWithStats: [],
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
      membersWithStats: [],
      dailyStats: [],
      trainAssignments: [],
      events: [],
      loading: false,
      error: null,
      hasLoaded: true,
    });
  },

  addMember: async (member) => {
    assertCanManageAlliance(get().allianceUser?.role);

    const allianceId = get().activeAllianceId;

    if (!allianceId) {
      throw new Error("No active alliance selected.");
    }

    const trimmedName = member.name.trim();

    if (!trimmedName) {
      throw new Error("Member name is required.");
    }

    const { data: memberRow, error } = await supabase
      .from("members")
      .insert({
        alliance_id: allianceId,
        user_id: member.userId ?? null,
        display_name: trimmedName,
        role: normalizeRole(member.role),
        power: Number(member.power ?? 0),
        level: member.level ?? null,
        notes: member.notes?.trim() ? member.notes.trim() : null,
        is_active: member.isActive ?? true,
      })
      .select("*")
      .single();

    if (error) {
      console.error("ADD MEMBER ERROR:", error);
      throw error;
    }

    const newMember = mapMember(memberRow);

    set((state) => {
      const members = sortMembers([...(state.members ?? []), newMember]);
      const dailyStats = state.dailyStats ?? [];

      return {
        members,
        membersWithStats: buildMembersWithStats(members, dailyStats),
      };
    });
  },

  updateOwnMemberProgress: async (memberId, updates) => {
    const targetMember = get().members.find((member) => member.id === memberId);
    const currentUserId = get().allianceUser?.userId;

    if (!targetMember || targetMember.userId !== currentUserId) {
      throw new Error("You can only update your own power and HQ level.");
    }

    const { data: memberRow, error } = await supabase.rpc(
      "update_own_member_progress",
      {
        p_member_id: memberId,
        p_power: Number(updates.power ?? 0),
        p_level: updates.level ?? null,
      },
    );

    if (error) {
      console.error("UPDATE OWN MEMBER PROGRESS ERROR:", error);
      throw error;
    }

    const updatedMember = mapMember(memberRow);

    set((state) => {
      const members = sortMembers(
        state.members.map((member) =>
          member.id === memberId ? updatedMember : member,
        ),
      );

      return {
        members,
        membersWithStats: buildMembersWithStats(
          members,
          state.dailyStats ?? [],
        ),
      };
    });
  },

  updateMember: async (memberId, updates) => {
    assertCanManageAlliance(get().allianceUser?.role);
    if (updates.name !== undefined && !updates.name.trim()) {
      throw new Error("Member name is required.");
    }

    const { data: memberRow, error } = await supabase
      .from("members")
      .update(
        cleanPayload({
          display_name: updates.name?.trim(),
          role:
            updates.role === undefined
              ? undefined
              : normalizeRole(updates.role),
          power:
            updates.power === undefined
              ? undefined
              : Number(updates.power ?? 0),
          level:
            updates.level === undefined ? undefined : (updates.level ?? null),
          notes:
            updates.notes === undefined
              ? undefined
              : updates.notes?.trim()
                ? updates.notes.trim()
                : null,
          is_active: updates.isActive,
        }),
      )
      .eq("id", memberId)
      .select("*")
      .single();

    if (error) {
      console.error("UPDATE MEMBER ERROR:", error);
      throw error;
    }

    const updatedMember = mapMember(memberRow);

    set((state) => {
      const members = sortMembers(
        (state.members ?? []).map((member) =>
          member.id === memberId ? updatedMember : member,
        ),
      );

      const dailyStats = state.dailyStats ?? [];

      return {
        members,
        membersWithStats: buildMembersWithStats(members, dailyStats),
      };
    });
  },

  deleteMember: async (memberId) => {
    assertCanManageAlliance(get().allianceUser?.role);
    await supabase
      .from("daily_member_stats")
      .delete()
      .eq("member_id", memberId);

    await supabase
      .from("train_assignments")
      .update({ conductor_member_id: null })
      .eq("conductor_member_id", memberId);

    await supabase
      .from("train_assignments")
      .update({ passenger_member_id: null })
      .eq("passenger_member_id", memberId);

    const { error } = await supabase
      .from("members")
      .delete()
      .eq("id", memberId);

    if (error) {
      console.error("DELETE MEMBER ERROR:", error);
      throw error;
    }

    set((state) => {
      const members = (state.members ?? []).filter(
        (member) => member.id !== memberId,
      );

      const dailyStats = (state.dailyStats ?? []).filter(
        (stat) => stat.memberId !== memberId,
      );

      return {
        members,
        dailyStats,
        membersWithStats: buildMembersWithStats(members, dailyStats),
        trainAssignments: (state.trainAssignments ?? []).map((assignment) => ({
          ...assignment,
          conductorMemberId:
            assignment.conductorMemberId === memberId
              ? null
              : assignment.conductorMemberId,
          passengerMemberId:
            assignment.passengerMemberId === memberId
              ? null
              : assignment.passengerMemberId,
        })),
        events: (state.events ?? []).map((event) => ({
          ...event,
          assignedMemberIds: (event.assignedMemberIds ?? []).filter(
            (assignedMemberId) => assignedMemberId !== memberId,
          ),
        })),
      };
    });
  },

  updateMemberRole: async (memberId, role) => {
    set({ loading: true, error: null });

    try {
      const targetMember = get().members.find(
        (member) => member.id === memberId,
      );

      const { error } = await supabase.rpc("update_alliance_member_role", {
        p_member_id: memberId,
        p_role: role,
      });

      if (error) {
        throw error;
      }

      set((state) => ({
        members: state.members.map((member) =>
          member.id === memberId
            ? {
                ...member,
                role,
                updatedAt: new Date().toISOString(),
              }
            : member,
        ),
        allianceUser:
          targetMember?.userId &&
          state.allianceUser?.userId === targetMember.userId
            ? {
                ...state.allianceUser,
                role,
              }
            : state.allianceUser,
        loading: false,
      }));
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Failed to update member role.";

      set({
        error: message,
        loading: false,
      });

      throw error;
    }
  },

  addDailyStat: async (stat) => {
    await get().upsertDailyStat(stat);
  },

  upsertDailyStat: async (stat) => {
    const allianceId = get().activeAllianceId;

    if (!allianceId) {
      throw new Error("No active alliance selected.");
    }

    const date = normalizeDateKey(stat.date);

    if (!stat.memberId) {
      throw new Error("Member is required.");
    }

    if (!date) {
      throw new Error("Date is required.");
    }

    const normalizedPayload = {
      alliance_id: allianceId,
      member_id: stat.memberId,
      date,
      donations: Number(stat.donations ?? 0),
      versus_points: Number(stat.vsScore ?? 0),
      notes: stat.notes?.trim() ? stat.notes.trim() : null,
    };

    const { data: existingStat, error: existingError } = await supabase
      .from("daily_member_stats")
      .select("id")
      .eq("alliance_id", allianceId)
      .eq("member_id", stat.memberId)
      .eq("date", date)
      .maybeSingle();

    if (existingError) {
      console.error("FIND DAILY STAT ERROR:", existingError);
      throw existingError;
    }

    const request = existingStat
      ? supabase
          .from("daily_member_stats")
          .update(normalizedPayload)
          .eq("id", existingStat.id)
          .select("*")
          .single()
      : supabase
          .from("daily_member_stats")
          .insert(normalizedPayload)
          .select("*")
          .single();

    const { data: statRow, error } = await request;

    if (error) {
      console.error("UPSERT DAILY STAT ERROR:", error);
      throw error;
    }

    const savedStat = mapDailyStat(statRow);

    set((state) => {
      const dailyStats = sortDailyStats([
        savedStat,
        ...(state.dailyStats ?? []).filter((item) => item.id !== savedStat.id),
      ]);

      const members = state.members ?? [];

      return {
        dailyStats,
        membersWithStats: buildMembersWithStats(members, dailyStats),
      };
    });
  },

  updateDailyStat: async (statId, updates) => {
    const { data: statRow, error } = await supabase
      .from("daily_member_stats")
      .update(
        cleanPayload({
          date:
            updates.date === undefined
              ? undefined
              : normalizeDateKey(updates.date),
          donations:
            updates.donations === undefined
              ? undefined
              : Number(updates.donations ?? 0),
          versus_points:
            updates.vsScore === undefined
              ? undefined
              : Number(updates.vsScore ?? 0),
          notes:
            updates.notes === undefined
              ? undefined
              : updates.notes?.trim()
                ? updates.notes.trim()
                : null,
        }),
      )
      .eq("id", statId)
      .select("*")
      .single();

    if (error) {
      console.error("UPDATE DAILY STAT ERROR:", error);
      throw error;
    }

    const updatedStat = mapDailyStat(statRow);

    set((state) => {
      const dailyStats = sortDailyStats(
        (state.dailyStats ?? []).map((stat) =>
          stat.id === statId ? updatedStat : stat,
        ),
      );

      const members = state.members ?? [];

      return {
        dailyStats,
        membersWithStats: buildMembersWithStats(members, dailyStats),
      };
    });
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

    set((state) => {
      const dailyStats = (state.dailyStats ?? []).filter(
        (stat) => stat.id !== statId,
      );

      const members = state.members ?? [];

      return {
        dailyStats,
        membersWithStats: buildMembersWithStats(members, dailyStats),
      };
    });
  },

  addTrainAssignment: async (assignment) => {
    const allianceId = get().activeAllianceId;

    if (!allianceId) {
      throw new Error("No active alliance selected.");
    }

    const trainName = assignment.trainName.trim();

    if (!trainName) {
      throw new Error("Train name is required.");
    }

    const { data: assignmentRow, error } = await supabase
      .from("train_assignments")
      .insert({
        alliance_id: allianceId,
        date: normalizeDateKey(assignment.date),
        title: trainName,
        train_name: trainName,
        conductor_member_id: assignment.conductorMemberId ?? null,
        passenger_member_id: assignment.passengerMemberId ?? null,
        notes: assignment.notes?.trim() ? assignment.notes.trim() : null,
        status: assignment.status ?? BoardItemStatus.Active,
        completed_at: assignment.completedAt ?? null,
      })
      .select("*")
      .single();

    if (error) {
      console.error("ADD TRAIN ASSIGNMENT ERROR:", error);
      throw error;
    }

    const newAssignment = mapTrainAssignment(assignmentRow);

    set((state) => ({
      trainAssignments: sortTrainAssignments([
        newAssignment,
        ...(state.trainAssignments ?? []),
      ]),
    }));
  },

  updateTrainAssignment: async (assignmentId, updates) => {
    if (updates.trainName !== undefined && !updates.trainName.trim()) {
      throw new Error("Train name is required.");
    }

    const { data: assignmentRow, error } = await supabase
      .from("train_assignments")
      .update(
        cleanPayload({
          date:
            updates.date === undefined
              ? undefined
              : normalizeDateKey(updates.date),
          title: updates.trainName?.trim(),
          train_name: updates.trainName?.trim(),
          conductor_member_id:
            updates.conductorMemberId === undefined
              ? undefined
              : (updates.conductorMemberId ?? null),
          passenger_member_id:
            updates.passengerMemberId === undefined
              ? undefined
              : (updates.passengerMemberId ?? null),
          notes:
            updates.notes === undefined
              ? undefined
              : updates.notes?.trim()
                ? updates.notes.trim()
                : null,
          status: updates.status,
          completed_at:
            updates.completedAt === undefined
              ? undefined
              : (updates.completedAt ?? null),
        }),
      )
      .eq("id", assignmentId)
      .select("*")
      .single();

    if (error) {
      console.error("UPDATE TRAIN ASSIGNMENT ERROR:", error);
      throw error;
    }

    const updatedAssignment = mapTrainAssignment(assignmentRow);

    set((state) => ({
      trainAssignments: sortTrainAssignments(
        (state.trainAssignments ?? []).map((assignment) =>
          assignment.id === assignmentId ? updatedAssignment : assignment,
        ),
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

    const eventName = event.name.trim();

    if (!eventName) {
      throw new Error("Event name is required.");
    }

    const { data: eventRow, error } = await supabase
      .from("alliance_events")
      .insert({
        alliance_id: allianceId,
        title: eventName,
        starts_at: event.date,
        type: event.type,
        notes: event.notes?.trim() ? event.notes.trim() : null,
        assigned_member_ids: event.assignedMemberIds ?? [],
        status: event.status ?? BoardItemStatus.Active,
        completed_at: event.completedAt ?? null,
      })
      .select("*")
      .single();

    if (error) {
      console.error("ADD ALLIANCE EVENT ERROR:", error);
      throw error;
    }

    const newEvent = mapAllianceEvent(eventRow);

    set((state) => ({
      events: sortAllianceEvents([newEvent, ...(state.events ?? [])]),
    }));
  },

  updateAllianceEvent: async (eventId, updates) => {
    if (updates.name !== undefined && !updates.name.trim()) {
      throw new Error("Event name is required.");
    }

    const { data: eventRow, error } = await supabase
      .from("alliance_events")
      .update(
        cleanPayload({
          title: updates.name?.trim(),
          starts_at: updates.date,
          type: updates.type,
          notes:
            updates.notes === undefined
              ? undefined
              : updates.notes?.trim()
                ? updates.notes.trim()
                : null,
          assigned_member_ids: updates.assignedMemberIds,
          status: updates.status,
          completed_at:
            updates.completedAt === undefined
              ? undefined
              : (updates.completedAt ?? null),
        }),
      )
      .eq("id", eventId)
      .select("*")
      .single();

    if (error) {
      console.error("UPDATE ALLIANCE EVENT ERROR:", error);
      throw error;
    }

    const updatedEvent = mapAllianceEvent(eventRow);

    set((state) => ({
      events: sortAllianceEvents(
        (state.events ?? []).map((event) =>
          event.id === eventId ? updatedEvent : event,
        ),
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

  getStatsForMember: (memberId) => {
    return sortDailyStats(
      (get().dailyStats ?? []).filter((stat) => stat.memberId === memberId),
    );
  },

  getCurrentWeekStatsForMember: (memberId) => {
    return sortDailyStats(
      (get().dailyStats ?? []).filter(
        (stat) => stat.memberId === memberId && isCurrentWeekDate(stat.date),
      ),
    );
  },

  getMemberWithStats: (memberId) => {
    return get().membersWithStats.find((member) => member.id === memberId);
  },

  getMembersWithStats: () => {
    const { members, dailyStats } = get();
    return buildMembersWithStats(members ?? [], dailyStats ?? []);
  },

  saveDailyMemberStats: async (input) => {
    const activeAllianceId = get().activeAllianceId;

    if (!activeAllianceId) {
      throw new Error("No active alliance selected.");
    }

    const now = new Date().toISOString();

    const { data, error } = await supabase
      .from("daily_member_stats")
      .upsert(
        {
          alliance_id: activeAllianceId,
          member_id: input.memberId,
          date: input.date,
          vs_score: input.vsScore,
          donations: input.donations,
          created_at: now,
          updated_at: now,
        },
        {
          onConflict: "alliance_id,member_id,date",
        },
      )
      .select("*")
      .single();

    if (error) {
      throw error;
    }

    const savedStat = mapDailyMemberStat(data);

    set((state) => {
      const currentDailyStats = state.dailyStats ?? [];

      const alreadyExists = currentDailyStats.some(
        (stat) =>
          stat.allianceId === savedStat.allianceId &&
          stat.memberId === savedStat.memberId &&
          stat.date === savedStat.date,
      );

      if (!alreadyExists) {
        return {
          dailyStats: [savedStat, ...currentDailyStats],
        };
      }

      return {
        dailyStats: currentDailyStats.map((stat) =>
          stat.allianceId === savedStat.allianceId &&
          stat.memberId === savedStat.memberId &&
          stat.date === savedStat.date
            ? savedStat
            : stat,
        ),
      };
    });
  },

  loadDemoData: () => {
    const activeAllianceId = get().activeAllianceId ?? "demo-alliance";
    const createdAt = nowIso();
    const today = toDateKey(new Date());

    const members: AllianceMember[] = [
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
    ];

    const dailyStats: DailyMemberStat[] = [
      {
        id: "demo-stat-1",
        allianceId: activeAllianceId,
        memberId: "demo-member-1",
        date: today,
        donations: 50000,
        vsScore: 1250000,
        notes: "Demo stat",
        createdAt,
        updatedAt: createdAt,
      },
      {
        id: "demo-stat-2",
        allianceId: activeAllianceId,
        memberId: "demo-member-2",
        date: today,
        donations: 35000,
        vsScore: 875000,
        notes: "Demo stat",
        createdAt,
        updatedAt: createdAt,
      },
    ];

    set({
      members,
      membersWithStats: buildMembersWithStats(members, dailyStats),
      dailyStats,
      trainAssignments: [],
      events: [],
    });
  },

  clearDemoData: () => {
    set({
      members: [],
      membersWithStats: [],
      dailyStats: [],
      trainAssignments: [],
      events: [],
    });
  },
}));
