import { create } from "zustand";
import {
  createJSONStorage,
  persist,
  type StateStorage,
} from "zustand/middleware";

import { supabase } from "@/lib/supabase";

const storage = new MMKV({
  id: "alliance-store",
});

const zustandStorage: StateStorage = {
  getItem: (name) => {
    return storage.getString(name) ?? null;
  },
  setItem: (name, value) => {
    storage.set(name, value);
  },
  removeItem: (name) => {
    storage.delete(name);
  },
};

export type Alliance = {
  id: string;
  name: string;
  tag: string | null;
  server: string | null;
  createdAt: string | null;
};

type AllianceRow = {
  id: string;
  name?: string | null;
  title?: string | null;
  tag?: string | null;
  alliance_tag?: string | null;
  server?: string | number | null;
  server_number?: string | number | null;
  created_at?: string | null;
};

type CreateAllianceInput = {
  name: string;
  tag?: string | null;
  server?: string | number | null;
};

type AllianceStore = {
  alliances: Alliance[];
  activeAllianceId: string | null;
  activeAlliance: Alliance | null;

  loading: boolean;
  error: string | null;
  hasLoaded: boolean;

  loadAlliances: () => Promise<void>;
  createAlliance: (input: CreateAllianceInput) => Promise<Alliance>;

  setActiveAlliance: (alliance: Alliance | null) => void;
  setActiveAllianceId: (allianceId: string | null) => void;

  clearActiveAlliance: () => void;
  clearError: () => void;
  resetAllianceStore: () => void;
};

function mapAllianceRow(row: AllianceRow): Alliance {
  return {
    id: row.id,
    name: row.name ?? row.title ?? "Alliance",
    tag: row.tag ?? row.alliance_tag ?? null,
    server:
      row.server !== undefined && row.server !== null
        ? String(row.server)
        : row.server_number !== undefined && row.server_number !== null
          ? String(row.server_number)
          : null,
    createdAt: row.created_at ?? null,
  };
}

export const useAllianceStore = create<AllianceStore>()(
  persist(
    (set, get) => ({
      alliances: [],
      activeAllianceId: null,
      activeAlliance: null,

      loading: false,
      error: null,
      hasLoaded: false,

      loadAlliances: async () => {
        try {
          set({
            loading: true,
            error: null,
          });

          const { data, error } = await supabase
            .from("alliances")
            .select("*")
            .order("created_at", { ascending: true });

          if (error) {
            throw error;
          }

          const alliances = (data ?? []).map((row) =>
            mapAllianceRow(row as AllianceRow),
          );

          const currentActiveAllianceId = get().activeAllianceId;

          const currentActiveAlliance =
            alliances.find(
              (alliance) => alliance.id === currentActiveAllianceId,
            ) ?? null;

          const fallbackAlliance = alliances[0] ?? null;

          const nextActiveAlliance =
            currentActiveAlliance ?? fallbackAlliance ?? null;

          set({
            alliances,
            activeAlliance: nextActiveAlliance,
            activeAllianceId: nextActiveAlliance?.id ?? null,
            loading: false,
            hasLoaded: true,
            error: null,
          });
        } catch (error) {
          console.error("Failed to load alliances", error);

          set({
            loading: false,
            hasLoaded: true,
            error:
              error instanceof Error
                ? error.message
                : "Failed to load alliances.",
          });
        }
      },

      createAlliance: async (input) => {
        const name = input.name.trim();

        if (!name) {
          throw new Error("Alliance name is required.");
        }

        try {
          set({
            loading: true,
            error: null,
          });

          const {
            data: { user },
            error: userError,
          } = await supabase.auth.getUser();

          if (userError) {
            throw userError;
          }

          const insertPayload = {
            name,
            tag: input.tag?.trim() || null,
            server:
              input.server !== undefined && input.server !== null
                ? String(input.server).trim()
                : null,
            created_by: user?.id ?? null,
          };

          const { data, error } = await supabase
            .from("alliances")
            .insert(insertPayload)
            .select("*")
            .single();

          if (error) {
            throw error;
          }

          const createdAlliance = mapAllianceRow(data as AllianceRow);

          set((state) => ({
            alliances: [
              ...state.alliances.filter(
                (alliance) => alliance.id !== createdAlliance.id,
              ),
              createdAlliance,
            ],
            activeAlliance: createdAlliance,
            activeAllianceId: createdAlliance.id,
            loading: false,
            hasLoaded: true,
            error: null,
          }));

          return createdAlliance;
        } catch (error) {
          console.error("Failed to create alliance", error);

          set({
            loading: false,
            error:
              error instanceof Error
                ? error.message
                : "Failed to create alliance.",
          });

          throw error;
        }
      },

      setActiveAlliance: (alliance) => {
        set({
          activeAlliance: alliance,
          activeAllianceId: alliance?.id ?? null,
        });
      },

      setActiveAllianceId: (allianceId) => {
        const alliance =
          get().alliances.find((item) => item.id === allianceId) ?? null;

        set({
          activeAllianceId: allianceId,
          activeAlliance: alliance,
        });
      },

      clearActiveAlliance: () => {
        set({
          activeAllianceId: null,
          activeAlliance: null,
        });
      },

      clearError: () => {
        set({
          error: null,
        });
      },

      resetAllianceStore: () => {
        set({
          alliances: [],
          activeAllianceId: null,
          activeAlliance: null,
          loading: false,
          error: null,
          hasLoaded: false,
        });
      },
    }),
    {
      name: "alliance-store",
      storage: createJSONStorage(() => zustandStorage),
      partialize: (state) => ({
        activeAllianceId: state.activeAllianceId,
        activeAlliance: state.activeAlliance,
      }),
    },
  ),
);
