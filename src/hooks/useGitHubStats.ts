import { useEffect, useState } from "react";

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

export type GitHubStats = {
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

type State = {
  stats: GitHubStats | null;
  loading: boolean;
  error: string | null;
};

const username = "andresbotia";

function getCurrentYearStart() {
  const currentYear = new Date().getFullYear();
  return {
    currentYear,
    since: new Date(Date.UTC(currentYear, 0, 1)).toISOString(),
  };
}

function getCommitCountFromHeaders(response: Response, commits: unknown[]) {
  const linkHeader = response.headers.get("link");
  const lastPageMatch = linkHeader?.match(/[?&]page=(\d+)>;\s*rel="last"/);

  if (lastPageMatch) return Number(lastPageMatch[1]);
  return commits.length;
}

async function countRepoCommitsThisYear(repo: GitHubRepo, since: string, signal: AbortSignal) {
  const response = await fetch(
    `https://api.github.com/repos/${username}/${encodeURIComponent(
      repo.name,
    )}/commits?author=${username}&since=${encodeURIComponent(since)}&per_page=1`,
    { signal },
  );

  if (response.status === 409) return 0;
  if (!response.ok) throw new Error("GitHub commit count request failed");

  const commits = (await response.json()) as unknown[];
  return getCommitCountFromHeaders(response, commits);
}

async function countCommitsThisYear(repos: GitHubRepo[], since: string, signal: AbortSignal) {
  const sourceRepos = repos.filter((repo) => !repo.fork);
  const results = await Promise.allSettled(
    sourceRepos.map((repo) => countRepoCommitsThisYear(repo, since, signal)),
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

export function useGitHubStats() {
  const [state, setState] = useState<State>({ stats: null, loading: true, error: null });

  useEffect(() => {
    const controller = new AbortController();

    async function load() {
      try {
        const [userResponse, reposResponse] = await Promise.all([
          fetch(`https://api.github.com/users/${username}`, { signal: controller.signal }),
          fetch(`https://api.github.com/users/${username}/repos?per_page=100&sort=pushed`, {
            signal: controller.signal,
          }),
        ]);

        if (!userResponse.ok || !reposResponse.ok) {
          throw new Error("GitHub API request failed");
        }

        const user = (await userResponse.json()) as GitHubUser;
        const repos = (await reposResponse.json()) as GitHubRepo[];
        const { since } = getCurrentYearStart();
        const commitsThisYear = await countCommitsThisYear(repos, since, controller.signal);

        setState({ stats: summarize(user, repos, commitsThisYear), loading: false, error: null });
      } catch (error) {
        if (controller.signal.aborted) return;
        setState({
          stats: null,
          loading: false,
          error: error instanceof Error ? error.message : "Unable to load GitHub stats",
        });
      }
    }

    load();
    return () => controller.abort();
  }, []);

  return state;
}
