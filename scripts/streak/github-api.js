const GITHUB_GRAPHQL = "https://api.github.com/graphql";

async function graphql(token, query, variables) {
  const response = await fetch(GITHUB_GRAPHQL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      "User-Agent": "knqiufan-streak-stats",
    },
    body: JSON.stringify({ query, variables }),
  });
  const payload = await response.json();
  if (!response.ok || payload.errors) {
    const detail = JSON.stringify(payload.errors || payload, null, 2);
    throw new Error(`GitHub GraphQL failed: ${detail}`);
  }
  return payload.data;
}

async function fetchCreatedYear(token, login) {
  const data = await graphql(
    token,
    `query ($login: String!) {
      user(login: $login) { createdAt }
    }`,
    { login },
  );
  if (!data.user) {
    throw new Error(`GitHub user not found: ${login}`);
  }
  return Number(data.user.createdAt.slice(0, 4));
}

async function fetchYearDays(token, login, year) {
  const data = await graphql(
    token,
    `query ($login: String!, $from: DateTime!, $to: DateTime!) {
      user(login: $login) {
        contributionsCollection(from: $from, to: $to) {
          contributionCalendar {
            weeks {
              contributionDays { date contributionCount }
            }
          }
        }
      }
    }`,
    {
      login,
      from: `${year}-01-01T00:00:00+08:00`,
      to: `${year}-12-31T23:59:59+08:00`,
    },
  );
  return data.user.contributionsCollection.contributionCalendar.weeks.flatMap(
    (week) =>
      week.contributionDays.map((day) => ({
        date: day.date,
        count: day.contributionCount,
      })),
  );
}

async function fetchAllDays(token, login) {
  const startYear = await fetchCreatedYear(token, login);
  const currentYear = Number(
    new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Shanghai" }).slice(0, 4),
  );
  const years = [];
  for (let year = startYear; year <= currentYear; year += 1) {
    years.push(year);
  }
  const pages = await Promise.all(years.map((year) => fetchYearDays(token, login, year)));
  const unique = new Map();
  for (const day of pages.flat()) {
    unique.set(day.date, day);
  }
  return [...unique.values()].sort((left, right) => left.date.localeCompare(right.date));
}

module.exports = { fetchAllDays };
