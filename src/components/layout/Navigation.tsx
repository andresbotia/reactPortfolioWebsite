import { Menu, X } from "lucide-react";
import { useEffect, useState } from "react";
import { profile } from "../../data/profile";

const navItems = [
  { label: "About", href: "#about" },
  { label: "Experience", href: "#experience" },
  { label: "GitHub", href: "#github" },
  { label: "Work", href: "#work" },
  { label: "Stack", href: "#stack" },
  { label: "Contact", href: "#contact" },
];

function GitHubIcon() {
  return (
    <svg className="social-icon" viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="currentColor"
        d="M12 2C6.48 2 2 6.58 2 12.22c0 4.5 2.87 8.32 6.84 9.67.5.1.68-.22.68-.49 0-.24-.01-1.04-.01-1.89-2.78.62-3.37-1.21-3.37-1.21-.45-1.18-1.11-1.49-1.11-1.49-.91-.64.07-.63.07-.63 1 .07 1.53 1.06 1.53 1.06.9 1.56 2.35 1.11 2.92.85.09-.66.35-1.11.63-1.37-2.22-.26-4.56-1.14-4.56-5.07 0-1.12.39-2.03 1.03-2.75-.1-.26-.45-1.3.1-2.71 0 0 .84-.27 2.75 1.05A9.35 9.35 0 0 1 12 6.59c.85 0 1.7.12 2.5.35 1.9-1.32 2.74-1.05 2.74-1.05.55 1.41.2 2.45.1 2.71.64.72 1.03 1.63 1.03 2.75 0 3.94-2.34 4.8-4.57 5.06.36.32.68.94.68 1.9 0 1.37-.01 2.47-.01 2.81 0 .27.18.59.69.49A10.05 10.05 0 0 0 22 12.22C22 6.58 17.52 2 12 2Z"
      />
    </svg>
  );
}

function LinkedInIcon() {
  return (
    <svg className="social-icon" viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="currentColor"
        d="M6.94 8.9H3.73v10.36h3.21V8.9ZM5.34 4.74a1.86 1.86 0 1 0 0 3.72 1.86 1.86 0 0 0 0-3.72Zm13.93 8.58c0-3.12-1.66-4.57-3.88-4.57a3.35 3.35 0 0 0-3.01 1.65h-.04V8.9H9.27v10.36h3.2v-5.12c0-1.35.26-2.66 1.93-2.66 1.65 0 1.67 1.54 1.67 2.75v5.03h3.2v-5.94Z"
      />
    </svg>
  );
}

export function Navigation() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("#top");

  useEffect(() => {
    const sectionIds = ["top", ...navItems.map((item) => item.href.slice(1))];
    const onScroll = () => {
      setScrolled(window.scrollY > 24);

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
    <header className={`site-nav ${scrolled ? "site-nav--scrolled" : ""}`}>
      <a className="brand" href="#top" aria-label="Andres Botia home">
        <span>{profile.initials}</span>
      </a>

      <nav className="desktop-nav" aria-label="Main navigation">
        {navItems.map((item) => (
          <a
            key={item.href}
            href={item.href}
            aria-current={activeSection === item.href ? "page" : undefined}
          >
            {item.label}
          </a>
        ))}
      </nav>

      <div className="nav-actions">
        <a href={profile.socials[0].href} aria-label="GitHub" target="_blank" rel="noreferrer">
          <GitHubIcon />
        </a>
        <a href={profile.socials[1].href} aria-label="LinkedIn" target="_blank" rel="noreferrer">
          <LinkedInIcon />
        </a>
        <a className="resume-link" href={profile.resumePath}>
          Resume
        </a>
      </div>

      <button
        className="mobile-toggle"
        type="button"
        aria-label="Toggle menu"
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
      >
        {open ? <X size={20} /> : <Menu size={20} />}
      </button>

      {open ? (
        <nav className="mobile-nav" aria-label="Mobile navigation">
          {navItems.map((item) => (
            <a
              key={item.href}
              href={item.href}
              aria-current={activeSection === item.href ? "page" : undefined}
              onClick={() => setOpen(false)}
            >
              {item.label}
            </a>
          ))}
          <a href={profile.resumePath}>Resume</a>
        </nav>
      ) : null}
    </header>
  );
}
