import { AllianceRole } from "@/store/allianceStore";

export type SquadType = "Tank" | "Air" | "Missile" | "Mixed";

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
  weeklyVsScore: number;
  weeklyDonations: number;
};

export type ActiveAllianceState = {
  userId: string | null;
  member: AllianceMember | null;
  activeAllianceId: string | null;
};

export type AllianceEventStatus = "upcoming" | "in-progress" | "completed";

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
  allianceId: string;
  memberId: string;
  date: string;
  vsScore: number;
  donations: number;
  createdAt: string;
  updatedAt?: string | null;
};

export type SaveDailyMemberStatsInput = {
  memberId: string;
  date: string;
  vsScore: number;
  donations: number;
};

export type StatMetric = "weeklyVs" | "donations";
export type StatRange = "week" | "month";

export type TopMemberStat = {
  memberId: string;
  memberName: string;
  total: number;
};
