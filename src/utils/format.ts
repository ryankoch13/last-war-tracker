export function formatNumber(value: number) {
  return new Intl.NumberFormat("en-US").format(value);
}

export function formatCompactNumber(value: number | string | null | undefined) {
  const numericValue = Number(value ?? 0);

  if (!Number.isFinite(numericValue)) {
    return "0";
  }

  if (numericValue >= 1_000_000) {
    return `${(numericValue / 1_000_000).toFixed(1).replace(".0", "")}M`;
  }

  if (numericValue >= 1_000) {
    return `${(numericValue / 1_000).toFixed(1).replace(".0", "")}K`;
  }

  return numericValue.toString();
}

export function formatDateTime(value: string) {
  return new Date(value).toLocaleString([], {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}
