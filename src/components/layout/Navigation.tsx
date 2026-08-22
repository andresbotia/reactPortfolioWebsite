import { Menu, X } from "lucide-react";
import { useEffect, useState } from "react";
import { profile } from "../../data/profile";

const navItems = [
  { label: "About", href: "#about" },
  { label: "Experience", href: "#experience" },
  { label: "Work", href: "#work" },
  { label: "Stack", href: "#stack" },
  { label: "Contact", href: "#contact" },
];

export function Navigation() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className={`site-nav ${scrolled ? "site-nav--scrolled" : ""}`}>
      <a className="brand" href="#top" aria-label="Andres Botia home">
        <span>{profile.initials}</span>
      </a>

      <nav className="desktop-nav" aria-label="Main navigation">
        {navItems.map((item) => (
          <a key={item.href} href={item.href}>
            {item.label}
          </a>
        ))}
      </nav>

      <div className="nav-actions">
        <a href={profile.socials[0].href} aria-label="GitHub" target="_blank" rel="noreferrer">
          GH
        </a>
        <a href={profile.socials[1].href} aria-label="LinkedIn" target="_blank" rel="noreferrer">
          IN
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
            <a key={item.href} href={item.href} onClick={() => setOpen(false)}>
              {item.label}
            </a>
          ))}
          <a href={profile.resumePath}>Resume</a>
        </nav>
      ) : null}
    </header>
  );
}
