import { create } from "zustand";

import { supabase } from "@/lib/supabase";

export type AllianceRole = "R1" | "R2" | "R3" | "R4" | "R5" | "member";

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

export type MemberRole = "R1" | "R2" | "R3" | "R4" | "R5";

export type AllianceMember = {
  id: string;
  allianceId: string;
  userId?: string | null;
  name: string;
  role: MemberRole;
  power: number;
  level: number | null;
  notes?: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt?: string | null;
};

export type DailyMemberStat = {
  id: string;
  allianceId?: string;
  memberId: string;
  date: string;
  donations: number;
  versusPoints: number;
  notes?: string;
  createdAt: string;
  updatedAt?: string;
};

export type TrainAssignment = {
  id: string;
  allianceId?: string;
  date: string;
  trainName: string;
  conductorMemberId?: string | null;
  passengerMemberId?: string | null;
  notes?: string;
  status: "active" | "completed";
  completedAt?: string | null;
  createdAt: string;
  updatedAt?: string;
};

export type AllianceEventType =
  | "VS"
  | "Desert Storm"
  | "Capital War"
  | "Rare Soil"
  | "Train"
  | "Custom";

export type AllianceEvent = {
  id: string;
  allianceId?: string;
  name: string;
  type: AllianceEventType;
  date: string;
  notes?: string;
  assignedMemberIds: string[];
  status: "active" | "completed";
  completedAt?: string | null;
  createdAt: string;
  updatedAt?: string;
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
  ) => void;
  updateMember: (memberId: string, updates: Partial<AllianceMember>) => void;
  deleteMember: (memberId: string) => void;

  addDailyStat: (
    stat: Omit<DailyMemberStat, "id" | "allianceId" | "createdAt">,
  ) => void;
  updateDailyStat: (statId: string, updates: Partial<DailyMemberStat>) => void;
  deleteDailyStat: (statId: string) => void;

  addTrainAssignment: (
    assignment: Omit<TrainAssignment, "id" | "allianceId" | "createdAt">,
  ) => void;
  updateTrainAssignment: (
    assignmentId: string,
    updates: Partial<TrainAssignment>,
  ) => void;
  completeTrainAssignment: (assignmentId: string) => void;
  reopenTrainAssignment: (assignmentId: string) => void;
  deleteTrainAssignment: (assignmentId: string) => void;

  addAllianceEvent: (
    event: Omit<AllianceEvent, "id" | "allianceId" | "createdAt">,
  ) => void;
  updateAllianceEvent: (
    eventId: string,
    updates: Partial<AllianceEvent>,
  ) => void;
  completeAllianceEvent: (eventId: string) => void;
  reopenAllianceEvent: (eventId: string) => void;
  deleteAllianceEvent: (eventId: string) => void;

  loadDemoData: () => void;
  clearDemoData: () => void;
};

function nowIso() {
  return new Date().toISOString();
}

function makeId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
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

  if (value === "r5") return "R5";
  if (value === "r4") return "R4";
  if (value === "r3") return "R3";
  if (value === "r2") return "R2";
  if (value === "r1") return "R1";

  return "member";
}

function normalizeMemberRole(role: string | null | undefined): MemberRole {
  const value = role?.toLowerCase();

  if (value === "r5") return "R5";
  if (value === "r4") return "R4";
  if (value === "r3") return "R3";
  if (value === "r2") return "R2";

  return "R1";
}

