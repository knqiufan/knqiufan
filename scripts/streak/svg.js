const { formatDate, formatRange } = require("./stats");

function escapeXml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

function renderText(x, y, value, fill, size, weight = "400") {
  return `    <text x="${x}" y="${y}" text-anchor="middle" fill="${fill}"
      font-family='"Segoe UI", Ubuntu, sans-serif' font-weight="${weight}" font-size="${size}">${escapeXml(value)}</text>`;
}

function renderSvg(stats) {
  const totalRange = `${formatDate(stats.firstDate)} - Present`;
  const currentRange = formatRange(stats.current.start, stats.current.end, "No current streak");
  const longestRange = formatRange(stats.longest.start, stats.longest.end, "No longest streak");

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 495 195" width="495px" height="195px" role="img">
  <title>GitHub Streak</title>
  <defs>
    <clipPath id="outer_rectangle">
      <rect width="495" height="195" rx="4.5"/>
    </clipPath>
    <mask id="mask_out_ring_behind_fire">
      <rect width="495" height="195" fill="white"/>
      <ellipse cx="247.5" cy="32" rx="13" ry="18" fill="black"/>
    </mask>
  </defs>
  <g clip-path="url(#outer_rectangle)">
    <rect x="0.5" y="0.5" width="494" height="194" rx="4.5" fill="#1A1B27" stroke="#E4E2E2"/>
    <line x1="165" y1="28" x2="165" y2="170" stroke="#E4E2E2" stroke-width="1"/>
    <line x1="330" y1="28" x2="330" y2="170" stroke="#E4E2E2" stroke-width="1"/>
${renderText(82.5, 80, stats.total, "#70A5FD", "28px", "700")}
${renderText(82.5, 116, "Total Contributions", "#70A5FD", "14px")}
${renderText(82.5, 146, totalRange, "#38BDAE", "12px")}
    <circle cx="247.5" cy="71" r="40" fill="none" stroke="#70A5FD" stroke-width="5"
      mask="url(#mask_out_ring_behind_fire)"/>
    <path transform="translate(235.5,19.5)" fill="#70A5FD"
      d="M12 0.8s-5.8 6.2-5.8 11.2A5.8 5.8 0 0 0 12 17.8a5.8 5.8 0 0 0 5.8-5.8C17.8 7 12 0.8 12 0.8z"/>
${renderText(247.5, 80, stats.current.count, "#BF91F3", "28px", "700")}
${renderText(247.5, 140, "Current Streak", "#BF91F3", "14px")}
${renderText(247.5, 177, currentRange, "#38BDAE", "12px")}
${renderText(412.5, 80, stats.longest.count, "#70A5FD", "28px", "700")}
${renderText(412.5, 116, "Longest Streak", "#70A5FD", "14px")}
${renderText(412.5, 146, longestRange, "#38BDAE", "12px")}
  </g>
</svg>
`;
}

module.exports = { renderSvg };
