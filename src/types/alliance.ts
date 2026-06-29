import { AllianceRole } from "@/store/allianceStore";

export type SquadType = "Tank" | "Air" | "Missile" | "Mixed";

export type AllianceMember = {
  id: string;
  username: string;
  alliance_id: string;
  rank: AllianceRole;
  power: number;
  hqLevel: number;
  mainSquad: SquadType;
  timezone?: string;
  lastActiveAt?: string;
  weeklyVsScore: number;
  weeklyDonations: number;
  notes?: string;
};

export type ActiveAllianceState = {
  userId: string | null;
  member: AllianceMember | null;
  activeAllianceId: string | null;
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
  name: string;
  type: AllianceEventType;
  date: string; // "2026-06-27"
  status: AllianceEventStatus;
  assignedMemberIds: string[];
  notes?: string;
  completedAt?: string;
};

export type TrainAssignmentStatus = "active" | "completed";

export type TrainAssignment = {
  id: string;
  name: string;
  date: string; // "2026-06-27"
  status: TrainAssignmentStatus;

  conductorId?: string;
  guardIds: string[];
  passengerIds: string[];

  notes?: string;
  completedAt?: string;
};

export type DailyMemberStat = {
  id: string;
  memberId: string;
  date: string; // "2026-06-27"
  weeklyVs: number;
  donations: number;
};

export type StatMetric = "weeklyVs" | "donations";
export type StatRange = "week" | "month";

export type TopMemberStat = {
  memberId: string;
  memberName: string;
  total: number;
};
