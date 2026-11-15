import { NextResponse } from "next/server";

/**
 * Contact form endpoint.
 * With RESEND_API_KEY + CONTACT_TO_EMAIL set (see .env.example) it sends a real email via Resend.
 * Without them it answers 503 { fallback: "mailto" } and the form opens the visitor's mail app instead,
 * so the form always works.
 */
export async function POST(req: Request) {
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid request" }, { status: 400 });
  }

  const str = (v: unknown, max: number) => (typeof v === "string" ? v.trim().slice(0, max) : "");
  const name = str(body.name, 120);
  const email = str(body.email, 200);
  const topic = str(body.topic, 60);
  const message = str(body.message, 5000);
  const honeypot = str(body.website, 200);

  // Bots fill the hidden field; pretend success
  if (honeypot) return NextResponse.json({ ok: true });

  if (!name || !message || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ ok: false, error: "Please fill in your name, a valid email and a message." }, { status: 422 });
  }

  const key = process.env.RESEND_API_KEY;
  const to = process.env.CONTACT_TO_EMAIL;
  if (!key || !to) {
    return NextResponse.json({ ok: false, fallback: "mailto" }, { status: 503 });
  }

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from: process.env.CONTACT_FROM_EMAIL || "Portfolio <onboarding@resend.dev>",
      to: [to],
      reply_to: email,
      subject: `[Portfolio] ${topic || "Message"} — ${name}`,
      text: `From: ${name} <${email}>\nTopic: ${topic}\n\n${message}`,
    }),
  });

  if (!res.ok) {
    return NextResponse.json({ ok: false, fallback: "mailto" }, { status: 502 });
  }
  return NextResponse.json({ ok: true });
}
