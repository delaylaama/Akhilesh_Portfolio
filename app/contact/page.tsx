import type { Metadata } from "next";
import { ContactConsole } from "@/components/contact/ContactConsole";
import { PageHeader } from "@/components/ui/PageHeader";
import { site } from "@/content/site";

export const metadata: Metadata = { title: "Contact", description: `Get in touch with ${site.name}.` };

export default function ContactPage() {
  return (
    <div className="world-bg min-h-screen">
      <PageHeader eyebrow="Final stage · Save & continue" title={<>Let&apos;s make <em className="text-gold">something</em></>} lede="Projects, roles, collaborations or a quick hello — the inbox is always open." />
      <ContactConsole />
    </div>
  );
}
