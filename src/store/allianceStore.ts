import { create } from "zustand";

import { supabase } from "@/lib/supabase";
import type { AllianceEvent, AllianceMember } from "@/types/alliance";

export type AllianceRole = "r1" | "r2" | "r3" | "r4" | "r5";

export type Alliance = {
  id: string;
  name: string;
  invite_code: string | null;
  created_by: string | null;
  created_at: string;
};

export type AllianceUser = {
  id: string;
  alliance_id: string;
  user_id: string;
  role: AllianceRole;
  created_at: string;
};

type AllianceEventInput = {
  name: string;
  type: AllianceEvent["type"];
  date: string;
  notes?: string;
};

type AllianceStore = {
  activeAllianceId: string | null;
  activeAlliance: Alliance | null;
  allianceUser: AllianceUser | null;
  loading: boolean;
  error: string | null;

  members: AllianceMember[];
  events: AllianceEvent[];

  loadActiveAlliance: () => Promise<void>;
  createAllianceAndMember: (
    allianceName: string,
    memberName: string,
  ) => Promise<void>;
  joinAllianceByInviteCode: (
    inviteCode: string,
    memberName: string,
  ) => Promise<void>;
  clearAlliance: () => void;

  setMembers: (members: AllianceMember[]) => void;
  setEvents: (events: AllianceEvent[]) => void;
  addAllianceEvent: (event: AllianceEventInput) => void;
  updateAllianceEvent: (
    eventId: string,
    updates: Partial<AllianceEvent>,
  ) => void;
  completeAllianceEvent: (eventId: string) => void;
  reopenAllianceEvent: (eventId: string) => void;
  deleteAllianceEvent: (eventId: string) => void;
};

function generateInviteCode() {
  return Math.random().toString(36).slice(2, 8).toUpperCase();
}

function generateLocalId(prefix: string) {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}

function getTodayDateKey() {
  return new Date().toISOString().slice(0, 10);
}

