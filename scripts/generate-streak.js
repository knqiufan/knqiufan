const fs = require("fs");
const path = require("path");
const { fetchAllDays } = require("./streak/github-api");
const { calculateStreaks } = require("./streak/stats");
const { renderSvg } = require("./streak/svg");

const OUTPUT = path.join(__dirname, "..", "profile", "streak.svg");

function readConfig() {
  const token = process.env.GITHUB_TOKEN || process.env.GH_TOKEN;
  const login = process.env.GITHUB_REPOSITORY_OWNER || "knqiufan";
  if (!token) {
    throw new Error("GITHUB_TOKEN is required to generate streak stats");
  }
  return { token, login };
}

async function main() {
  const { token, login } = readConfig();
  const days = await fetchAllDays(token, login);
  const stats = calculateStreaks(days);
  fs.mkdirSync(path.dirname(OUTPUT), { recursive: true });
  fs.writeFileSync(OUTPUT, renderSvg(stats), "utf8");
  console.log(`Wrote ${OUTPUT}`);
  console.log(JSON.stringify(stats, null, 2));
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
