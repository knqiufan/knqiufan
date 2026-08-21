const TIMEZONE = "Asia/Shanghai";
const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

function todayInZone() {
  return new Date().toLocaleDateString("en-CA", { timeZone: TIMEZONE });
}

function addDays(dateStr, delta) {
  const [year, month, day] = dateStr.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, day + delta)).toISOString().slice(0, 10);
}

function formatDate(dateStr) {
  if (!dateStr) {
    return "Present";
  }
  const [year, month, day] = dateStr.split("-").map(Number);
  const yearPart = String(year) === todayInZone().slice(0, 4) ? "" : `, ${year}`;
  return `${MONTHS[month - 1]} ${day}${yearPart}`;
}

function formatRange(start, end, fallback) {
  if (!start) {
    return fallback;
  }
  const left = formatDate(start);
  const right = formatDate(end);
  return left === right ? left : `${left} - ${right}`;
}

function findLongestStreak(days) {
  let longest = { count: 0, start: null, end: null };
  let run = 0;
  let runStart = null;
  for (const day of days) {
    if (day.count > 0) {
      if (run === 0) {
        runStart = day.date;
      }
      run += 1;
      if (run > longest.count) {
        longest = { count: run, start: runStart, end: day.date };
      }
    } else {
      run = 0;
      runStart = null;
    }
  }
  return longest;
}

function findCurrentStreak(days) {
  const byDate = new Map(days.map((item) => [item.date, item.count]));
  const current = { count: 0, start: null, end: null };
  let cursor = todayInZone();
  if (!(byDate.get(cursor) > 0)) {
    cursor = addDays(cursor, -1);
  }
  if (!(byDate.get(cursor) > 0)) {
    return current;
  }
  current.end = cursor;
  while (byDate.get(cursor) > 0) {
    current.count += 1;
    current.start = cursor;
    cursor = addDays(cursor, -1);
  }
  return current;
}

function calculateStreaks(days) {
  const first = days.find((item) => item.count > 0);
  return {
    total: days.reduce((sum, item) => sum + item.count, 0),
    firstDate: first ? first.date : null,
    current: findCurrentStreak(days),
    longest: findLongestStreak(days),
  };
}

module.exports = { calculateStreaks, formatDate, formatRange };
