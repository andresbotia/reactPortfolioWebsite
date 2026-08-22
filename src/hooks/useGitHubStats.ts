import { useEffect, useState } from "react";

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

async function loadFromApi(signal: AbortSignal) {
  const response = await fetch("/api/github-stats", { signal });

  if (!response.ok) throw new Error("Portfolio GitHub stats API request failed");

  return (await response.json()) as GitHubStats;
}

export function useGitHubStats() {
  const [state, setState] = useState<State>({ stats: null, loading: true, error: null });

  useEffect(() => {
    const controller = new AbortController();

    async function load() {
      try {
        const stats = await loadFromApi(controller.signal);
        setState({ stats, loading: false, error: null });
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
