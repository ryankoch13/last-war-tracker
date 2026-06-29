import type {
    AllianceMember,
    DailyMemberStat,
    StatMetric,
    StatRange,
    TopMemberStat,
} from "../types/alliance";

export function getTodayDateKey() {
  return getDateKey(new Date());
}

export function getDateKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function parseDateKey(dateKey: string) {
  const [year, month, day] = dateKey.split("-").map(Number);
  return new Date(year, month - 1, day);
}

function startOfWeek(date: Date) {
  const result = new Date(date);
  result.setHours(0, 0, 0, 0);

  // Monday-start week
  const day = result.getDay();
  const diff = day === 0 ? -6 : 1 - day;

  result.setDate(result.getDate() + diff);
  return result;
}

function startOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function isDateInRange(
  dateKey: string,
  range: StatRange,
  referenceDate = new Date(),
) {
  const statDate = parseDateKey(dateKey);
  statDate.setHours(0, 0, 0, 0);

  const start =
    range === "week" ? startOfWeek(referenceDate) : startOfMonth(referenceDate);

  return statDate >= start && statDate <= referenceDate;
}

export function getTopMemberStats(params: {
  members: AllianceMember[];
  dailyStats: DailyMemberStat[];
  metric: StatMetric;
  range: StatRange;
  limit?: number;
  referenceDate?: Date;
}): TopMemberStat[] {
  const {
    members,
    dailyStats,
    metric,
    range,
    limit = 5,
    referenceDate = new Date(),
  } = params;

  const totalsByMemberId = new Map<string, number>();

  dailyStats
    .filter((stat) => isDateInRange(stat.date, range, referenceDate))
    .forEach((stat) => {
      const currentTotal = totalsByMemberId.get(stat.memberId) ?? 0;
      totalsByMemberId.set(stat.memberId, currentTotal + stat[metric]);
    });

  return members
    .map((member) => ({
      memberId: member.id,
      memberName: member.username,
      total: totalsByMemberId.get(member.id) ?? 0,
    }))
    .filter((item) => item.total > 0)
    .sort((a, b) => b.total - a.total)
    .slice(0, limit);
}
