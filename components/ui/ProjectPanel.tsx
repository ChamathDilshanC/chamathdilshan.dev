"use client";
import { useEffect, useRef } from "react";
import Image from "next/image";
import { ArrowUpRight, X } from "lucide-react";
import { portfolio } from "@/config/portfolio";
import { useExperience } from "@/stores/experience-store";
import { phaseAt } from "@/animation/character-animations";
import { journey } from "@/stores/experience-store";

export default function ProjectPanel() {
  const id = useExperience((s) => s.project);
  const set = useExperience((s) => s.set);
  const dialog = useRef<HTMLDialogElement>(null);
  const project = portfolio.projects.find((p) => p.id === id);
  useEffect(() => {
    const element = dialog.current;
    if (!element || !id) return;
    const previous = document.activeElement as HTMLElement | null;
    element.showModal();
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      element.close();
      document.body.style.overflow = overflow;
      previous?.focus();
    };
  }, [id]);
  const close = () => set({ project: null, phase: phaseAt(journey.progress) });
  return (
    <dialog
      className="project-dialog"
      ref={dialog}
      aria-labelledby="project-title"
      onCancel={close}
      onClick={(e) => {
        if (e.target === e.currentTarget) close();
      }}
    >
      {project && (
        <div className="project-panel" data-lenis-prevent>
          <div className="panel-top">
            <span className="eyebrow">Field study / {project.category}</span>
            <button
              className="icon-button"
              onClick={close}
              aria-label="Close project"
            >
              <X size={22} />
            </button>
          </div>
          <span className="sample-label">
            Illustrative project · placeholder content
          </span>
          <h2 id="project-title">{project.name}</h2>
          <p className="panel-summary">{project.summary}</p>
          <div className="tags">
            {project.stack.map((item) => (
              <span key={item}>{item}</span>
            ))}
          </div>
          <div className="panel-rule" />
          <h3>The problem</h3>
          <p>{project.problem}</p>
          <h3>The approach</h3>
          <p>{project.solution}</p>
          <h3>Architecture</h3>
          <ol className="architecture">
            {project.architecture.map((item, i) => (
              <li key={item}>
                <span>0{i + 1}</span>
                {item}
              </li>
            ))}
          </ol>
          <h3>Key features</h3>
          <ul className="feature-list">
            {project.features.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
          {project.screenshots.length > 0 ? (
            project.screenshots.map((shot: { src: string; alt: string }) => (
              <Image
                key={shot.src}
                src={shot.src}
                alt={shot.alt}
                width={900}
                height={560}
              />
            ))
          ) : (
            <p className="sample-label">
              Project imagery will appear here when this case study is
              published.
            </p>
          )}
          <div className="panel-actions">
            {project.demo ? (
              <a
                className="text-link"
                href={project.demo}
                target="_blank"
                rel="noreferrer"
              >
                Live project <ArrowUpRight size={16} />
              </a>
            ) : (
              <span className="unpublished">Live project · forthcoming</span>
            )}
            {project.github ? (
              <a
                className="text-link"
                href={project.github}
                target="_blank"
                rel="noreferrer"
              >
                GitHub <ArrowUpRight size={16} />
              </a>
            ) : (
              <span className="unpublished">Source · forthcoming</span>
            )}
          </div>
          <button className="text-link" onClick={close}>
            Return to the journey <span>↗</span>
          </button>
        </div>
      )}
    </dialog>
  );
}
