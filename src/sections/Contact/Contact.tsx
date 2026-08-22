import { Mail, MapPin, Phone } from "lucide-react";
import { profile } from "../../data/profile";

export function Contact() {
  return (
    <section className="section contact-section" id="contact">
      <div className="contact-panel">
        <p className="section-kicker">Contact</p>
        <h2>Have something interesting to build?</h2>
        <p>
          Reach Andres directly for software engineering work involving modern interfaces, backend
          systems, APIs, automation, or operational technology.
        </p>
        <div className="contact-links">
          <a href={`mailto:${profile.email}`}>
            <Mail size={18} /> {profile.email}
          </a>
          <a href={`tel:${profile.phone.replaceAll("-", "")}`}>
            <Phone size={18} /> {profile.phone}
          </a>
          <span>
            <MapPin size={18} /> {profile.location}
          </span>
          <a href={profile.socials[0].href} target="_blank" rel="noreferrer">
            GH GitHub
          </a>
          <a href={profile.socials[1].href} target="_blank" rel="noreferrer">
            IN LinkedIn
          </a>
        </div>
      </div>
    </section>
  );
}
