import { useEffect, useState } from "react";

type GitHubUser = {
  public_repos: number;
  followers: number;
  following: number;
  html_url: string;
};

type GitHubRepo = {
  fork: boolean;
  stargazers_count: number;
  forks_count: number;
  pushed_at: string;
  language: string | null;
};

export type GitHubStats = {
  publicRepos: number;
  followers: number;
  following: number;
  totalStars: number;
  totalForks: number;
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

function summarize(user: GitHubUser, repos: GitHubRepo[]): GitHubStats {
  const sourceRepos = repos.filter((repo) => !repo.fork);
  const languageCounts = new Map<string, number>();

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
    totalForks: sourceRepos.reduce((sum, repo) => sum + repo.forks_count, 0),
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
        setState({ stats: summarize(user, repos), loading: false, error: null });
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
