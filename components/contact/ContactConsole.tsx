"use client";

import Link from "next/link";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { nav, site } from "@/content/site";
import { useGame } from "@/components/providers/GameProvider";

const TOPICS = ["New project", "Job opportunity", "Collaboration", "Just saying hi"];

type Status = "idle" | "sending" | "sent" | "mailto" | "error";

export function ContactConsole() {
  const { sfx, visited } = useGame();
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const links = site.contact.links.filter((l) => l.href);
  const explored = nav.filter((n) => visited.includes(n.key)).length;

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(site.contact.email);
      setCopied(true);
      sfx("coin");
      setTimeout(() => setCopied(false), 1600);
    } catch {
      /* clipboard blocked: the mailto link still works */
    }
  };

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const data = Object.fromEntries(new FormData(form)) as Record<string, string>;
    setError("");
    setStatus("sending");
    sfx("select");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const json = await res.json().catch(() => ({}));
      if (res.ok && json.ok) {
        setStatus("sent");
        sfx("secret");
        form.reset();
        return;
      }
      if (json.fallback === "mailto") {
        // No mail service configured: hand the message to the visitor's own mail app.
        const subject = encodeURIComponent(`${data.topic || "Hello"} — ${data.name}`);
        const body = encodeURIComponent(`${data.message}\n\n— ${data.name} (${data.email})`);
        window.location.href = `mailto:${site.contact.email}?subject=${subject}&body=${body}`;
        setStatus("mailto");
        return;
      }
      setError(json.error || "Something went wrong. Please email directly.");
      setStatus("error");
      sfx("error");
    } catch {
      setError("Couldn't reach the server. Please email directly.");
      setStatus("error");
      sfx("error");
    }
  };

  return (
    <div className="mx-auto grid max-w-[1400px] gap-10 px-5 pb-24 md:px-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,36rem)]">
      {/* Left: direct links + progress */}
      <div className="space-y-10">
        <div>
          <p className="font-pixel text-[10px] uppercase tracking-widest text-dim">Direct line</p>
          <a href={`mailto:${site.contact.email}`} className="mt-2 block break-all font-serif text-4xl text-ink underline decoration-gold decoration-2 underline-offset-8 hover:text-gold md:text-5xl">
            {site.contact.email}
          </a>
          <button type="button" onClick={copy} className="mt-4 font-pixel text-[10px] uppercase tracking-wider text-dim hover:text-gold" aria-live="polite">
            {copied ? "✓ Copied" : "Copy address"}
          </button>
        </div>

        {links.length > 0 && (
          <ul className="flex flex-wrap gap-2">
            {links.map((l) => (
              <li key={l.label}>
                <a href={l.href} target="_blank" rel="noreferrer" className="btn-pixel text-[10px]">
                  {l.label} ↗
                </a>
              </li>
            ))}
            {site.contact.resume && (
              <li>
                <a href={site.contact.resume} className="btn-pixel text-[10px]" download>
                  Résumé ↓
                </a>
              </li>
            )}
          </ul>
        )}

        <div className="pixel-box max-w-md p-5">
          <p className="font-pixel text-[10px] uppercase tracking-widest text-dim">Progress</p>
          <p className="mt-2 font-term text-2xl text-ink">
            Areas explored {explored}/{nav.length}
          </p>
          <ul className="mt-3 grid grid-cols-6 gap-1.5">
            {nav.map((n) => {
              const done = visited.includes(n.key);
              return (
                <li key={n.key}>
                  <Link href={n.href} title={n.label} className={`block h-3 ${done ? "bg-mint" : "bg-panel-2 hover:bg-line"}`}>
                    <span className="sr-only">
                      {n.label} {done ? "(visited)" : "(not visited)"}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
          <p className="mt-3 font-term text-lg leading-snug text-dim">
            {explored >= nav.length ? "100% complete. You've seen everything — now say hello." : "Still a few rooms left — or skip straight to saying hello."}
          </p>
        </div>

        <p className="flex items-center gap-2 font-pixel text-[10px] uppercase text-mint">
          <span className="blink">●</span> {site.status} · {site.location}
        </p>
      </div>

      {/* Right: mail client */}
      <section aria-labelledby="mail-title" className="pixel-box">
        <div className="flex items-center gap-3 bg-panel-2 px-4 py-2">
          <span className="flex gap-1.5" aria-hidden="true">
            <span className="h-3 w-3 bg-pink" />
            <span className="h-3 w-3 bg-gold" />
            <span className="h-3 w-3 bg-mint" />
          </span>
          <h2 id="mail-title" className="font-pixel text-[11px] uppercase tracking-wider text-ink">
            Mail.exe — New message
          </h2>
        </div>

        <AnimatePresence mode="wait" initial={false}>
          {status === "sent" || status === "mailto" ? (
            <motion.div key="done" initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} className="px-6 py-14 text-center" role="status">
              <p className="font-pixel text-2xl uppercase text-gold md:text-3xl">{status === "sent" ? "Mission complete" : "Almost there"}</p>
              <p className="mx-auto mt-4 max-w-sm font-term text-xl text-dim">
                {status === "sent"
                  ? "Message delivered. Expect a reply within a couple of days."
                  : "Your mail app should have opened with the message ready — just press send there."}
              </p>
              <div className="mt-8 flex flex-wrap justify-center gap-3">
                <button type="button" onClick={() => setStatus("idle")} className="btn-pixel text-[10px]">
                  Write another
                </button>
                <Link href="/" className="btn-pixel btn-pixel--gold text-[10px]">
                  Back to studio
                </Link>
              </div>
            </motion.div>
          ) : (
            <motion.form key="form" onSubmit={submit} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4 p-5 md:p-6" noValidate={false}>
              <div className="flex items-baseline gap-3 border-b-2 border-line pb-3 font-term text-lg">
                <span className="w-16 text-dim">To:</span>
                <span className="truncate text-ink">{site.name}</span>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Your name" name="name" autoComplete="name" required />
                <Field label="Your email" name="email" type="email" autoComplete="email" required />
              </div>
              <label className="block">
                <span className="font-pixel text-[10px] uppercase tracking-wider text-dim">Topic</span>
                <select name="topic" className="mt-1.5 w-full bg-void px-3 py-2.5 font-term text-xl text-ink ring-2 ring-line focus:ring-gold" defaultValue={TOPICS[0]}>
                  {TOPICS.map((t) => (
                    <option key={t}>{t}</option>
                  ))}
                </select>
              </label>
              <label className="block">
                <span className="font-pixel text-[10px] uppercase tracking-wider text-dim">Message</span>
                <textarea
                  name="message"
                  required
                  rows={6}
                  maxLength={5000}
                  className="mt-1.5 w-full resize-y bg-void px-3 py-2.5 text-base leading-relaxed text-ink ring-2 ring-line placeholder:text-line focus:outline-none focus:ring-gold"
                  placeholder="Tell me about the project, timeline, or just say hi."
                />
              </label>
              {/* Honeypot — hidden from people, tempting to bots */}
              <input type="text" name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden="true" />

              {status === "error" && (
                <p role="alert" className="bg-pink/15 px-3 py-2 font-term text-lg text-pink">
                  {error}
                </p>
              )}

              <div className="flex items-center gap-4 pt-1">
                <button type="submit" disabled={status === "sending"} className="btn-pixel btn-pixel--gold text-xs disabled:opacity-70">
                  {status === "sending" ? "Sending…" : "Send ▶"}
                </button>
                {status === "sending" && (
                  <div className="flex flex-1 gap-1" aria-hidden="true">
                    {Array.from({ length: 10 }).map((_, i) => (
                      <motion.span key={i} className="h-3 flex-1 bg-mint" initial={{ opacity: 0.15 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.08, repeat: Infinity, repeatType: "reverse", duration: 0.4 }} />
                    ))}
                  </div>
                )}
              </div>
            </motion.form>
          )}
        </AnimatePresence>
      </section>
    </div>
  );
}

function Field({ label, ...props }: { label: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className="block">
      <span className="font-pixel text-[10px] uppercase tracking-wider text-dim">{label}</span>
      <input {...props} className="mt-1.5 w-full bg-void px-3 py-2.5 text-base text-ink ring-2 ring-line focus:outline-none focus:ring-gold" />
    </label>
  );
}
