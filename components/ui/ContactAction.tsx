"use client";
import { useState } from "react";
import { ArrowUpRight } from "lucide-react";
import { portfolio } from "@/config/portfolio";
export default function ContactAction() {
  const [message, setMessage] = useState(false);
  return (
    <>
      {portfolio.contact.configured ? (
        <a className="contact-link" href={`mailto:${portfolio.contact.email}`}>
          {portfolio.contact.cta}
          <ArrowUpRight size={26} />
        </a>
      ) : (
        <button className="contact-link" onClick={() => setMessage(true)}>
          {portfolio.contact.cta}
          <ArrowUpRight size={26} />
        </button>
      )}
      {message && (
        <p role="status" className="contact-status">
          This portfolio is awaiting its owner’s contact details. A conversation
          link will be available here soon.
        </p>
      )}
    </>
  );
}