export const useAllianceStore = create<AllianceStore>((set, get) => ({
  activeAllianceId: null,
  activeAlliance: null,
  allianceUser: null,
  loading: false,
  error: null,

  members: [],
  events: [],

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
          error: null,
        });
        return;
      }

      const { data: allianceMembers, error: memberError } = await supabase
        .from("alliance_users")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(1);

      if (memberError) {
        throw memberError;
      }

      const allianceMember = allianceMembers?.[0];

      if (!allianceMember) {
        set({
          activeAllianceId: null,
          activeAlliance: null,
          allianceUser: null,
          loading: false,
          error: null,
        });
        return;
      }

      const { data: alliance, error: allianceError } = await supabase
        .from("alliances")
        .select("*")
        .eq("id", allianceMember.alliance_id)
        .single();

      if (allianceError) {
        throw allianceError;
      }

      set({
        activeAllianceId: alliance.id,
        activeAlliance: alliance,
        allianceUser: allianceMember,
        loading: false,
        error: null,
      });
    } catch (error) {
      console.error("LOAD ACTIVE ALLIANCE ERROR:", error);

      set({
        activeAllianceId: null,
        activeAlliance: null,
        allianceUser: null,
        loading: false,
        error: "Could not load active alliance.",
      });
    }
  },

  createAllianceAndMember: async (allianceName: string, memberName: string) => {
    set({ loading: true, error: null });

    try {
      const trimmedAllianceName = allianceName.trim();
      const trimmedMemberName = memberName.trim();

      if (!trimmedAllianceName) {
        throw new Error("Alliance name is required.");
      }

      if (!trimmedMemberName) {
        throw new Error("Member name is required.");
      }

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError) {
        throw userError;
      }

      if (!user) {
        throw new Error("You must be logged in to create an alliance.");
      }

      const inviteCode = generateInviteCode();

      const { data: alliance, error: allianceError } = await supabase
        .from("alliances")
        .insert({
          name: trimmedAllianceName,
          invite_code: inviteCode,
          created_by: user.id,
        })
        .select("*")
        .single();

      if (allianceError) {
        throw allianceError;
      }

      const { data: allianceMember, error: memberError } = await supabase
        .from("alliance_users")
        .insert({
          alliance_id: alliance.id,
          user_id: user.id,
          role: "r5",
        })
        .select("*")
        .single();

      if (memberError) {
        throw memberError;
      }

      set({
        activeAllianceId: alliance.id,
        activeAlliance: alliance,
        allianceUser: allianceMember,
        loading: false,
        error: null,
      });
    } catch (error) {
      console.error("CREATE ALLIANCE ERROR:", error);

      set({
        loading: false,
        error:
          error instanceof Error ? error.message : "Could not create alliance.",
      });

      throw error;
    }
  },

  joinAllianceByInviteCode: async (inviteCode: string, memberName: string) => {
    set({ loading: true, error: null });

    try {
      const trimmedInviteCode = inviteCode.trim().toUpperCase();
      const trimmedMemberName = memberName.trim();

      if (!trimmedInviteCode) {
        throw new Error("Invite code is required.");
      }

      if (!trimmedMemberName) {
        throw new Error("Member name is required.");
      }

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError) {
        throw userError;
      }

      if (!user) {
        throw new Error("You must be logged in to join an alliance.");
      }

      const { data: alliance, error: allianceError } = await supabase
        .from("alliances")
        .select("*")
        .eq("invite_code", trimmedInviteCode)
        .single();

      if (allianceError) {
        throw allianceError;
      }

      const { data: allianceMember, error: memberError } = await supabase
        .from("alliance_users")
        .insert({
          alliance_id: alliance.id,
          user_id: user.id,
          role: "r1",
        })
        .select("*")
        .single();

      if (memberError) {
        throw memberError;
      }

      set({
        activeAllianceId: alliance.id,
        activeAlliance: alliance,
        allianceUser: allianceMember,
        loading: false,
        error: null,
      });
    } catch (error) {
      console.error("JOIN ALLIANCE ERROR:", error);

      set({
        loading: false,
        error:
          error instanceof Error ? error.message : "Could not join alliance.",
      });

      throw error;
    }
  },

  clearAlliance: () => {
    set({
      activeAllianceId: null,
      activeAlliance: null,
      allianceUser: null,
      loading: false,
      error: null,
      members: [],
      events: [],
    });
  },

  setMembers: (members: AllianceMember[]) => {
    set({ members });
  },

  setEvents: (events: AllianceEvent[]) => {
    set({ events });
  },

  addAllianceEvent: (event: AllianceEventInput) => {
    const newEvent: AllianceEvent = {
      id: generateLocalId("event"),
      name: event.name,
      type: event.type,
      date: event.date || getTodayDateKey(),
      notes: event.notes ?? "",
      status: "active",
      assignedMemberIds: [],
      completedAt: undefined,
    };

    set((state) => ({
      events: [...state.events, newEvent],
    }));
  },

  updateAllianceEvent: (eventId: string, updates: Partial<AllianceEvent>) => {
    set((state) => ({
      events: state.events.map((event) =>
        event.id === eventId
          ? {
              ...event,
              ...updates,
            }
          : event,
      ),
    }));
  },

  completeAllianceEvent: (eventId: string) => {
    set((state) => ({
      events: state.events.map((event) =>
        event.id === eventId
          ? {
              ...event,
              status: "completed",
              completedAt: getTodayDateKey(),
            }
          : event,
      ),
    }));
  },

  reopenAllianceEvent: (eventId: string) => {
    set((state) => ({
      events: state.events.map((event) =>
        event.id === eventId
          ? {
              ...event,
              status: "active",
              completedAt: undefined,
            }
          : event,
      ),
    }));
  },

  deleteAllianceEvent: (eventId: string) => {
    set((state) => ({
      events: state.events.filter((event) => event.id !== eventId),
    }));
  },
}));
