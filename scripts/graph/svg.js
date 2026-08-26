const WIDTH = 850;
const HEIGHT = 375;
const PLOT = { left: 52, top: 52, right: 826, bottom: 332 };

function escapeXml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

function pointAt(index, count, length, max) {
  const span = Math.max(length - 1, 1);
  const x = PLOT.left + ((PLOT.right - PLOT.left) * index) / span;
  const y = PLOT.bottom - ((PLOT.bottom - PLOT.top) * count) / max;
  return { x: Number(x.toFixed(2)), y: Number(y.toFixed(2)) };
}

function mapPoints(series, max) {
  return series.map((item, index) => pointAt(index, item.count, series.length, max));
}

function renderGrid(max) {
  const ticks = [0, max / 2, max];
  return ticks
    .map((value) => {
      const y = pointAt(0, value, 2, max).y;
      return `    <line x1="${PLOT.left}" y1="${y}" x2="${PLOT.right}" y2="${y}" stroke="#70A5FD" stroke-opacity="0.18"/>
    <text x="${PLOT.left - 8}" y="${y + 4}" text-anchor="end" fill="#70A5FD"
      font-family='"Segoe UI", Ubuntu, sans-serif' font-size="11px">${value}</text>`;
    })
    .join("\n");
}

function monthX(series, tick) {
  return pointAt(tick.index, 0, series.length, 1).x;
}

function renderMonths(series, months) {
  const labels = [];
  let lastX = -Infinity;
  for (let index = 0; index < months.length; index += 1) {
    const tick = months[index];
    const x = monthX(series, tick);
    const next = months[index + 1];
    const tooCloseToNext = next && monthX(series, next) - x < 36;
    if ((tooCloseToNext && lastX === -Infinity) || x - lastX < 36) {
      continue;
    }
    lastX = x;
    labels.push(`    <text x="${x}" y="${PLOT.bottom + 22}" text-anchor="middle" fill="#70A5FD"
      font-family='"Segoe UI", Ubuntu, sans-serif' font-size="11px">${tick.label}</text>`);
  }
  return labels.join("\n");
}

function renderSeries(points, series) {
  const line = points.map((point, index) => `${index === 0 ? "M" : "L"}${point.x} ${point.y}`).join(" ");
  const area = `${line} L${points[points.length - 1].x} ${PLOT.bottom} L${points[0].x} ${PLOT.bottom} Z`;
  const dots = series
    .map((item, index) => {
      if (item.count <= 0) {
        return "";
      }
      const point = points[index];
      return `    <circle cx="${point.x}" cy="${point.y}" r="2" fill="#A9B1D6"/>`;
    })
    .filter(Boolean)
    .join("\n");
  return `    <path d="${area}" fill="#70A5FD" fill-opacity="0.28"/>
    <path d="${line}" fill="none" stroke="#70A5FD" stroke-width="2" stroke-linejoin="round"/>
${dots}`;
}

function renderSvg(login, chart) {
  const points = mapPoints(chart.series, chart.max);
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${WIDTH} ${HEIGHT}" width="${WIDTH}px" height="${HEIGHT}px" role="img">
  <title>${escapeXml(login)}'s Contribution Graph</title>
  <rect x="0.5" y="0.5" width="${WIDTH - 1}" height="${HEIGHT - 1}" rx="4.5" fill="#1A1B27" stroke="#E4E2E2"/>
  <text x="${WIDTH / 2}" y="28" text-anchor="middle" fill="#70A5FD"
    font-family='"Segoe UI", Ubuntu, sans-serif' font-weight="600" font-size="16px">${escapeXml(login)}'s Contribution Graph</text>
${renderGrid(chart.max)}
${renderMonths(chart.series, chart.months)}
${renderSeries(points, chart.series)}
</svg>
`;
}

module.exports = { renderSvg };
