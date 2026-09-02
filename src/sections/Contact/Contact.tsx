import { profile } from "../../data/profile";
import "./Contact.css";

export function Contact() {
  return (
    <section className="band" id="contact" aria-labelledby="contact-heading">
      <div className="band-inner">
        <div className="band-row">
          <div className="band-rail">
            <span className="rail-note">Contact</span>
          </div>
          <div className="band-body">
            {/*
              The address is the heading. There is nothing to say here that the
              address does not already say, so nothing else is said.
            */}
            <h2 className="band-title contact-address" id="contact-heading">
              <a className="contact-mail" href={`mailto:${profile.email}`}>
                {profile.email}
              </a>
            </h2>

            <p className="contact-meta">
              {profile.location}
              <span className="contact-sep" aria-hidden="true" />
              <a className="contact-tel" href={`tel:${profile.phone.replaceAll("-", "")}`}>
                {profile.phone}
              </a>
            </p>

            <div className="link-row contact-links">
              {profile.socials.map((social) => (
                <a
                  className="link"
                  key={social.href}
                  href={social.href}
                  target="_blank"
                  rel="noreferrer"
                >
                  {social.label}
                </a>
              ))}
              <a className="link" href={profile.resumePath}>
                Résumé
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
