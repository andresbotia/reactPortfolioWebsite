import { profile } from "../../data/profile";

export function Footer() {
  return (
    <footer className="site-footer">
      <p>Designed and built by {profile.name}</p>
      <p>{new Date().getFullYear()} / React / Three.js</p>
    </footer>
  );
}
