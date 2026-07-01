export function getDateKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

export function getStartOfWeek(date: Date) {
  const result = new Date(date);
  result.setHours(0, 0, 0, 0);

  // Sunday-start week
  const day = result.getDay();
  result.setDate(result.getDate() - day);

  return result;
}

export function addDays(date: Date, days: number) {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

export function addWeeks(date: Date, weeks: number) {
  return addDays(date, weeks * 7);
}

export function getWeekDays(weekStart: Date) {
  return Array.from({ length: 7 }, (_, index) => addDays(weekStart, index));
}

export function formatShortDate(date: Date) {
  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
}

export function formatWeekRange(weekStart: Date) {
  const weekEnd = addDays(weekStart, 6);

  return `${formatShortDate(weekStart)} - ${formatShortDate(weekEnd)}`;
}

export function formatWeekday(date: Date) {
  return date.toLocaleDateString(undefined, {
    weekday: "short",
  });
}

export function getLocalDateString() {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}
