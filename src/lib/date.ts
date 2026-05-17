const DAY_MS = 24 * 60 * 60 * 1000;

function startOfLocalDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

export function daysBetween(left: Date, right: Date) {
  const diff = startOfLocalDay(right).getTime() - startOfLocalDay(left).getTime();
  return Math.abs(Math.round(diff / DAY_MS));
}

export function getTogetherDays(startDate: Date, now = new Date()) {
  return daysBetween(startDate, now) + 1;
}

export function formatDateLabel(date: Date) {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  return `${year}.${month}.${day}`;
}

export function formatDateInputValue(date: Date) {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
}