function toDatabaseRole(role: AllianceRole | MemberRole) {
  if (role === "member") return "member";
  return role.toLowerCase();
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

function getUserDisplayName(user: any, fallback: string) {
  return (
    user?.user_metadata?.member_name ||
    user?.user_metadata?.name ||
    user?.email ||
    fallback
  );
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
          loading: false,
          hasLoaded: true,
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
          loading: false,
          hasLoaded: true,
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
          loading: false,
          hasLoaded: true,
        });
        return;
      }

      const activeAlliance = mapAlliance(allianceRow);
      const allianceUser = mapAllianceUser(allianceUserRow);

      set({
        activeAllianceId: activeAlliance.id,
        activeAlliance,
        allianceUser,
        loading: false,
        hasLoaded: true,
      });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to load alliance";

      set({
        error: message,
        loading: false,
        hasLoaded: true,
      });
    }
  },

  createAllianceAndMember: async (allianceName, memberName) => {
    const trimmedAllianceName = allianceName.trim();
    const trimmedMemberName = memberName.trim();

    if (!trimmedAllianceName) {
      throw new Error("Alliance name is required");
    }

    if (!trimmedMemberName) {
      throw new Error("Member name is required");
    }

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
        throw new Error("You must be signed in to create an alliance");
      }

      await supabase.auth.updateUser({
        data: {
          member_name: trimmedMemberName,
        },
      });

      const inviteCode = generateInviteCode();

      const { data: allianceRow, error: allianceError } = await supabase
        .from("alliances")
        .insert({
          name: trimmedAllianceName,
          invite_code: inviteCode,
          created_by: user.id,
        })
        .select("id,name,invite_code,created_by,created_at,updated_at")
        .single();

      if (allianceError) {
        throw allianceError;
      }

      const { data: allianceUserRow, error: allianceUserError } = await supabase
        .from("alliance_users")
        .insert({
          alliance_id: allianceRow.id,
          user_id: user.id,
          role: toDatabaseRole("R5"),
        })
        .select("alliance_id,user_id,role,created_at")
        .single();

      if (allianceUserError) {
        throw allianceUserError;
      }

      const memberInsert = {
        alliance_id: allianceRow.id,
        user_id: user.id,
        role: toDatabaseRole("R5"),
        power: 0,
        level: null,
      };

      const { error: memberError } = await supabase
        .from("members")
        .insert(memberInsert);

      if (memberError) {
        throw memberError;
      }

      const activeAlliance = mapAlliance(allianceRow);
      const allianceUser = mapAllianceUser(allianceUserRow);

      const currentMember: AllianceMember = {
        id: user.id,
        allianceId: activeAlliance.id,
        userId: user.id,
        name: trimmedMemberName,
        role: "R5",
        power: 0,
        level: null,
        notes: null,
        isActive: true,
        createdAt: nowIso(),
        updatedAt: nowIso(),
      };

      set({
        activeAllianceId: activeAlliance.id,
        activeAlliance,
        allianceUser,
        members: [currentMember],
        loading: false,
        hasLoaded: true,
      });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to create alliance";

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
      throw new Error("Invite code is required");
    }

    if (!trimmedMemberName) {
      throw new Error("Member name is required");
    }

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
        throw new Error("You must be signed in to join an alliance");
      }

      const { data: allianceRow, error: allianceError } = await supabase
        .from("alliances")
        .select("id,name,invite_code,created_by,created_at,updated_at")
        .eq("invite_code", trimmedInviteCode)
        .maybeSingle();

      if (allianceError) {
        throw allianceError;
      }

      if (!allianceRow) {
        throw new Error("No alliance found for that invite code");
      }

      await supabase.auth.updateUser({
        data: {
          member_name: trimmedMemberName,
        },
      });

      const { data: allianceUserRows, error: allianceUserError } =
        await supabase
          .from("alliance_users")
          .upsert(
            {
              alliance_id: allianceRow.id,
              user_id: user.id,
              role: "member",
            },
            {
              onConflict: "alliance_id,user_id",
            },
          )
          .select("alliance_id,user_id,role,created_at");

      if (allianceUserError) {
        throw allianceUserError;
      }

      const { error: memberError } = await supabase.from("members").upsert(
        {
          alliance_id: allianceRow.id,
          user_id: user.id,
          role: "member",
          power: 0,
          level: null,
        },
        {
          onConflict: "alliance_id,user_id",
        },
      );

      if (memberError) {
        throw memberError;
      }

      const activeAlliance = mapAlliance(allianceRow);
      const allianceUser = mapAllianceUser(
        allianceUserRows?.[0] ?? {
          alliance_id: allianceRow.id,
          user_id: user.id,
          role: "member",
          created_at: nowIso(),
        },
      );

      const currentMember: AllianceMember = {
        id: user.id,
        allianceId: activeAlliance.id,
        userId: user.id,
        name: trimmedMemberName,
        role: "R1",
        power: 0,
        level: null,
        notes: null,
        isActive: true,
        createdAt: nowIso(),
        updatedAt: nowIso(),
      };

      set({
        activeAllianceId: activeAlliance.id,
        activeAlliance,
        allianceUser,
        members: [currentMember],
        loading: false,
        hasLoaded: true,
      });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to join alliance";

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
      error: null,
      hasLoaded: true,
    });
  },

  clearError: () => {
    set({ error: null });
  },

  signOut: async () => {
    const { error } = await supabase.auth.signOut();

    if (error) {
      throw error;
    }

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

  addMember: (member) => {
    const allianceId = get().activeAllianceId;

    if (!allianceId) {
      throw new Error("No active alliance selected");
    }

    const createdAt = nowIso();

    set((state) => ({
      members: [
        ...state.members,
        {
          ...member,
          id: makeId("member"),
          allianceId,
          createdAt,
          updatedAt: createdAt,
        },
      ],
    }));
  },

  updateMember: (memberId, updates) => {
    set((state) => ({
      members: state.members.map((member) =>
        member.id === memberId
          ? {
              ...member,
              ...updates,
              updatedAt: nowIso(),
            }
          : member,
      ),
    }));
  },

  deleteMember: (memberId) => {
    set((state) => ({
      members: state.members.filter((member) => member.id !== memberId),
      dailyStats: state.dailyStats.filter((stat) => stat.memberId !== memberId),
      trainAssignments: state.trainAssignments.filter(
        (assignment) =>
          assignment.conductorMemberId !== memberId &&
          assignment.passengerMemberId !== memberId,
      ),
      events: state.events.map((event) => ({
        ...event,
        assignedMemberIds: event.assignedMemberIds.filter(
          (assignedMemberId) => assignedMemberId !== memberId,
        ),
      })),
    }));
  },

  addDailyStat: (stat) => {
    const allianceId = get().activeAllianceId;

    if (!allianceId) {
      throw new Error("No active alliance selected");
    }

    const createdAt = nowIso();

    set((state) => ({
      dailyStats: [
        ...state.dailyStats,
        {
          ...stat,
          id: makeId("stat"),
          allianceId,
          createdAt,
          updatedAt: createdAt,
        },
      ],
    }));
  },

  updateDailyStat: (statId, updates) => {
    set((state) => ({
      dailyStats: state.dailyStats.map((stat) =>
        stat.id === statId
          ? {
              ...stat,
              ...updates,
              updatedAt: nowIso(),
            }
          : stat,
      ),
    }));
  },

  deleteDailyStat: (statId) => {
    set((state) => ({
      dailyStats: state.dailyStats.filter((stat) => stat.id !== statId),
    }));
  },

  addTrainAssignment: (assignment) => {
    const allianceId = get().activeAllianceId;

    if (!allianceId) {
      throw new Error("No active alliance selected");
    }

    const createdAt = nowIso();

    set((state) => ({
      trainAssignments: [
        ...state.trainAssignments,
        {
          ...assignment,
          id: makeId("train"),
          allianceId,
          createdAt,
          updatedAt: createdAt,
        },
      ],
    }));
  },

  updateTrainAssignment: (assignmentId, updates) => {
    set((state) => ({
      trainAssignments: state.trainAssignments.map((assignment) =>
        assignment.id === assignmentId
          ? {
              ...assignment,
              ...updates,
              updatedAt: nowIso(),
            }
          : assignment,
      ),
    }));
  },

  completeTrainAssignment: (assignmentId) => {
    set((state) => ({
      trainAssignments: state.trainAssignments.map((assignment) =>
        assignment.id === assignmentId
          ? {
              ...assignment,
              status: "completed",
              completedAt: nowIso(),
              updatedAt: nowIso(),
            }
          : assignment,
      ),
    }));
  },

  reopenTrainAssignment: (assignmentId) => {
    set((state) => ({
      trainAssignments: state.trainAssignments.map((assignment) =>
        assignment.id === assignmentId
          ? {
              ...assignment,
              status: "active",
              completedAt: null,
              updatedAt: nowIso(),
            }
          : assignment,
      ),
    }));
  },

  deleteTrainAssignment: (assignmentId) => {
    set((state) => ({
      trainAssignments: state.trainAssignments.filter(
        (assignment) => assignment.id !== assignmentId,
      ),
    }));
  },

  addAllianceEvent: (event) => {
    const allianceId = get().activeAllianceId;

    if (!allianceId) {
      throw new Error("No active alliance selected");
    }

    const createdAt = nowIso();

    set((state) => ({
      events: [
        ...state.events,
        {
          ...event,
          id: makeId("event"),
          allianceId,
          createdAt,
          updatedAt: createdAt,
        },
      ],
    }));
  },

  updateAllianceEvent: (eventId, updates) => {
    set((state) => ({
      events: state.events.map((event) =>
        event.id === eventId
          ? {
              ...event,
              ...updates,
              updatedAt: nowIso(),
            }
          : event,
      ),
    }));
  },

  completeAllianceEvent: (eventId) => {
    set((state) => ({
      events: state.events.map((event) =>
        event.id === eventId
          ? {
              ...event,
              status: "completed",
              completedAt: nowIso(),
              updatedAt: nowIso(),
            }
          : event,
      ),
    }));
  },

  reopenAllianceEvent: (eventId) => {
    set((state) => ({
      events: state.events.map((event) =>
        event.id === eventId
          ? {
              ...event,
              status: "active",
              completedAt: null,
              updatedAt: nowIso(),
            }
          : event,
      ),
    }));
  },

  deleteAllianceEvent: (eventId) => {
    set((state) => ({
      events: state.events.filter((event) => event.id !== eventId),
    }));
  },

  loadDemoData: () => {
    const activeAllianceId = get().activeAllianceId ?? "demo-alliance";
    const createdAt = nowIso();

    const members: AllianceMember[] = [
      {
        id: "demo-member-1",
        allianceId: activeAllianceId,
        name: "Player One",
        role: "R5",
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
        role: "R4",
        power: 42000000,
        level: 28,
        notes: "Train lead",
        isActive: true,
        createdAt,
        updatedAt: createdAt,
      },
      {
        id: "demo-member-3",
        allianceId: activeAllianceId,
        name: "Player Three",
        role: "R3",
        power: 31000000,
        level: 27,
        notes: "",
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
        date: "2026-06-28",
        donations: 120000,
        versusPoints: 2500000,
        notes: "",
        createdAt,
        updatedAt: createdAt,
      },
      {
        id: "demo-stat-2",
        allianceId: activeAllianceId,
        memberId: "demo-member-2",
        date: "2026-06-28",
        donations: 95000,
        versusPoints: 1800000,
        notes: "",
        createdAt,
        updatedAt: createdAt,
      },
      {
        id: "demo-stat-3",
        allianceId: activeAllianceId,
        memberId: "demo-member-3",
        date: "2026-06-28",
        donations: 76000,
        versusPoints: 1200000,
        notes: "",
        createdAt,
        updatedAt: createdAt,
      },
    ];

    const trainAssignments: TrainAssignment[] = [
      {
        id: "demo-train-1",
        allianceId: activeAllianceId,
        date: "2026-06-28",
        trainName: "Mega Express",
        conductorMemberId: "demo-member-2",
        passengerMemberId: "demo-member-1",
        notes: "Prioritize active contributors",
        status: "active",
        completedAt: null,
        createdAt,
        updatedAt: createdAt,
      },
    ];

    const events: AllianceEvent[] = [
      {
        id: "demo-event-1",
        allianceId: activeAllianceId,
        name: "Alliance Duel Push",
        type: "VS",
        date: "2026-06-28",
        notes: "Save stamina and radar tasks",
        assignedMemberIds: ["demo-member-1", "demo-member-2"],
        status: "active",
        completedAt: null,
        createdAt,
        updatedAt: createdAt,
      },
    ];

    set({
      members,
      dailyStats,
      trainAssignments,
      events,
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
