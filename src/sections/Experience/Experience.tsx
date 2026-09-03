import type { CSSProperties } from "react";
import {
  BUILD_MONTH,
  formatMonth,
  longestSpan,
  span,
  tenures,
} from "../../data/experience";
import "./Experience.css";

function Dates({ start, end }: { start: string; end: string | null }) {
  return (
    <span className="dates">
      <time dateTime={start}>{formatMonth(start)}</time>
      <span aria-hidden="true"> – </span>
      {end ? (
        <time dateTime={end}>{formatMonth(end)}</time>
      ) : (
        <span>present</span>
      )}
    </span>
  );
}

export function Experience() {
  const longest = longestSpan(BUILD_MONTH);

  return (
    <section
      className="band band--experience"
      id="experience"
      aria-labelledby="experience-heading"
    >
      <div className="band-inner">
        {/*
          The progress trace. It is not a new element in the design: it sits
          exactly on the spine that already runs down every section, and in this
          one section that hairline inks in as you read. The section is
          chronological, so filling it encodes progress through the five years
          rather than decorating the scroll.
        */}
        <div className="trace" aria-hidden="true">
          <span className="trace-fill" />
        </div>

        <div className="band-row">
          <div className="band-rail">
            <span className="rail-note">Experience</span>
          </div>
          <div className="band-body">
            <h2 className="band-title" id="experience-heading">
              Legacy on one side, React on the other
            </h2>
          </div>
        </div>

        {tenures.map((tenure) => {
          const months = span(tenure, BUILD_MONTH);
          return (
            <article className="band-row tenure" key={tenure.company}>
              <div className="band-rail">
                <span className="rail-value">
                  <Dates start={tenure.start} end={tenure.end} />
                </span>
                {/*
                  Duration drawn to a shared scale. The date range beside it
                  already states the same fact in words, so the bar is redundant
                  for a screen reader and hidden from it — but it is what lets a
                  sighted reader see the shape of five years at a glance.
                */}
                <span
                  className="span-bar"
                  aria-hidden="true"
                  style={{ "--fill": months / longest } as CSSProperties}
                />
                <span className="rail-note">{tenure.location}</span>
              </div>

              <div className="band-body">
                <h3 className="tenure-company">{tenure.company}</h3>

                <ol className="roles">
                  {tenure.roles.map((role) => (
                    <li key={role.title}>
                      <span className="role-title">{role.title}</span>
                      <span className="role-dates">
                        <Dates start={role.start} end={role.end} />
                      </span>
                    </li>
                  ))}
                </ol>

                <p className="band-text tenure-body">{tenure.body}</p>

                {tenure.highlight ? (
                  <div className="highlight">
                    <h4 className="highlight-name">{tenure.highlight.name}</h4>
                    <p className="band-text">{tenure.highlight.body}</p>
                  </div>
                ) : null}

                <p className="case-stack">{tenure.stack.join(", ")}</p>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
