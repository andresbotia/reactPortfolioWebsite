import { Activity, GitFork, Star, UserRound } from "lucide-react";
import { useGitHubStats } from "../../hooks/useGitHubStats";

function formatDate(value: string | null) {
  if (!value) return "Unavailable";
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
}

export function GitHubStats() {
  const { stats, loading, error } = useGitHubStats();

  return (
    <section className="section github-section" id="github">
      <div className="section-kicker">GitHub</div>
      <div className="section-heading-row">
        <h2>Live public engineering signals.</h2>
        <p>
          This section reads Andres&apos;s public GitHub profile and repositories at runtime. The
          official contribution calendar needs an authenticated server-side GraphQL call, so it is
          intentionally not faked in the browser.
        </p>
      </div>
      <div className="github-panel">
        {loading ? (
          <p className="github-state">Loading public GitHub statistics...</p>
        ) : error || !stats ? (
          <p className="github-state">GitHub statistics are temporarily unavailable.</p>
        ) : (
          <>
            <div className="github-stat-grid">
              <article>
                <UserRound size={18} />
                <span>{stats.publicRepos}</span>
                <p>Public repos</p>
              </article>
              <article>
                <Star size={18} />
                <span>{stats.totalStars}</span>
                <p>Total stars</p>
              </article>
              <article>
                <GitFork size={18} />
                <span>{stats.totalForks}</span>
                <p>Total forks</p>
              </article>
              <article>
                <Activity size={18} />
                <span>{formatDate(stats.latestPush)}</span>
                <p>Latest public push</p>
              </article>
            </div>
            <div className="github-meta-row">
              <p>
                Followers: <strong>{stats.followers}</strong> / Following:{" "}
                <strong>{stats.following}</strong>
              </p>
              <p>
                Top languages:{" "}
                <strong>{stats.topLanguages.length ? stats.topLanguages.join(" / ") : "Unavailable"}</strong>
              </p>
              <a className="inline-link" href={stats.profileUrl} target="_blank" rel="noreferrer">
                View GitHub profile
              </a>
            </div>
          </>
        )}
      </div>
    </section>
  );
}
