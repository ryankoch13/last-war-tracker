import { AllianceMember, AllianceMemberWithStats } from "@/types/alliance";

type DailyMemberStatRow = {
  member_id: string;
  vsScore: number | null;
  donations: number | null;
  date: string;
};

export function addWeeklyStatsToMembers(
  members: AllianceMember[],
  dailyStats: DailyMemberStatRow[],
): AllianceMemberWithStats[] {
  return members.map((member) => {
    const memberWeeklyStats = dailyStats.filter(
      (stat) => stat.member_id === member.id,
    );

    const weeklyVsScore = memberWeeklyStats.reduce(
      (total, stat) => total + (stat.vsScore ?? 0),
      0,
    );

    const weeklyDonations = memberWeeklyStats.reduce(
      (total, stat) => total + (stat.donations ?? 0),
      0,
    );

    return {
      ...member,
      weeklyVsScore,
      weeklyDonations,
    };
  });
}
