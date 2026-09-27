"use client";
import { portfolio } from "@/config/portfolio";
import { useExperience } from "@/stores/experience-store";
export default function Skills() {
  const skill = useExperience((s) => s.skill);
  const selected = portfolio.skills[skill]!;
  return (
    <div className="skills-discovery">
      <div
        className="skill-landmarks"
        role="tablist"
        aria-label="Skill landmarks"
      >
        {portfolio.skills.map((item, i) => (
          <button
            key={item.name}
            role="tab"
            id={`skill-tab-${i}`}
            aria-selected={skill === i}
            aria-controls={`skill-panel-${i}`}
            tabIndex={skill === i ? 0 : -1}
            onClick={() => useExperience.getState().set({ skill: i })}
            onKeyDown={(e) => {
              if (["ArrowRight", "ArrowLeft", "Home", "End"].includes(e.key)) {
                e.preventDefault();
                const next =
                  e.key === "Home"
                    ? 0
                    : e.key === "End"
                      ? 5
                      : (skill + (e.key === "ArrowRight" ? 1 : 5)) % 6;
                useExperience.getState().set({ skill: next });
                document.getElementById(`skill-tab-${next}`)?.focus();
              }
            }}
          >
            <span className="skill-symbol" aria-hidden="true">
              {item.symbol}
            </span>
            <span>{item.name}</span>
          </button>
        ))}
      </div>
      <div
        className="skill-detail"
        role="tabpanel"
        id={`skill-panel-${skill}`}
        aria-labelledby={`skill-tab-${skill}`}
        tabIndex={0}
      >
        <p className="eyebrow">{selected.landmark}</p>
        <h3>{selected.name}</h3>
        <p>{selected.description}</p>
        <div className="tags">
          {selected.items.map((item) => (
            <span key={item}>{item}</span>
          ))}
        </div>
      </div>
      <div className="sr-only">
        {portfolio.skills.map((group) => (
          <p key={group.name}>
            {group.name}: {group.items.join(", ")}
          </p>
        ))}
      </div>
    </div>
  );
}
