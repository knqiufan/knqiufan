const fs = require("fs");
const path = require("path");
const { fetchAllDays } = require("./streak/github-api");
const { lastYearSeries, summarizeSeries } = require("./graph/series");
const { renderSvg } = require("./graph/svg");

const OUTPUT = path.join(__dirname, "..", "profile", "activity-graph.svg");

function readConfig() {
  const token = process.env.GITHUB_TOKEN || process.env.GH_TOKEN;
  const login = process.env.GITHUB_REPOSITORY_OWNER || "knqiufan";
  if (!token) {
    throw new Error("GITHUB_TOKEN is required to generate activity graph");
  }
  return { token, login };
}

async function main() {
  const { token, login } = readConfig();
  const days = await fetchAllDays(token, login);
  const chart = summarizeSeries(lastYearSeries(days));
  fs.mkdirSync(path.dirname(OUTPUT), { recursive: true });
  fs.writeFileSync(OUTPUT, renderSvg(login, chart), "utf8");
  console.log(`Wrote ${OUTPUT}`);
  console.log(JSON.stringify({ total: chart.total, max: chart.max, days: chart.series.length }, null, 2));
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
