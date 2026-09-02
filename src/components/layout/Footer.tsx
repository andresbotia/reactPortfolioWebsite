import { BUILD_MONTH } from "../../data/experience";
import { profile } from "../../data/profile";

export function Footer() {
  /*
   * The year comes from the build constant, not from new Date(): reading the
   * clock during render would make the prerendered HTML disagree with the
   * client on 1 January.
   */
  const year = BUILD_MONTH.slice(0, 4);

  return (
    <footer className="site-footer">
      <p>
        {profile.name}, {year}
      </p>
    </footer>
  );
}
