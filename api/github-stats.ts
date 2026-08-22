import type { IncomingMessage, ServerResponse } from "node:http";

type GitHubUser = {
  public_repos: number;
  followers: number;
  following: number;
  html_url: string;
};

type GitHubRepo = {
  fork: boolean;
  name: string;
  stargazers_count: number;
  pushed_at: string;
  language: string | null;
};

type GitHubStats = {
  publicRepos: number;
  followers: number;
  following: number;
  totalStars: number;
  commitsThisYear: number | null;
  currentYear: number;
  activeRepos: number;
  topLanguages: string[];
  latestPush: string | null;
  profileUrl: string;
};

const username = "andresbotia";

function getCurrentYearStart() {
  const currentYear = new Date().getFullYear();
  return {
    currentYear,
    since: new Date(Date.UTC(currentYear, 0, 1)).toISOString(),
  };
}

function getGitHubHeaders() {
  const headers: Record<string, string> = {
    Accept: "application/vnd.github+json",
    "User-Agent": "andresbotia.com",
    "X-GitHub-Api-Version": "2022-11-28",
  };

  if (process.env.GITHUB_TOKEN) {
    headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
  }

  return headers;
}

async function fetchGitHub<T>(path: string) {
  const response = await fetch(`https://api.github.com${path}`, {
    headers: getGitHubHeaders(),
  });

  if (!response.ok) {
    throw new Error(`GitHub API request failed with ${response.status}`);
  }

  return {
    response,
    data: (await response.json()) as T,
  };
}

function getCommitCountFromHeaders(response: Response, commits: unknown[]) {
  const linkHeader = response.headers.get("link");
  const lastPageMatch = linkHeader?.match(/[?&]page=(\d+)>;\s*rel="last"/);

  if (lastPageMatch) return Number(lastPageMatch[1]);
  return commits.length;
}

async function countRepoCommitsThisYear(repo: GitHubRepo, since: string) {
  const response = await fetch(
    `https://api.github.com/repos/${username}/${encodeURIComponent(
      repo.name,
    )}/commits?author=${username}&since=${encodeURIComponent(since)}&per_page=1`,
    {
      headers: getGitHubHeaders(),
    },
  );

  if (response.status === 409) return 0;
  if (!response.ok) throw new Error(`GitHub commit count failed with ${response.status}`);

  const commits = (await response.json()) as unknown[];
  return getCommitCountFromHeaders(response, commits);
}

async function countCommitsThisYear(repos: GitHubRepo[], since: string) {
  const sourceRepos = repos.filter((repo) => !repo.fork);
  const results = await Promise.allSettled(
    sourceRepos.map((repo) => countRepoCommitsThisYear(repo, since)),
  );
  const fulfilled = results.filter((result) => result.status === "fulfilled");

  if (!fulfilled.length && sourceRepos.length) return null;
  return fulfilled.reduce((sum, result) => sum + result.value, 0);
}

function summarize(user: GitHubUser, repos: GitHubRepo[], commitsThisYear: number | null): GitHubStats {
  const sourceRepos = repos.filter((repo) => !repo.fork);
  const languageCounts = new Map<string, number>();
  const { currentYear } = getCurrentYearStart();

  sourceRepos.forEach((repo) => {
    if (repo.language) languageCounts.set(repo.language, (languageCounts.get(repo.language) ?? 0) + 1);
  });

  const latestPush =
    sourceRepos
      .map((repo) => repo.pushed_at)
      .sort((a, b) => new Date(b).getTime() - new Date(a).getTime())[0] ?? null;

  return {
    publicRepos: user.public_repos,
    followers: user.followers,
    following: user.following,
    totalStars: sourceRepos.reduce((sum, repo) => sum + repo.stargazers_count, 0),
    commitsThisYear,
    currentYear,
    activeRepos: sourceRepos.length,
    topLanguages: Array.from(languageCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([language]) => language),
    latestPush,
    profileUrl: user.html_url,
  };
}

async function getGitHubStats() {
  const [{ data: user }, { data: repos }] = await Promise.all([
    fetchGitHub<GitHubUser>(`/users/${username}`),
    fetchGitHub<GitHubRepo[]>(`/users/${username}/repos?per_page=100&sort=pushed`),
  ]);
  const { since } = getCurrentYearStart();
  const commitsThisYear = await countCommitsThisYear(repos, since);

  return summarize(user, repos, commitsThisYear);
}

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    res.statusCode = 204;
    res.end();
    return;
  }

  if (req.method !== "GET") {
    res.statusCode = 405;
    res.setHeader("Content-Type", "application/json; charset=utf-8");
    res.end(JSON.stringify({ error: "Method not allowed" }));
    return;
  }

  try {
    const stats = await getGitHubStats();

    res.statusCode = 200;
    res.setHeader("Content-Type", "application/json; charset=utf-8");
    res.setHeader("Cache-Control", "public, s-maxage=3600, stale-while-revalidate=86400");
    res.end(JSON.stringify(stats));
  } catch (error) {
    console.error(error);
    res.statusCode = 502;
    res.setHeader("Content-Type", "application/json; charset=utf-8");
    res.setHeader("Cache-Control", "no-store");
    res.end(JSON.stringify({ error: "Unable to load GitHub stats" }));
  }
}
