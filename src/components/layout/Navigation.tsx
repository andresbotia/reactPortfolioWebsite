import { useEffect, useState } from "react";
import { profile } from "../../data/profile";
import "./Navigation.css";

const navItems = [
  { label: "Work", href: "#work" },
  { label: "Experience", href: "#experience" },
  { label: "Contact", href: "#contact" },
];

export function Navigation() {
  const [activeSection, setActiveSection] = useState("#top");

  useEffect(() => {
    const sectionIds = ["top", ...navItems.map((item) => item.href.slice(1))];

    const onScroll = () => {
      const current = sectionIds.reduce((active, id) => {
        const section = document.getElementById(id);
        if (!section) return active;
        return section.offsetTop <= window.scrollY + 180 ? id : active;
      }, "top");
      setActiveSection(`#${current}`);
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  return (
    <header className="masthead">
      <div className="masthead__inner">
        <a className="masthead__name" href="#top">
          {profile.name.toLowerCase()}
        </a>

        <nav className="masthead__links" aria-label="Sections">
          {navItems.map((item) => (
            <a
              key={item.href}
              className="masthead__link"
              href={item.href}
              aria-current={activeSection === item.href ? "true" : undefined}
            >
              {item.label}
            </a>
          ))}
        </nav>

        <a className="masthead__resume" href={profile.resumePath}>
          Résumé
        </a>
      </div>
    </header>
  );
}
