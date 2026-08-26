const { MONTHS, addDays, todayInZone } = require("../streak/stats");

const DAY_COUNT = 365;

function niceMax(value) {
  if (value <= 0) {
    return 1;
  }
  const magnitude = 10 ** Math.floor(Math.log10(value));
  const normalized = value / magnitude;
  const nice = normalized <= 1 ? 1 : normalized <= 2 ? 2 : normalized <= 5 ? 5 : 10;
  return nice * magnitude;
}

function lastYearSeries(days) {
  const byDate = new Map(days.map((item) => [item.date, item.count]));
  const today = todayInZone();
  const series = [];
  for (let offset = DAY_COUNT - 1; offset >= 0; offset -= 1) {
    const date = addDays(today, -offset);
    series.push({ date, count: byDate.get(date) || 0 });
  }
  return series;
}

function monthTicks(series) {
  const ticks = [];
  let lastMonth = "";
  for (let index = 0; index < series.length; index += 1) {
    const month = series[index].date.slice(0, 7);
    if (month === lastMonth) {
      continue;
    }
    lastMonth = month;
    const monthIndex = Number(series[index].date.slice(5, 7)) - 1;
    ticks.push({ index, label: MONTHS[monthIndex] });
  }
  return ticks;
}

function summarizeSeries(series) {
  const maxCount = series.reduce((max, item) => Math.max(max, item.count), 0);
  return {
    series,
    max: niceMax(maxCount),
    total: series.reduce((sum, item) => sum + item.count, 0),
    months: monthTicks(series),
  };
}

module.exports = { lastYearSeries, summarizeSeries };
