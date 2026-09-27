import Experience from "@/components/ui/Experience";
import VehicleSelector from "@/components/ui/VehicleSelector";
import { portfolio } from "@/config/portfolio";
export const revalidate = 3600;
export default function HomePage() {
  return (
    <Experience>
      <section
        id="journey"
        className="chapter hero"
        aria-labelledby="hero-title"
      >
        <p className="hero-word" aria-hidden="true">
          CREATE
        </p>
        <div className="hero-kicker">
          <span />
          DIGITAL WORLDS / HUMAN SOFTWARE
        </div>
        <div className="hero-copy">
          <p className="hero-overline">CREATIVE SOFTWARE ENGINEER</p>
          <h1 id="hero-title">
            Build less noise.
            <br />
            <em>More meaning.</em>
          </h1>
          <p className="hero-intro">{portfolio.profile.intro}</p>
          <div className="hero-actions-row">
            <a className="hero-cta" href="#projects">
              Explore my work <span>↗</span>
            </a>
            <VehicleSelector />
          </div>
        </div>
        <aside className="hero-card">
          <p className="hero-card-label">CHAMATH DILSHAN</p>
          <h2>Software with a sense of place.</h2>
          <p>
            {portfolio.profile.statement[0]} {portfolio.profile.statement[1]}
          </p>
          <span className="hero-card-rule" />
          <p className="hero-card-note">
            INTERFACES / SYSTEMS / 3D EXPERIENCES
          </p>
        </aside>
        <div className="hero-side-note">
          <span>THOUGHTFUL CODE</span>
          <span>ENDURING EXPERIENCES</span>
        </div>
        <div className="hero-footer">
          <span>© 2026 CHAMATH DILSHAN</span>
          <span>SCROLL TO EXPLORE ↓</span>
          <span>{portfolio.profile.location}</span>
        </div>
      </section>
      <section
        id="projects"
        className="chapter projects-chapter"
        aria-label="Scene two"
      />
      <section
        id="passage"
        className="chapter passage"
        aria-label="Scene three"
      />
      <section
        id="skills"
        className="chapter skills-chapter"
        aria-label="Scene four"
      />
      <section
        id="experience"
        className="chapter experience-chapter"
        aria-label="Scene five"
      />
      <section
        id="about"
        className="chapter about-chapter"
        aria-label="Scene six"
      />
      <section
        id="contact"
        className="chapter contact-chapter"
        aria-label="Scene seven"
      />
    </Experience>
  );
}
